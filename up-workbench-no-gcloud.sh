###############################################################################
# up-workbench-no-gcloud.sh – start modern Workbench without Slack gateway
###############################################################################
set -euo pipefail

# 0 — latest main
git checkout main
git pull --ff-only origin main

# 1 — minimal .env (create if missing)
cat > .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

# 2 — stop anything stale
docker compose down -v --remove-orphans || true

# 3 — start core infrastructure first
docker compose up -d db-postgres redis nats

# 4 — try to start what we can build (skip problematic services)
docker compose build cost-api
docker compose up -d cost-api

# 5 — health probes & info
echo "🩺  Cost API: $(curl -fs http://localhost:8082/healthz 2>/dev/null | head -1 || echo 'Not ready')"
echo "Backend API: http://localhost:8083 (not running - requires Cloud SDK fix)"
echo "Workbench UI: requires backend API + additional setup"

docker compose ps --format table

cat <<'DONE'

🟡  Partial stack running - full Workbench blocked by Cloud SDK issue

Available services:
• PostgreSQL: localhost:5432
• Redis: localhost:6379  
• NATS: localhost:4222
• Cost API: localhost:8082

Logs:  docker compose logs -f cost-api
Stop:  docker compose down -v
DONE