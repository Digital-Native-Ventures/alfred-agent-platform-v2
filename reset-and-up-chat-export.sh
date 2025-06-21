###############################################################################
# reset-and-up-chat-export.sh  –  start Architect API + modern Workbench only
###############################################################################
set -euo pipefail

# 0) Ensure we're on latest main
git checkout main
git pull --ff-only origin main

# 1) Kill the old backend-api (port 8083) if it's still around
docker compose stop backend-api 2>/dev/null || true
docker compose rm -f backend-api 2>/dev/null || true

# 2) Minimal env for local dev
cat > .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

# 3) Build what we can (skip UI that needs .env.docker)
docker compose build backend-api cost-api

# 4) Bring up core infra + available services
docker compose up -d \
  db-postgres redis nats \
  backend-api cost-api

# 5) Health probes
echo "🩺  backend-api   → $(curl -fs http://localhost:8083/healthz 2>/dev/null || echo 'Not ready')"
echo "🩺  cost-api      → $(curl -fs http://localhost:8082/healthz 2>/dev/null | head -1 || echo 'Not ready')"
docker compose ps --format table | grep -E 'backend-api|cost-api'

cat <<'DONE'

🟡  Backend services starting (UI needs additional setup)

Available endpoints:
- Backend API: http://localhost:8083 (if running)
- Cost API: http://localhost:8082

Logs (if needed):
  docker compose logs -f backend-api cost-api
Stop stack when done:
  docker compose down -v
DONE