###############################################################################
# start-chat-workbench.sh  –  Add Architect-API + modern UI to the running stack
#                           (skips pubsub & slack gateway that depend on cloud-sdk)
###############################################################################
set -euo pipefail

# 1) make sure override keeps Cloud-SDK images disabled
cat > docker-compose.override.yml <<'YAML'
services:
  slack_mcp_gateway:
    deploy: { replicas: 0 }
  pubsub-emulator:
    deploy: { replicas: 0 }
  mission-control-simplified:
    deploy: { replicas: 0 }
YAML

# 2) stub env needed by the React UI build
touch services/agent-orchestrator/.env.docker
grep -q OPENAI_API_KEY .env 2>/dev/null || cat >> .env <<'ENV'
OPENAI_API_KEY=sk-test
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
ENV

# 3) build & launch the missing pieces
docker compose up -d --build --wait \
  architect-api agent-orchestrator planner-api reviewer-api summariser

# 4) sanity probes
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
echo "Workbench UI → http://localhost:5173  (modern React interface)"

echo "🟢  Open the URL, chat with Architect, hover header, click ↧ – markdown downloads + toast."