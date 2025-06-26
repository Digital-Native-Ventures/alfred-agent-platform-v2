// Extract issue data from webhook
const webhookData = $input.item.json;

// Log what we received
console.log('Received webhook data:', JSON.stringify(webhookData, null, 2));

// Check multiple data structures
let issue = null;
if (webhookData.body && webhookData.body.issue) {
  issue = webhookData.body.issue;
} else if (webhookData.issue) {
  issue = webhookData.issue;
}

if (!issue) {
  throw new Error('No issue data found in webhook payload');
}

// Check if this is an ai-task
const hasAiTaskLabel = issue.labels && 
  issue.labels.some(label => label.name === 'ai-task');

if (!hasAiTaskLabel) {
  throw new Error('Not an ai-task issue. Labels: ' + JSON.stringify(issue.labels));
}

return [{
  json: {
    issue: String(issue.number),
    issueNumber: issue.number,
    issueTitle: issue.title || '',
    issueBody: issue.body || '',
    labels: issue.labels.map(l => l.name)
  }
}];