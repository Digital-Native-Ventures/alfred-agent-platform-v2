from fastapi import APIRouter

router = APIRouter()

def _suggest_next_prd() -> str:
    # TODO: Call OpenAI/Claude or consult backlog
    return "### Next PRD Suggestion\nImplement real-time workflow monitoring dashboard with success/failure metrics and automated error recovery for n8n workflows."

@router.get("/next-prd")
async def next_prd():
    return {"response": _suggest_next_prd()}