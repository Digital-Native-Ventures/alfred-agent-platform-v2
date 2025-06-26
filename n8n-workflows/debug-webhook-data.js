// Debug: Log all webhook data
const webhookData = $input.item.json;

// Log everything we receive
console.log('=== FULL WEBHOOK DATA ===');
console.log(JSON.stringify(webhookData, null, 2));

// Check different possible data locations
console.log('\n=== CHECKING DATA LOCATIONS ===');
console.log('Direct issue:', webhookData.issue ? 'YES' : 'NO');
console.log('Body issue:', webhookData.body?.issue ? 'YES' : 'NO');
console.log('Headers:', Object.keys(webhookData.headers || {}));

// Try to find issue data
let issue = null;
if (webhookData.body && typeof webhookData.body === 'string') {
  try {
    const parsed = JSON.parse(webhookData.body);
    issue = parsed.issue;
    console.log('Found issue in parsed body');
  } catch (e) {
    console.log('Body is not valid JSON');
  }
} else if (webhookData.body && webhookData.body.issue) {
  issue = webhookData.body.issue;
  console.log('Found issue in body object');
} else if (webhookData.issue) {
  issue = webhookData.issue;
  console.log('Found issue directly');
}

// Return data for debugging
return [{
  json: {
    webhookDataKeys: Object.keys(webhookData),
    hasIssue: !!issue,
    issueNumber: issue?.number || 'NOT FOUND',
    labels: issue?.labels || [],
    rawData: webhookData
  }
}];