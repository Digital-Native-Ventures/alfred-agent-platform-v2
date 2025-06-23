#!/bin/bash
# Alfred Agent Platform v2 - Quick Restore Script
# Usage: ./scripts/quick_restore.sh

set -e

echo "🚀 Alfred Agent Platform v2 - Quick Restore"
echo "=========================================="

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please ensure you're in the project root directory."
    exit 1
fi

echo "✅ Found .env.local configuration"

# Start all services
echo "📦 Starting all services..."
docker compose --env-file .env.local up -d

# Wait for services to start
echo "⏳ Waiting for services to start (15 seconds)..."
sleep 15

# Run diagnostics
echo "🔍 Running health checks..."
echo

SERVICES=(8083 8084 8085 8086)
SERVICE_NAMES=("architect-api" "planner-api" "reviewer-api" "summariser-api")
ALL_HEALTHY=true

for i in "${!SERVICES[@]}"; do
    port=${SERVICES[$i]}
    name=${SERVICE_NAMES[$i]}
    
    if curl -s http://localhost:$port/healthz > /dev/null 2>&1; then
        echo "✅ $name (port $port) - healthy"
    else
        echo "❌ $name (port $port) - unhealthy"
        ALL_HEALTHY=false
    fi
done

echo

# Test chat functionality
echo "🤖 Testing AI chat functionality..."
if curl -s -X POST http://localhost:8083/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"System status check"}' | grep -q '"status":"ok"'; then
    echo "✅ Chat system working"
else
    echo "❌ Chat system not responding"
    ALL_HEALTHY=false
fi

echo

# Display access points
echo "🌐 Access Points:"
echo "- UI Console: http://localhost:3000"
echo "- API Documentation: http://localhost:8083/docs"
echo "- n8n Workflows: http://localhost:5678"
echo "- Architect API: http://localhost:8083"
echo

# Final status
if [ "$ALL_HEALTHY" = true ]; then
    echo "🎉 Platform fully operational!"
    echo "All AI workflow capabilities are now available."
else
    echo "⚠️  Some services need attention."
    echo "Check logs with: docker compose --env-file .env.local logs [service-name]"
fi

echo
echo "📖 For detailed operations guide, see: docs/SETUP_AND_OPERATIONS_GUIDE.md"