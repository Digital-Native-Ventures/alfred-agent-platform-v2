#!/usr/bin/env python
"""
Entry point for the Slack app.
This is the script you run to start the app.
"""
import os
import sys
from threading import Thread

from dotenv import load_dotenv
from slack_bolt.adapter.socket_mode import SocketModeHandler

# Load environment variables from .env file
load_dotenv()

# Check if required environment variables are set
required_env_vars = ["SLACK_BOT_TOKEN", "SLACK_APP_TOKEN", "SLACK_SIGNING_SECRET"]
missing_vars = [var for var in required_env_vars if not os.getenv(var)]

if missing_vars:
    print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
    print("Please set these variables in a .env file or in your environment.")
    print("You can copy .env.template to .env and fill in the values.")
    sys.exit(1)

# Import the app
from app import app, flask_app

if __name__ == "__main__":
    # Start Flask app for health checks in a separate thread
    flask_thread = Thread(target=lambda: flask_app.run(host="0.0.0.0", port=3000))
    flask_thread.daemon = True
    flask_thread.start()

    # Start the Slack Bolt app
    try:
        if os.environ.get("SOCKET_MODE", "true").lower() == "true":
            # Get the app token and validate it starts with xapp-
            app_token = os.environ.get("SLACK_APP_TOKEN", "")
            if not app_token.startswith("xapp-"):
                print(
                    f"Warning: SLACK_APP_TOKEN doesn't start with 'xapp-'. Token: {app_token[:5]}..."
                )

            # Initialize and start the socket mode handler
            handler = SocketModeHandler(app, app_token)
            handler.start()
            print("⚡️ Bolt app is running! Connected to Slack via Socket Mode.")
            print(f"COMMAND_PREFIX: {os.environ.get('COMMAND_PREFIX', '/alfred')}")
            print(f"ALLOWED_COMMANDS: {os.environ.get('ALLOWED_COMMANDS', 'help,status')}")
        else:
            # HTTP mode - for production with events API
            app.start(port=3000)
            print("⚡️ Bolt app is running! Listening to HTTP events.")
    except Exception as e:
        print(f"Error starting Slack app: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)
