###############################################################################
# full-automation-up.sh  –  upgrades repo & starts the complete dev loop
###############################################################################
set -euo pipefail

# 0️⃣  Pull the very latest main (contains helper agents)
git checkout main
git pull --ff-only origin main

# 1️⃣  Minimal secrets – edit the PAT line to your real token
cat > .env <<'ENV'
OPENAI_API_KEY=sk-test
GITHUB_TOKEN=<YOUR_GITHUB_PAT_WITH_REPO_SCOPE>
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
ENV
touch services/agent-orchestrator/.env.docker    # UI build needs this

# 2️⃣  Disable legacy / cloud-sdk services
cat > docker-compose.override.yml <<'YAML'
services:
  slack_mcp_gateway:          { deploy: { replicas: 0 } }
  pubsub-emulator:            { deploy: { replicas: 0 } }
  mission-control-simplified: { deploy: { replicas: 0 } }
  backend-api:                { deploy: { replicas: 0 } }
  ui-admin:                   { deploy: { replicas: 0 } }
YAML

# 3️⃣  Stop any leftover containers & volumes
docker compose down -v --remove-orphans || true

# 4️⃣  Build & start EVERYTHING you need for the full loop
docker compose up -d --build --wait \
  db-postgres redis nats \
  architect-api agent-orchestrator \
  planner-api reviewer-api summariser cost-api

# 5️⃣  Quick health probes
printf "\nHealth checks:\n"
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
curl -fs http://localhost:8082/healthz && echo "cost-api      ☑"

printf "\nRunning containers:\n"
docker compose ps --format table | grep -E 'agent-orchestrator|architect-api|planner-api|reviewer-api|summariser'

cat <<'NEXT'

──────────────────────────────────────────────────────────────
🎉  The full automated workflow is live!

Open Workbench UI →  http://localhost:5173

Test flow:
1. In Chat, ask Architect to draft a PRD.
2. Click "Merge PRD" → Planner creates GitHub issues automatically.
3. Push a dummy branch (e.g. feature/test) → Reviewer-API adds LLM review.
4. Merge PR → Summariser logs a summary event.
5. Hover chat header → click ↧ to verify Markdown export.

Logs (follow live):
  docker compose logs -f planner-api reviewer-api summariser

Shut down stack:
  docker compose down -v
──────────────────────────────────────────────────────────────
NEXT