###############################################################################
# fresh-check-and-up.sh  –  list services, then start only architect-api + UI
###############################################################################
set -euo pipefail

## 0. Make sure we're on latest main and using Compose v2
git checkout main && git pull origin main
docker compose version >/dev/null || { echo "Need Docker Compose v2"; exit 1; }

echo "─────────────────────────────────────"
echo "🔍 Services defined in docker-compose.yml"
docker compose config --services | sort
echo "─────────────────────────────────────"

## 1. Minimal env (edit with real secrets later)
grep -q OPENAI_API_KEY .env 2>/dev/null || cat >> .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

## 2. Stop anything old
docker compose down -v --remove-orphans || true

## 3. Skip optional services that pull cloud-sdk / Slack stuff
KEEP="backend-api db-postgres redis nats"
echo "🚀  Starting only: $KEEP"
docker compose up -d --build --wait $KEEP

## 4. Show running containers + ports
echo "─────────────────────────────────────"
docker compose ps --format "table {{.Name}}\t{{.State}}\t{{.Publishers}}"
echo "─────────────────────────────────────"

## 5. Quick health probes
curl -fs http://localhost:8083/healthz && echo "backend-api ☑" || echo "backend-api not ready"

echo -e "\n🚀  Starting Workbench UI manually..."
cd services/agent-orchestrator && npm run dev > workbench.log 2>&1 &
sleep 3

echo -e "\n🎉  Workbench UI →  http://localhost:5173 (or check workbench.log for actual port)"
echo "   Chat → hover header → click ↧ → markdown download + toast."