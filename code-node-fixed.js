// Fixed Code node JavaScript for n8n workflow
const allInputs = $input.all();

const prdSummary = allInputs[0]?.json?.response || 'No PRD summary available';
const reflectSummary = allInputs[1]?.json?.response || 'No reflection available';
const nextPrd = allInputs[2]?.json?.response || 'No next PRD available';

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