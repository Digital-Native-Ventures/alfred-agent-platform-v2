#!/bin/bash
# Setup ngrok with static domain (requires paid account)

# Install ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Add your authtoken (get from https://dashboard.ngrok.com)
ngrok config add-authtoken YOUR_AUTH_TOKEN

# For paid accounts - reserve a domain
# ngrok http 5678 --domain=alfred-n8n.ngrok.app

# For free tier with consistent subdomain
cat > ~/.ngrok2/ngrok.yml << EOF
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
  n8n:
    proto: http
    addr: 5678
    # For paid accounts only:
    # hostname: alfred-n8n.ngrok.app
EOF

# Run with:
# ngrok start n8n