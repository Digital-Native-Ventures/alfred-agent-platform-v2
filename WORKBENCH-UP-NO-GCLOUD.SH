###############################################################################
# WORKBENCH-UP-NO-GCLOUD.SH  –  bring up architect-api + modern UI only,
#                              skipping any image that contains "cloudsdktool".
###############################################################################
set -euo pipefail

git checkout main && git pull --ff-only

# 1 ── minimal env ----------------------------------------------------------------
cat > .env <<'EOF'
OPENAI_API_KEY=sk-test
PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred
REDIS_PASSWORD=
NEXT_PUBLIC_ARCHITECT_URL=http://architect-api:8083
NEXT_PUBLIC_COST_API_URL=http://cost-api:8082
EOF

# 2 ── dynamic override to disable every service that pulls the Cloud SDK image --
OVERRIDE=docker-compose.override.yml
echo "services:" > $OVERRIDE
docker compose config --services | while read svc; do
  IMG=$(docker compose config | yq ".services.${svc}.image // \"\"")
  if [[ $IMG == *cloudsdktool/cloud-sdk* ]]; then
    echo "  ${svc}: { deploy: { replicas: 0 } }" >> $OVERRIDE
  fi
done
echo "✅  Wrote $OVERRIDE to scale Cloud-SDK images to 0."

# 3 ── stub .env.docker to satisfy UI build ---------------------------------------
touch services/agent-orchestrator/.env.docker

# 4 ── stop leftovers & start required stack --------------------------------------
docker compose down -v --remove-orphans || true
docker compose up -d --build \
  db-postgres redis nats \
  architect-api agent-orchestrator planner-api reviewer-api summariser cost-api

# 5 ── health probes --------------------------------------------------------------
curl -fs http://localhost:8083/healthz && echo "architect-api ☑"
echo "Workbench UI → http://localhost:5173"
docker compose ps --format table | grep -E 'agent-orchestrator|architect-api'