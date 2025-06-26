// Code node JavaScript for new daily-digest API response
const response = $input.first().json;

// Extract the 3 report sections from new API structure
const prdSummary = response.prd_summary || 'No PRD summary available';
const reflectSummary = response.architect_reflection || 'No reflection available'; 
const nextPrd = response.next_prd || 'No next PRD available';

const currentDate = new Date().toISOString().split('T')[0];
const timestamp = new Date().toISOString();

const text = `---
## 📆 Daily Snapshot — ${currentDate}

### 🧾 PRD Summary
${prdSummary}

### 🧠 Architect Reflection
${reflectSummary}

### 🎯 Next PRD
${nextPrd}

_Logged by Alfred at ${timestamp}_
`;

return [{ json: { text: text } }];