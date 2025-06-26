###############################################################################
# 👀  Live-Watch Script – follow Issue #871 through the pipeline
#
# What it does:
#   1. Tails architect-api logs so you see "APPROVED" in real time
#   2. Polls GitHub issue #871 for the APPROVED comment
#   3. Once approved, watches for a draft PR that references #871
#   4. Streams `gh pr checks --watch` until CI turns green or fails
#
# Stop with Ctrl-C at any time.
###############################################################################
set -euo pipefail

REPO="Digital-Native-Ventures/alfred-agent-platform-v2"
ISSUE=871
POLL_INT=20   # seconds

echo "📜  Tailing architect-api logs (Ctrl-C to stop)…"
docker compose logs -f --tail=20 architect-api &
LOG_PID=$!

echo -e "\n⏳  Waiting for Architect approval on issue #$ISSUE …"
while :; do
  APPROVED=$(gh issue view "$ISSUE" --repo "$REPO" --json comments \
              | jq -r '.comments[].body' | grep -c "APPROVED" || true)
  [[ $APPROVED -gt 0 ]] && { echo "✅  APPROVED comment detected."; break; }
  sleep "$POLL_INT"
done

echo -e "\n🔍  Looking for draft PR referencing issue #$ISSUE …"
PR_URL=""
while [[ -z $PR_URL ]]; do
  PR_URL=$(gh pr list --repo "$REPO" --state open --json url,title,body \
            --search "draft:true ${ISSUE}" | jq -r '.[0].url' 2>/dev/null || true)
  [[ -z $PR_URL ]] && sleep "$POLL_INT"
done
echo "✅  Draft PR found: $PR_URL"

echo -e "\n🟢  Streaming CI checks (will exit when all pass/fail)…"
gh pr checks "$PR_URL" --watch --repo "$REPO"

echo -e "\n🎉  CI finished.  Check PR merge status in GitHub."
kill $LOG_PID || true