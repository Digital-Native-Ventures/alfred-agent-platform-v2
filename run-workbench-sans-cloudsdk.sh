###############################################################################
# run-workbench-sans-cloudsdk.sh – final local start, skipping all gcloud deps
###############################################################################
set -euo pipefail

git checkout main
git pull --ff-only

# 1) minimal env
cat > .env <<'ENV'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
ENV
touch services/agent-orchestrator/.env.docker   # UI build needs this

# 2) auto-generate override scaling every Cloud-SDK image to zero
OVERRIDE=docker-compose.override.yml
echo "services:" > $OVERRIDE
docker compose config --format json | jq -r '.services | to_entries[] | select(.value.image|test("cloudsdktool")) | .key' |
while read svc; do
  echo "  $svc:"           >> $OVERRIDE
  echo "    deploy:"       >> $OVERRIDE
  echo "      replicas: 0" >> $OVERRIDE
done
echo "✅  Generated $OVERRIDE to disable Cloud-SDK images."

# 3) bring up only required stack (core + agents + modern UI)
docker compose down -v --remove-orphans || true
docker compose up -d --build --wait \
  db-postgres redis nats \
  architect-api agent-orchestrator planner-api reviewer-api summariser cost-api

# 4) health probes
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
echo "Workbench UI → http://localhost:5173"
docker compose ps --format table | grep -E 'agent-orchestrator|architect-api'

cat <<'DONE'

──────────────────────────────────────────────────────────────
Open http://localhost:5173

• Chat with Architect
• Hover header → click ↧
• Markdown downloads + toast "Chat exported ✨"

Logs:  docker compose logs -f agent-orchestrator architect-api
Stop:  docker compose down -v
──────────────────────────────────────────────────────────────
DONE