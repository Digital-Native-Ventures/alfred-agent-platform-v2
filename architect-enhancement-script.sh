###############################################################################
# 🛠  Architect-api Enhancement + n8n Workflow Patch
# Implements Section 9.5: POST /daily-digest returning three markdown segments
# and updates the n8n HTTP node to use the new endpoint.
#
# Prereqs:
#   • Repo root with docker-compose.yml
#   • jq, yq, and pytest installed
#   • n8n API reachable at localhost:5678  (no auth) — edit AUTH if needed
###############################################################################
set -euo pipefail

### CONFIG ####################################################################
REPO="Digital-Native-Ventures/alfred-agent-platform-v2"
ARCH_PATH="services/architect-api"
BRANCH="feature/architect-daily-digest"
N8N_API="http://localhost:5678/rest"
AUTH=()   # e.g., (--user user:pass) if n8n auth enabled
###############################################################################

echo "🔀  Creating git branch $BRANCH …"
git switch -c "$BRANCH"

###############################################################################
# 1. Add new route services/architect-api/routes/daily_digest.py
###############################################################################
ROUTE_FILE="$ARCH_PATH/routes/daily_digest.py"
mkdir -p "$(dirname "$ROUTE_FILE")"
cat > "$ROUTE_FILE" <<'PY'
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Dummy helpers — replace with real logic
def get_prd_summary() -> str:
    return "PRD summary markdown."

def get_arch_reflection() -> str:
    return "Architect reflection markdown."

def get_next_prd() -> str:
    return "Next-PRD suggestion markdown."

class DailyDigestReq(BaseModel):
    thread_id: str
    messages: list

class DailyDigestResp(BaseModel):
    prd_summary: str
    architect_reflection: str
    next_prd: str

@router.post("/daily-digest", response_model=DailyDigestResp)
async def daily_digest(_: DailyDigestReq):
    """Aggregate three daily markdown blocks for Slack/Docs digest."""
    return DailyDigestResp(
        prd_summary=get_prd_summary(),
        architect_reflection=get_arch_reflection(),
        next_prd=get_next_prd(),
    )
PY

###############################################################################
# 2. Wire router in main.py if not already
###############################################################################
MAIN="$ARCH_PATH/main.py"
if ! grep -q "daily_digest" "$MAIN"; then
  sed -i "/FastAPI()/a\\\nfrom .routes import daily_digest as dd_router\\napp.include_router(dd_router.router)" "$MAIN"
fi

###############################################################################
# 3. Add minimal unit test
###############################################################################
TEST_FILE="$ARCH_PATH/tests/test_daily_digest.py"
mkdir -p "$(dirname "$TEST_FILE")"
cat > "$TEST_FILE" <<'PY'
from fastapi.testclient import TestClient
from services.architect_api.main import app   # adjust if module path differs

client = TestClient(app)

def test_daily_digest_route():
    resp = client.post("/daily-digest", json={"thread_id":"x","messages":[]})
    assert resp.status_code == 200
    body = resp.json()
    assert set(body.keys()) == {"prd_summary","architect_reflection","next_prd"}
PY

###############################################################################
# 4. Commit and push
###############################################################################
git add "$ROUTE_FILE" "$TEST_FILE" "$MAIN"
git commit -m "feat(api): add POST /daily-digest endpoint returning combined digest"
git push -u origin "$BRANCH"

###############################################################################
# 5. Rebuild architect-api container
###############################################################################
docker compose up -d --build architect-api
sleep 8
curl -sSf -X POST http://localhost:8083/daily-digest \
     -H "Content-Type: application/json" \
     -d '{"thread_id":"test","messages":[]}' | jq .
echo "✅  /daily-digest endpoint live."

###############################################################################
# 6. Patch n8n workflows calling /architect/export to /daily-digest
###############################################################################
WF_IDS=$(curl -s "${AUTH[@]}" "$N8N_API/workflows" | jq -r '.[].id')
for WF in $WF_IDS; do
  WF_JSON=$(curl -s "${AUTH[@]}" "$N8N_API/workflows/$WF")
  NEEDS=$(echo "$WF_JSON" | jq -e '..|objects|select(.parameters? and .parameters.url? | test("/architect/export"))' >/dev/null 2>&1 && echo 1 || echo 0)
  [[ $NEEDS -eq 0 ]] && continue
  echo "🔧  Patching workflow id=$WF …"
  PATCHED=$(echo "$WF_JSON" | jq \
    --arg url "http://architect-api:8083/daily-digest" \
    '.nodes[] |= (if (.parameters.url? | test("/architect/export")) then
        .parameters.url=$url | .parameters.method="POST" | .parameters.jsonParameters=true |
        .parameters.bodyParametersJson="{\"thread_id\":\"daily-digest\",\"messages\":[]}"
      else . end)')
  curl -s "${AUTH[@]}" -X PUT "$N8N_API/workflows/$WF" \
       -H "Content-Type: application/json" \
       --data "$PATCHED" >/dev/null
  curl -s "${AUTH[@]}" -X PUT "$N8N_API/workflows/$WF/activate" \
       -H "Content-Type: application/json" \
       --data '{"active":true}' >/dev/null
  echo "   → Updated & activated workflow $WF"
done

echo -e "\n🎉  Daily-digest endpoint added, architect-api rebuilt, n8n workflows updated.\nOpen a PR for branch $BRANCH and watch CI!"