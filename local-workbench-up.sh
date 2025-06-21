###############################################################################
# local-workbench-up.sh – Spin up the **modern** Workbench UI + all agents
# ---------------------------------------------------------------------------
# • Works from a clean clone of `main`
# • Skips the Slack gateway (no gcloud image pull)
# • Creates a minimal .env if missing
# • Starts profiles:  core, agents, ui
#
# Usage:  bash local-workbench-up.sh
###############################################################################
set -euo pipefail

# ── 1. Ensure you're on latest main ───────────────────────────────────────────
git checkout main
git pull origin main

# ── 2. Minimal env for local dev ──────────────────────────────────────────────
ENV_FILE=".env"
if ! grep -q OPENAI_API_KEY "$ENV_FILE" 2>/dev/null; then
  cat >> "$ENV_FILE" <<'EOF'
# local-dev secrets — replace as needed
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF
  echo "✅  Wrote minimal .env"
fi

# ── 3. Stop stale containers & volumes ────────────────────────────────────────
docker compose down -v --remove-orphans || true

# ── 4. Build & start stack, scaling Slack gateway to 0 (skip gcloud image) ────
docker compose \
  --profile core,agents,ui \
  up -d --build --wait \
  --scale slack_mcp_gateway=0

# ── 5. Quick health & info ────────────────────────────────────────────────────
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
echo "Workbench UI → http://localhost:5173"

docker compose ps --format table | grep -E 'agent-orchestrator|architect-api' || true

cat <<'DONE'

🎉  Stack is up!

1. Open  http://localhost:5173
2. Go to Chat, type a message.
3. Hover chat header → click ↧  to export.
4. File downloads and toast reads "Chat exported ✨".

Logs:  docker compose logs -f agent-orchestrator architect-api
Stop:  docker compose down -v
DONE