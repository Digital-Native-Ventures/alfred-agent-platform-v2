#!/bin/bash
# Setup Cloudflare Tunnel for n8n webhooks

echo "📡 Setting up Cloudflare Tunnel..."

# Check if cloudflared is already installed
if command -v cloudflared &> /dev/null; then
    echo "✅ cloudflared is already installed"
else
    echo "📥 Installing cloudflared..."
    curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
    chmod +x cloudflared
    sudo mv cloudflared /usr/local/bin/
    echo "✅ cloudflared installed"
fi

echo ""
echo "🔑 Next steps in Cloudflare Dashboard:"
echo "1. Go to: Zero Trust → Access → Tunnels"
echo "2. Click: 'Create a tunnel'"
echo "3. Name it: 'n8n-webhook'"
echo "4. Copy the token from the dashboard"
echo ""
echo "Then run ONE of these options:"
echo ""
echo "Option 1 - Install as service (recommended):"
echo "sudo cloudflared service install <YOUR_TUNNEL_TOKEN>"
echo ""
echo "Option 2 - Run with Docker:"
echo "docker run -d --name cloudflared \\"
echo "  --network alfred-network \\"
echo "  cloudflare/cloudflared:latest \\"
echo "  tunnel run --token <YOUR_TUNNEL_TOKEN>"
echo ""
echo "Option 3 - Run directly:"
echo "cloudflared tunnel run --token <YOUR_TUNNEL_TOKEN>"