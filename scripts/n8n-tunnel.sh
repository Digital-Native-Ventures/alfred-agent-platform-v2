#!/bin/bash
# Start/Stop LocalTunnel for n8n webhooks

case "$1" in
  start)
    echo "🚀 Starting LocalTunnel for n8n..."
    # Check if already running
    if pgrep -f "lt --port 5678" > /dev/null; then
      echo "✅ Tunnel already running at https://alfred-n8n.loca.lt"
    else
      nohup lt --port 5678 --subdomain alfred-n8n > ~/n8n-tunnel.log 2>&1 &
      echo $! > ~/n8n-tunnel.pid
      sleep 3
      echo "✅ Tunnel started at https://alfred-n8n.loca.lt"
      echo "📝 Logs: ~/n8n-tunnel.log"
    fi
    ;;
  stop)
    echo "🛑 Stopping LocalTunnel..."
    if [ -f ~/n8n-tunnel.pid ]; then
      kill $(cat ~/n8n-tunnel.pid) 2>/dev/null
      rm ~/n8n-tunnel.pid
      echo "✅ Tunnel stopped"
    else
      pkill -f "lt --port 5678"
      echo "✅ Tunnel processes killed"
    fi
    ;;
  status)
    if pgrep -f "lt --port 5678" > /dev/null; then
      echo "✅ Tunnel is running"
      echo "🌐 URL: https://alfred-n8n.loca.lt"
      echo "📝 Logs: tail -f ~/n8n-tunnel.log"
    else
      echo "❌ Tunnel is not running"
    fi
    ;;
  restart)
    $0 stop
    sleep 2
    $0 start
    ;;
  *)
    echo "Usage: $0 {start|stop|status|restart}"
    exit 1
    ;;
esac