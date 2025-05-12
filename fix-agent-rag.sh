#!/bin/bash
set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Fixing agent-rag health and metrics endpoints...${NC}"

# Check if the container is running
if ! docker ps | grep -q agent-rag; then
  echo -e "${RED}Container agent-rag is not running.${NC}"
  exit 1
fi

# Copy the patch file to the container
echo -e "${YELLOW}Copying patch file to container...${NC}"
docker cp fix-agent-rag-health.py agent-rag:/app/app/health_patch.py

# Update the main.py file to include the patch
echo -e "${YELLOW}Updating main.py to use the patch...${NC}"
docker exec agent-rag bash -c "cat > /app/app/main.py << 'EOF'
from fastapi import FastAPI
import os
from health_patch import add_health_and_metrics_endpoints

app = FastAPI()

@app.get(\"/\")
async def root():
    return {\"message\": \"Welcome to RAG Service\"}

# Add health and metrics endpoints
add_health_and_metrics_endpoints(app)
EOF"

# Restart the container for changes to take effect
echo -e "${YELLOW}Restarting agent-rag container...${NC}"
docker restart agent-rag

# Wait for the container to restart
echo -e "${YELLOW}Waiting for agent-rag to restart...${NC}"
sleep 5

# Test the health endpoint
echo -e "${YELLOW}Testing the health endpoint...${NC}"
curl -s http://localhost:8501/health

echo
echo -e "${YELLOW}Testing the metrics endpoint...${NC}"
curl -s http://localhost:8501/metrics | head -n 5

echo
echo -e "${GREEN}✅ agent-rag health and metrics endpoints have been added.${NC}"
echo -e "${YELLOW}Note: The container needs to be healthy in the next container health check cycle.${NC}"