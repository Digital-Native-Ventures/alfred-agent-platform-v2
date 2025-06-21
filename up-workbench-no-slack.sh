###############################################################################
# up-workbench-no-slack.sh – start Architect API + modern Workbench UI
#                           while core services are already running.
###############################################################################
set -euo pipefail

# 0  Make sure you're on latest main
git checkout main && git pull --ff-only

# 1  Build the two images locally (no remote pulls)
docker compose build backend-api ui-admin

# 2  Bring up just the required agents/UI containers
docker compose up -d backend-api ui-admin cost-api

# 3  Health probes
curl -fs http://localhost:8083/healthz && echo "backend-api ☑"
docker compose ps --format table | grep -E 'ui-admin|backend-api'

echo -e "\n🎉  Workbench UI →  http://localhost:5173"
echo   "   Chat → hover header → click ↧  to export Markdown."
echo   "   Stop stack later with:  docker compose down backend-api ui-admin cost-api"