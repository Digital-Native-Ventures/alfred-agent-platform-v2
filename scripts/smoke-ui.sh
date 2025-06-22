#!/usr/bin/env bash
# ============================================================
#  Phase-9 UI smoke-run  •  backend + UI + Playwright tests
#  Repo structure assumptions:
#    services/agent-orchestrator  <-- React front-end
#    docker-compose.yml           <-- defines architect-api, n8n, etc.
# ============================================================
set -euo pipefail

echo "🛫 1) Start backend stack (detached)…"
docker compose up -d architect-api n8n redis db-postgres || {
  echo "❌ Docker compose failed"; exit 1; }

echo "🔧 2) Build + serve UI…"
pushd services/agent-orchestrator >/dev/null
npm ci                             # reproducible install
npm run build                      # outputs to dist/
npx --yes serve -s dist -l 8082 &  # minimal static server
SERVE_PID=$!
popd >/dev/null

echo "⏳  waiting 10s for services to boot…"; sleep 10

echo "🧪 3) Run Playwright E2E suite…"
pushd services/agent-orchestrator >/dev/null
npx playwright install --with-deps  # ensure browsers
npm run test:e2e                    # headless run
popd >/dev/null

echo "✅  All tests finished."
echo "📄  Playwright HTML report → services/agent-orchestrator/playwright-report/index.html"

echo "🧹 4) Cleanup…"
kill $SERVE_PID 2>/dev/null || true
docker compose down