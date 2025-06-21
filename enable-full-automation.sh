###############################################################################
# enable-full-automation.sh – pull latest code, add helper agents, start the
#                            complete automated dev loop (Planner, Reviewer,
#                            Summariser) alongside the running core stack.
#
# Usage: bash enable-full-automation.sh
###############################################################################
set -euo pipefail

echo "🔄 1/5  Pulling latest main (includes helper agents)…"
git checkout main
git pull --ff-only origin main

echo "✅  Helper agent directories:"
ls services | grep -E 'planner-api|reviewer-api|summariser'

echo "🔑 2/5  Ensuring .env has required secrets…"
grep -q OPENAI_API_KEY .env 2>/dev/null || echo 'OPENAI_API_KEY=sk-test' >> .env
grep -q PG_DSN .env 2>/dev/null || echo 'PG_DSN=postgresql://postgres:postgres@db-postgres:5432/alfred' >> .env
grep -q GITHUB_TOKEN .env 2>/dev/null && echo "   • GITHUB_TOKEN already set" \
  || echo 'GITHUB_TOKEN=<your-GH-PAT-with-repo-scope>' >> .env

# Reviewer model (optional)
grep -q REVIEWER_MODEL .env 2>/dev/null || echo 'REVIEWER_MODEL=gpt-4o-mini' >> .env

# stub env for React build (if missing)
touch services/agent-orchestrator/.env.docker

echo "🚀 3/5  Building & starting helper agents…"
docker compose up -d --build --wait planner-api reviewer-api summariser

echo "🩺 4/5  Status check:"
docker compose ps --format table | grep -E 'planner-api|reviewer-api|summariser'

echo "🟢  All agents running.  Full workflow is now active."
cat <<'TODO'

══════════════════════════════════════════════════════════
✅  HOW TO TEST THE FULL LOOP

1. Open Workbench UI → http://localhost:5173
2. In Architect Chat, type: "Create a PRD for 'Chat GIF reactions' feature."
3. Validate & Merge the PRD.
   • Planner creates GitHub issues/tasks automatically.
   • Auto-Eng claims the first task.
4. Push a trivial branch (e.g., feature/dummy) to trigger Reviewer-API.
5. Merge PR → Summariser logs a summary event.

Tail logs live:
  docker compose logs -f planner-api reviewer-api summariser

Stop everything:
  docker compose down -v
══════════════════════════════════════════════════════════
TODO