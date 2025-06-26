#!/bin/bash
# Debug n8n webhook execution

echo "🔍 Debugging n8n webhook flow..."

# Test 1: Check if webhook is reachable
echo -e "\n1️⃣ Testing webhook endpoint:"
curl -s -o /dev/null -w "%{http_code}" https://alfred-n8n.loca.lt/webhook/ai-task-webhook \
  -X POST -H "Content-Type: application/json" \
  -d '{"test": true}'
echo " - Webhook response code"

# Test 2: Check planner-api directly
echo -e "\n2️⃣ Testing planner-api directly:"
curl -s -X POST http://localhost:8084/plan \
  -H "Content-Type: application/json" \
  -d '{"issue": "871"}' | jq .

# Test 3: Check from inside docker network
echo -e "\n3️⃣ Testing planner-api from docker network:"
docker exec alfred-agent-platform-v2-n8n-1 wget -qO- --post-data='{"issue":"871"}' \
  --header='Content-Type: application/json' \
  http://planner-api:8084/plan 2>&1 || echo "Failed to reach planner-api from n8n container"

# Test 4: Check container connectivity
echo -e "\n4️⃣ Checking network connectivity:"
docker exec alfred-agent-platform-v2-n8n-1 ping -c 1 planner-api 2>&1 | grep -E "(bytes from|not known)" || echo "Cannot ping planner-api"

echo -e "\n✅ Debug complete"