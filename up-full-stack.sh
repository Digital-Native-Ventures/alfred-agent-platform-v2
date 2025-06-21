###############################################################################
# up-full-stack.sh  –  spin up EVERY service (core + agents + UI) for local test
# Usage: bash up-full-stack.sh
###############################################################################
set -euo pipefail

# ── 0. Confirm we're using Docker Compose v2 (supports profiles) ─────────────
docker compose version >/dev/null \
  || { echo "❌  Need Docker Compose v2 (comes with Docker 24+)"; exit 1; }

# ── 1. Ensure minimal .env values exist ──────────────────────────────────────
grep -q OPENAI_API_KEY .env 2>/dev/null || cat >> .env <<'EOF'
# local-dev defaults — replace with real secrets as needed
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

# ── 2. Disable Google Cloud SDK layer for faster local builds (no-op if gone) ─
sed -i '/cloud-sdk/ s/^/# ⏯ disabled for local dev →/' \
  services/agent-orchestrator/Dockerfile 2>/dev/null || true

# ── 3. Stop any leftovers & start fresh stack with all profiles ──────────────
docker compose down -v --remove-orphans || true
docker compose --profile core,agents,ui up -d --build --wait

# ── 4. Quick health probes ──────────────────────────────────────────────────
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
curl -fs http://localhost:8082/healthz && echo "cost-api      ☑"

echo -e "\n🎉  All services up!"
echo "Workbench UI → http://localhost:5173"
echo "Test: open Chat, hover header, click ↧ — file should download + toast."
echo "Logs: docker compose logs -f agent-orchestrator architect-api"
echo "Stop stack: docker compose down -v"