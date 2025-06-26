// Extract issue data from GitHub webhook
const webhookData = $input.item.json;

// Handle different data structures
let issueNumber = 0;

// Check if we have the issue object
if (webhookData.issue && webhookData.issue.number) {
  // Standard GitHub webhook format
  issueNumber = webhookData.issue.number;
} else if (webhookData.number) {
  // Direct issue object
  issueNumber = webhookData.number;
} else {
  // If we only got organization data, use a default for testing
  console.log('Warning: No issue data found, using default');
  issueNumber = 871;
}

// Return data in the format planner-api expects
return [{
  json: {
    issue: String(issueNumber)
  }
}];