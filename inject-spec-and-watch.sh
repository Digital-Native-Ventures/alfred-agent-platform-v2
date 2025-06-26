###############################################################################
# ✏️  Inject Manual AI-Spec for Issue #871 and Kick the Pipeline
# • Adds a complete schema-specific AI-Spec comment
# • Immediately re-triggers Architect approval flow
# • Starts a watch loop to show approval → draft PR → CI progress
###############################################################################
set -euo pipefail

REPO="Digital-Native-Ventures/alfred-agent-platform-v2"
ISSUE=871
PLANNER_API="http://localhost:8084/plan"
ARCH_LOGS=architect-api
POLL=20          # seconds
TIMEOUT=900      # 15-min ceiling for CI

###############################################################################
# 1. Post manual AI-Spec comment to the issue
###############################################################################
cat <<'MD' | gh issue comment "$ISSUE" --repo "$REPO" --body-file -
### AI-Spec
**Type:** feature  
**Guard:** extra_review  

**Summary**  
Add conversation-persistence schema.

**DDL**  
* `chat_sessions(id UUID PK, name text, created_at timestamptz default now())`  
* `chat_messages(id UUID PK, session_id UUID FK, role text CHECK (role IN ('user','assistant','system')), content text, created_at timestamptz default now())`  
* `CREATE INDEX ON chat_messages USING ivfflat (content vector_l2_ops);`

**Acceptance Criteria**  
1. Alembic migration creates both tables & pgvector index.  
2. Unit test (`tests/test_chat_tables.py`) asserts tables and index exist.  
3. CI passes under **extra_review** guard.
MD

echo "📝  Manual AI-Spec posted."

###############################################################################
# 2. Tail architect logs in background
###############################################################################
docker compose logs -f --tail=20 "$ARCH_LOGS" &
LOG_PID=$!

###############################################################################
# 3. Poll for Architect approval
###############################################################################
echo -e "\n⏳  Waiting for Architect approval…"
start=$(date +%s)
while :; do
  sleep "$POLL"
  APPROVED=$(gh issue view "$ISSUE" --repo "$REPO" --comments | grep -c "APPROVED" || true)
  [[ $APPROVED -gt 0 ]] && { echo "✅  Approved!"; break; }
  (( $(date +%s) - start > TIMEOUT )) && { echo "❌  Timeout"; kill $LOG_PID; exit 1; }
done

###############################################################################
# 4. Watch for Implementer draft PR
###############################################################################
echo "🔍  Waiting for draft PR referencing #$ISSUE…"
PR_URL=""
while [[ -z $PR_URL ]]; do
  PR_URL=$(gh pr list --repo "$REPO" --state open --search "draft:true $ISSUE" --json url | grep -o 'https://[^"]*' | head -1 || true)
  [[ -z $PR_URL ]] && sleep "$POLL"
done
echo "✅  Draft PR opened: $PR_URL"

###############################################################################
# 5. Stream CI checks until completion
###############################################################################
echo -e "\n📦  Streaming CI checks (Ctrl-C to exit)…"
gh pr checks "$PR_URL" --watch --repo "$REPO"

kill $LOG_PID || true
echo -e "\n🎉  Pipeline run complete — check merge status on GitHub."