#!/bin/bash
# Keep LocalTunnel alive with automatic restart

while true; do
    echo "🚀 Starting LocalTunnel..."
    lt --port 5678 --subdomain alfred-n8n
    echo "⚠️  Tunnel disconnected, restarting in 5 seconds..."
    sleep 5
done