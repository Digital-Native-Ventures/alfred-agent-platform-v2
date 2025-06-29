"""Main entry point for diagnostics bot"""

import asyncio
import os
from typing import Any

import structlog
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler
from slack_bolt.app.async_app import AsyncApp

from alfred.slack.diagnostics.bot import DiagnosticsBot

logger = structlog.get_logger()


async def main() -> None:
    """Run the diagnostics bot"""
    # Initialize Slack app
    app = AsyncApp(
        token=os.environ.get("SLACK_BOT_TOKEN"),
        signing_secret=os.environ.get("SLACK_SIGNING_SECRET"),
    )

    # Initialize diagnostics bot
    bot = DiagnosticsBot(
        slack_client=app.client,
        prometheus_url=os.environ.get("PROMETHEUS_URL", "http://prometheus:9090"),
        enabled=True,
    )

    # Register slash command handler
    @app.command("/diag")
    async def handle_diag_command(ack: Any, command: Any, logger: Any) -> None:
        await ack()
        try:
            await bot.handle_command(
                command="/diag",
                channel=command["channel_id"],
                user=command["user_id"],
                text=command["text"],
            )
        except Exception as e:
            logger.error(f"Error handling command: {e}")

    # Register button action handlers
    @app.action("view_correlation")
    @app.action("ack_correlated")
    @app.action("silence_related")
    @app.action("ack_all_correlated")
    @app.action("silence_all_correlated")
    @app.action("escalate_to_pagerduty")
    async def handle_button_actions(ack: Any, body: Any, logger: Any) -> None:
        await ack()
        try:
            action = body["actions"][0]
            await bot.handle_button_action(
                action_id=action["action_id"],
                value=action["value"],
                user=body["user"]["id"],
                channel=body["channel"]["id"],
            )
        except Exception as e:
            logger.error(f"Error handling button action: {e}")

    # Socket mode setup if enabled
    if os.environ.get("SOCKET_MODE_ENABLED", "true").lower() == "true":
        handler = AsyncSocketModeHandler(
            app=app,
            app_token=os.environ.get("SLACK_APP_TOKEN"),
        )
        logger.info("Starting bot in socket mode...")
        # AsyncSocketModeHandler.start_async() returns None but type hints are missing
        await handler.start_async()  # type: ignore[no-untyped-call]
    else:
        # Web API mode
        logger.info("Starting bot in web API mode...")
        # app.start() actually returns None despite type hints suggesting otherwise
        await app.start(port=8080)  # type: ignore[func-returns-value]


if __name__ == "__main__":
    asyncio.run(main())
