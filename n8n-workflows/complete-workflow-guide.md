# Complete AI-Spec Workflow Guide

## Current Workflow
1. GitHub Webhook → 
2. Extract Issue Data (Code) → 
3. Call Planner → 
4. Success (ends here)

## What's Missing
Need to add after "Call Planner":
1. Format Task for Queue
2. Get task-queue.md from GitHub  
3. Append new task
4. Update file in GitHub
5. Notify Slack (optional)

## Node Details to Add:

### 1. Code Node: "Format Task Entry"
```javascript
// Get planner response and issue data
const issueNumber = $('Extract Issue Data').item.json.issue;
const issueTitle = $('GitHub Webhook').item.json.issue.title || 'Task';

// Format the task line for task-queue.md
const taskId = String(issueNumber).padStart(3, '0');
const fileName = `task_${issueNumber}.sql`; // or appropriate file type
const description = issueTitle.substring(0, 80);

return [{
  json: {
    taskLine: `| [ ]    | ${taskId} | ${fileName.padEnd(40)} | ${description.padEnd(100)} |`,
    issueNumber: issueNumber,
    fileName: fileName
  }
}];
```

### 2. GitHub Node: "Get Current Queue"
- Operation: Get File
- Owner: `Digital-Native-Ventures`  
- Repository: `alfred-agent-platform-v2`
- File Path: `tasks/task-queue.md`
- Auth: GitHub credentials

### 3. Code Node: "Append Task"
```javascript
// Get current content
const currentContent = Buffer.from($json.content, 'base64').toString();
const newTaskLine = $('Format Task Entry').item.json.taskLine;

// Append new task
const updatedContent = currentContent.trimEnd() + '\n' + newTaskLine + '\n';

return [{
  json: {
    content: Buffer.from(updatedContent).toString('base64'),
    message: `chore: queue task #${$('Format Task Entry').item.json.issueNumber}`,
    sha: $json.sha
  }
}];
```

### 4. GitHub Node: "Update Queue File"  
- Operation: Update File
- Use data from previous node
- This will create a commit

### 5. Slack Node: "Notify Success" (Optional)
- Send webhook notification
- Message: Task queued successfully

## Testing the Complete Flow:
1. A GitHub issue with `ai-task` label triggers webhook
2. Planner creates AI-Spec  
3. Task gets added to task-queue.md
4. engineer_async.yml picks it up automatically
5. Full automation achieved!