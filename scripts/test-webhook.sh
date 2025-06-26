#!/bin/bash
# Test n8n webhook with a sample GitHub issue event

echo "🧪 Testing n8n webhook for issue #883..."
echo "📍 URL: http://localhost:5678/webhook/ai-task-webhook"
echo "📅 Timestamp: $(date)"

# Send test webhook with proper GitHub issue structure
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST http://localhost:5678/webhook/ai-task-webhook \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -H "X-GitHub-Delivery: test-883-$(date +%s)" \
  -d '{
    "action": "labeled",
    "issue": {
      "number": 883,
      "id": 2234567883,
      "node_id": "I_kwDOAbc883",
      "title": "RAG Audit: Quality Issues Detected",
      "body": "Create tables with pgvector support for semantic search",
      "labels": [
        {"name": "ai-task"},
        {"name": "enhancement"}
      ],
      "state": "open",
      "created_at": "2025-06-25T12:00:00Z",
      "updated_at": "2025-06-25T12:00:00Z",
      "user": {
        "login": "test-user",
        "id": 123456
      }
    },
    "repository": {
      "id": 123456789,
      "name": "alfred-agent-platform-v2",
      "full_name": "Digital-Native-Ventures/alfred-agent-platform-v2",
      "owner": {
        "login": "Digital-Native-Ventures",
        "id": 213583067
      }
    },
    "sender": {
      "login": "test-user",
      "id": 123456,
      "type": "User"
    },
    "organization": {
      "login": "Digital-Native-Ventures",
      "id": 213583067
    }
  }')

echo "📨 Response:"
echo "$response" | jq . 2>/dev/null || echo "$response"

echo ""
echo "✅ Check n8n Executions at: http://localhost:5678/executions"