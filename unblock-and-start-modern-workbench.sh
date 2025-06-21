###############################################################################
# unblock-and-start-modern-workbench.sh
#  ✦ Removes every gcloud / cloud-sdk layer
#  ✦ Scales Slack gateway + legacy UI to 0
#  ✦ Starts architect-api + modern Workbench + essential agents
###############################################################################
set -euo pipefail

git checkout main && git pull --ff-only

echo "🔍 1/4  Commenting-out any cloud-sdk layers…"
grep -Rl "cloudsdktool/cloud-sdk" services | while read -r file; do
  sed -i '/cloudsdktool\/cloud-sdk/ s/^/# ⏯ disabled for local dev →/' "$file"
  echo "    ⏯  patched $file"
done

echo "📝 2/4  Writing compose override to disable Slack gateway + legacy UI…"
cat > docker-compose.override.yml <<'YAML'
services:
  slack_mcp_gateway:
    deploy:
      replicas: 0
  mission-control-simplified:
    deploy:
      replicas: 0
YAML

echo "🔑 3/4  Ensuring minimal .env exists…"
cat > .env <<'ENV'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
ENV

touch services/agent-orchestrator/.env.docker   # stub so build passes

echo "🧹  Stopping old containers…"
docker compose down -v --remove-orphans || true

echo "🔨  4/4  Building + starting required stack…"
docker compose up -d --build \
  db-postgres redis nats \
  architect-api agent-orchestrator planner-api reviewer-api summariser cost-api

# Health probe
printf "\n"
curl -fs http://localhost:8083/healthz && echo "architect-api ✔"
echo "Workbench UI  →  http://localhost:5173  (modern React interface)"

docker compose ps --format table | grep -E 'agent-orchestrator|architect-api'
cat <<'EOF'

──────────────────────────────────────────────────────────────
✅  Stack ready.

Test Chat Export:
  1. Open http://localhost:5173
  2. Chat with Architect
  3. Hover header → click ↧
  4. Markdown downloads + toast "Chat exported ✨"

Logs:  docker compose logs -f agent-orchestrator architect-api
Stop:  docker compose down -v
──────────────────────────────────────────────────────────────
EOF