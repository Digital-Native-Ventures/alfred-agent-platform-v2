###############################################################################
# up-stack-no-slack.sh – start core + agents + UI but scale Slack gateway to 0
###############################################################################
set -euo pipefail

# 0  make sure compose v2
docker compose version >/dev/null \
  || { echo "Need Docker Compose v2"; exit 1; }

# 1  minimal env
grep -q OPENAI_API_KEY .env 2>/dev/null || cat >> .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

# 2  shut down anything old
docker compose down -v --remove-orphans || true

# 3  build & start everything, but scale slack_mcp_gateway to zero replicas
docker compose --profile core,agents,ui up -d --build --wait \
  --scale slack-bot=0

# 4  quick health
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
echo "Workbench UI → http://localhost:5173  (port 5173)"