#!/bin/bash
###############################################################################
# ship-chat-export.sh  –  Merge, tag, and smoke-test the Chat Export feature
# Usage: bash ship-chat-export.sh
###############################################################################
set -euo pipefail

BACKEND_PR=853          # architect-api /export endpoint
FRONTEND_PR=854         # Workbench UI button
NEXT_TAG="v1.1.1"

echo "🚀 1/4  Merging backend PR #${BACKEND_PR}…"
gh pr merge "$BACKEND_PR" --squash --delete-branch --admin

echo "🚀 2/4  Merging frontend PR #${FRONTEND_PR}…"
gh pr merge "$FRONTEND_PR" --squash --delete-branch --admin

echo "📦 3/4  Tagging release ${NEXT_TAG}…"
git pull --ff-only origin main
git tag -a "${NEXT_TAG}" -m "Chat export (backend + UI)"
git push origin "${NEXT_TAG}"

echo "🔄 4/4  Refreshing local stack & smoke-testing…"
make dev-up         # or: docker compose --profile core,agents,ui up -d --wait

echo -e "\n➡️  Open http://localhost:5173, go to Chat, hover header, click ↧ ."
echo "   You should see architect-chat-<thread>.md download and a toast 'Chat exported ✨'."

echo -e "\nDone!  Announce in Slack:\n" \
":arrow_down: *Chat export is live!* Hover the chat header in Workbench and download any thread as Markdown. :tada:"