#!/bin/bash
# Setup LocalTunnel as a systemd service for reliability

echo "🔧 Setting up LocalTunnel as a system service..."

# Create systemd service file
sudo tee /etc/systemd/system/n8n-tunnel.service > /dev/null << 'EOF'
[Unit]
Description=LocalTunnel for n8n webhooks
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/home/$USER
ExecStart=/usr/bin/npx lt --port 5678 --subdomain alfred-n8n
Restart=always
RestartSec=10
StandardOutput=append:/var/log/n8n-tunnel.log
StandardError=append:/var/log/n8n-tunnel.log

[Install]
WantedBy=multi-user.target
EOF

# Replace $USER with actual username
sudo sed -i "s/\$USER/$USER/g" /etc/systemd/system/n8n-tunnel.service

echo "✅ Service file created"

# Create log file
sudo touch /var/log/n8n-tunnel.log
sudo chown $USER:$USER /var/log/n8n-tunnel.log

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable n8n-tunnel.service
sudo systemctl start n8n-tunnel.service

echo "✅ LocalTunnel service started"
echo ""
echo "📝 Service commands:"
echo "  Check status:  sudo systemctl status n8n-tunnel"
echo "  View logs:     sudo journalctl -u n8n-tunnel -f"
echo "  Restart:       sudo systemctl restart n8n-tunnel"
echo "  Stop:          sudo systemctl stop n8n-tunnel"
echo ""
echo "🌐 Your webhook URL: https://alfred-n8n.loca.lt/webhook/ai-task-webhook"