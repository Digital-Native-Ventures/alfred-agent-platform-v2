# AI-Spec E2E Workflow Setup

Since you have a working n8n instance with the daily digest workflow, we need to create the AI-Spec E2E workflow that will handle the GitHub issue → Implementer pipeline.

## Workflow Blueprint

### 1. GitHub Webhook Trigger
- **Type**: Webhook node
- **HTTP Method**: POST
- **Path**: `/github-issue-webhook`
- **Response**: Immediately respond with 200 OK

### 2. Filter for AI-Task Label
- **Type**: IF node
- **Condition**: `{{ $json.issue.labels.some(l => l.name === 'ai-task') }}`
- **Also check**: `{{ $json.action === 'labeled' || $json.comment?.body.includes('APPROVED') }}`

### 3. Extract Issue Data
- **Type**: Code node
- **JavaScript**:
```javascript
const issue = $input.item.json.issue;
const comment = $input.item.json.comment;

return {
  json: {
    issue_id: issue.number,
    issue_title: issue.title,
    issue_body: issue.body,
    is_approval: comment?.body?.includes('APPROVED') || false,
    action: $input.item.json.action
  }
};
```

### 4. Router (Switch)
- **Type**: Switch node
- **Routes**:
  - Route 1: `{{ $json.action === 'labeled' }}` → Go to Planner
  - Route 2: `{{ $json.is_approval === true }}` → Go to Implementer Queue

### 5A. Call Planner API
- **Type**: HTTP Request
- **Method**: POST
- **URL**: `http://planner-api:8084/plan`
- **Body JSON**:
```json
{
  "issue": "{{ $json.issue_id }}"
}
```

### 5B. Wait for Approval
- **Type**: Wait node
- **Resume**: On webhook call
- **Webhook path**: `/architect-approved/{{ $json.issue_id }}`
- **Timeout**: 24 hours

### 6. Queue Implementer Task
- **Type**: Code node
- **JavaScript** (to add to task-queue.md):
```javascript
const issueId = $json.issue_id;
const issueTitle = $json.issue_title;

// This would need to be replaced with actual GitHub API call
// For now, return the task line that should be added
return {
  json: {
    task_line: `- [ ] #${issueId} – ${issueTitle}`,
    issue_id: issueId,
    message: `Task queued for implementer: #${issueId}`
  }
};
```

### 7. Update Task Queue (GitHub API)
- **Type**: HTTP Request
- **Method**: GET then PUT
- **URL**: `https://api.github.com/repos/Digital-Native-Ventures/alfred-agent-platform-v2/contents/tasks/task-queue.md`
- **Headers**:
  - Authorization: `Bearer {{ $credentials.githubApi.token }}`
- **Logic**: Get current file, append task line, update with new content

### 8. Success Notification
- **Type**: Code node
- **Output**: Success message with PR link when available

## Critical Configuration

### GitHub Webhook Setup
1. Go to GitHub repo settings → Webhooks
2. Add webhook:
   - Payload URL: `http://YOUR_SERVER:5678/webhook/github-issue-webhook`
   - Content type: `application/json`
   - Events: Issues, Issue comments
   - Active: ✓

### Required Credentials
1. **GitHub Personal Access Token**
   - Name: `github-api`
   - Scopes: `repo, workflow`
   - Token: Your GitHub PAT

## For Issue #871

Since issue #871 already has an APPROVED comment, you can:

1. Create this workflow
2. Manually trigger it with test data:
```json
{
  "action": "edited",
  "comment": {
    "body": "APPROVED"
  },
  "issue": {
    "number": 871,
    "title": "DB schema & migrations for chat_sessions + chat_messages tables",
    "labels": [{"name": "ai-task"}]
  }
}
```

This will queue the task for the engineer_async.yml workflow to pick up.