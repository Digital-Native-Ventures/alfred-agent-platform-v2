###############################################################################
# bring-up-modern-workbench.sh  –  run Architect UI without Cloud-SDK services
###############################################################################
set -euo pipefail

git checkout main
git pull --ff-only

# ── .env with local defaults ─────────────────────────────────────────────────
cat > .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF
touch services/agent-orchestrator/.env.docker

# ── manually disable known Cloud-SDK services (since jq not available) ──────
OVERRIDE=docker-compose.override.yml
cat > $OVERRIDE <<'YAML'
services:
  pubsub-emulator:
    deploy:
      replicas: 0
YAML
echo "📝  $OVERRIDE disables Cloud-SDK services."

# ── stop leftovers & start required stack ────────────────────────────────────
docker compose down -v --remove-orphans || true
docker compose up -d --build --wait \
  db-postgres redis nats \
  backend-api ui-admin cost-api

# ── quick health probes ──────────────────────────────────────────────────────
curl -fs http://localhost:8083/healthz && echo "backend-api ☑" || echo "backend-api not ready"
curl -fs http://localhost:8082/healthz && echo "cost-api ☑" || echo "cost-api not ready"  
curl -fs http://localhost:5173 && echo "UI ☑" || echo "UI not ready"
echo "Workbench UI → http://localhost:5173"
docker compose ps --format table | grep -E 'ui-admin|backend-api|cost-api'