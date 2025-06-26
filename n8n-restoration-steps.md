# n8n Workflow Restoration Steps

## Current Status
✅ Phase 0: Database backup created (n8n-backup-20250625-090404.sql)
✅ Phase 1: Environment variables set, GitHub token validated
✅ Phase 2: Services are reachable (architect-api, planner-api)
⏳ Phase 3: Ready for workflow import

## Manual Steps Required in n8n UI

### 1. Access n8n UI
Open browser: http://localhost:5678

### 2. Import Workflows
1. Go to Workflows → Import from File
2. Import these files in order:
   - `./exports/alfred-session-2025-06-21/n8n-workflows/alfred-daily-digest-improved-v2.json`
   - `./exports/alfred-session-2025-06-21/n8n-workflows/alfred-daily-report-improved-v2.json`
   - `./exports/alfred-session-2025-06-21/n8n-workflows/alfred-next-prd-improved-v2.json`

### 3. Fix Credentials
For each imported workflow:
1. Open the workflow
2. Look for nodes with red error indicators
3. For each red node:
   - Click on the node
   - In credentials dropdown, create or select:
     - **Google Docs nodes**: Create OAuth2 credential
     - **HTTP nodes (architect-api)**: No auth needed (internal service)
     - **Slack nodes**: Skip for now (webhook not configured)

### 4. Update HTTP Node URLs
For HTTP nodes calling architect-api:
- Change URL from `http://architect-api:8083/export` to `http://architect-api:8083/daily-digest`
- Keep method as POST
- Body should be: `{"thread_id":"daily-{{ $workflow.name }}","messages":[]}`

### 5. Activate Workflows
After fixing all nodes:
1. Click the toggle in top-right to activate each workflow
2. Save the workflow

### 6. Test Execution
For the daily digest workflow:
1. Click "Execute Workflow" button
2. Check the output - should see the formatted daily digest
3. If Google Docs node fails, that's ok for testing

## Next Steps
Once workflows are imported and configured, we'll:
1. Create the AI-Spec E2E workflow (Phase 3.4)
2. Set up task queue integration (Phase 3.5)
3. Run smoke test with test issue (Phase 4)
4. Process real issue #871 (Phase 5)

## Service Endpoints Reference
- architect-api: http://architect-api:8083
  - /daily-digest - Returns combined PRD summary, reflection, and next PRD
  - /reflect/prd-summary - Returns just PRD summary
  - /reflect/architect - Returns architect reflection
- planner-api: http://planner-api:8084
  - /plan - Generates AI specs for issues
  - /next-prd - Returns next PRD suggestion