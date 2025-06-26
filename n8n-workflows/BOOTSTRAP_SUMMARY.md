# n8n AI-Task Workflow Bootstrap Summary

## Current Status
Working on fixing n8n workflow to process GitHub issues labeled with 'ai-task'. The workflow was stuck processing issue #871 even when testing with #883.

## Key Issues Resolved
1. ✅ Created task-queue.md file at `/scripts/tasks/task-queue.md`
2. ✅ Fixed webhook response code (must be number, not string)
3. ✅ Fixed IF node expression evaluation issues
4. ✅ Fixed planner API URL (changed from `http://planner-api:8084` to `http://localhost:8084`)
5. ✅ Fixed GitHub file path to `scripts/tasks/task-queue.md`

## Current Workflow
- **File**: `/home/locotoki/projects/alfred-agent-platform-v2/n8n-workflows/ai-task-direct-workflow.json`
- **Name**: "AI-Task Direct Pipeline"
- **Webhook Path**: `POST /webhook/ai-task-webhook`
- **Status**: Active and receiving webhooks

## Workflow Flow
1. GitHub Webhook → receives issue events
2. Extract Issue Data → checks for ai-task label and extracts issue info
3. Call Planner → sends issue number to planner API
4. Format Task Entry → creates formatted task line
5. Get Current Queue → reads task-queue.md from GitHub
6. Append Task → adds new task if not already present
7. Check Skip → determines if update needed
8. Update Queue File → commits changes to GitHub
9. Success Response → returns completion status

## Test Command
```bash
cd /home/locotoki/projects/alfred-agent-platform-v2/scripts
./test-webhook.sh  # Tests with issue #883
```

## Next Steps
1. Verify all nodes show issue #883 (not #871)
2. Check if task is properly appended to task-queue.md
3. Ensure GitHub commit is created successfully
4. Set up persistent webhook URL (Cloudflare Tunnel or ngrok)

## Key Files
- Test script: `/scripts/test-webhook.sh`
- Task queue: `/scripts/tasks/task-queue.md`
- Workflow: `/n8n-workflows/ai-task-direct-workflow.json`
- Debug code: `/n8n-workflows/debug-webhook-data.js`

## Docker Services
- n8n: http://localhost:5678
- Planner API: http://localhost:8084
- LocalTunnel (when active): https://alfred-n8n.loca.lt

## Credentials Needed
- GitHub API token with repo access
- Set in n8n as "GitHub API" credential

## Common Issues
- LocalTunnel drops frequently - use `pkill -f "lt --port 5678" && lt --port 5678 --subdomain alfred-n8n &`
- If webhook returns 404, check workflow is activated
- If nodes show old data, check for pinned test data in nodes