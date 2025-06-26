# Next Steps for Issue #871

## Current Status
✅ n8n is running with a working daily digest workflow
✅ Architect has APPROVED the AI-Spec for issue #871
✅ All services (architect-api, planner-api) are reachable

## What Needs to Happen

Since issue #871 already has an APPROVED AI-Spec, we need to trigger the Implementer (engineer_async.yml workflow) to create the implementation PR.

## Option 1: Manual Task Queue Update (Quickest)

Add issue #871 to the task queue file to trigger the GitHub Action:

```bash
# Check if task-queue.md exists
cat tasks/task-queue.md

# Add the task (if not already there)
echo "- [ ] 871 | ai-task | DB schema & migrations for chat_sessions + chat_messages tables" >> tasks/task-queue.md

# Commit and push to trigger engineer_async.yml
git add tasks/task-queue.md
git commit -m "chore: queue task #871 for implementation"
git push
```

## Option 2: Create Simple Trigger Workflow in n8n

Create a minimal workflow in n8n UI:

1. **Manual Trigger** node
2. **Code** node with:
```javascript
return [{
  json: {
    issue_id: 871,
    task_line: "- [ ] 871 | ai-task | DB schema & migrations for chat_sessions + chat_messages tables"
  }
}];
```
3. **HTTP Request** node to update task-queue.md via GitHub API

## Option 3: Direct GitHub Action Trigger

If the engineer_async.yml workflow can be manually triggered:

```bash
gh workflow run engineer_async.yml \
  -f issue_number=871 \
  -f issue_title="DB schema & migrations for chat_sessions + chat_messages tables"
```

## Recommendation

Use **Option 1** - it's the simplest and most direct way to get issue #871 processed by the Implementer agent. The engineer_async.yml workflow will:
1. Pick up the task from task-queue.md
2. Use Claude 4 to implement the DB schema
3. Create a draft PR with the implementation
4. The Reviewer agent will then review it

After the task is added, monitor:
- GitHub Actions tab for the engineer_async run
- New PR creation for issue #871