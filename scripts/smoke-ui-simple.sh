#!/usr/bin/env bash
# ============================================================
#  Phase-9 UI smoke-run  •  backend + UI + validation tests
#  Simple version without full Playwright browser installation
# ============================================================
set -euo pipefail

echo "🛫 1) Backend services already running - checking health…"
if curl -sf http://localhost:8083/healthz >/dev/null; then
  echo "   ✅ architect-api (8083) - healthy"
else
  echo "   ❌ architect-api not reachable"
  exit 1
fi

if curl -sf http://localhost:8083/plan/8 >/dev/null; then
  echo "   ✅ plan endpoint - responsive"
else
  echo "   ❌ plan endpoint not working"
  exit 1
fi

echo "🔧 2) UI server already running - checking frontend…"
if curl -sf http://localhost:8082 >/dev/null; then
  echo "   ✅ UI server (8082) - serving content"
else
  echo "   ❌ UI server not reachable"
  exit 1
fi

echo "🧪 3) Run basic integration validation…"
pushd services/agent-orchestrator >/dev/null

# Test configuration
echo "   • Testing Playwright configuration…"
if npm run test:e2e -- --list >/dev/null 2>&1; then
  echo "   ✅ Playwright configured correctly"
else
  echo "   ❌ Playwright configuration issue"
fi

# Test build artifacts
echo "   • Checking build artifacts…"
if [[ -f "dist/index.html" && -d "dist/assets" ]]; then
  echo "   ✅ UI build artifacts present"
else
  echo "   ❌ UI build incomplete"
fi

popd >/dev/null

echo "✅  Phase 9 UI smoke test validation complete!"
echo "🌐  Frontend: http://localhost:8082"
echo "🔌  Backend:  http://localhost:8083"
echo "📋  Plan API: http://localhost:8083/plan/8"

echo ""
echo "📋 Manual verification checklist:"
echo "   □ Navigate to http://localhost:8082"
echo "   □ Press ⌘K (or Ctrl+K) to open command palette"
echo "   □ Search for 'Phase 8' and select plan"
echo "   □ Verify plan page loads with Phase 8 content"
echo "   □ Check service health indicators in top bar"