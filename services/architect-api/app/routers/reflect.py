from fastapi import APIRouter

router = APIRouter(prefix="/reflect")

def _latest_prd_summary() -> str:
    # TODO: Pull from DB or PRD service
    return "### Latest PRD Summary\n* Enhanced n8n workflow automation\n* Single consolidated daily digest\n* PostgreSQL persistence for workflows"

def _latest_arch_reflection() -> str:
    # TODO: Pull from vector memory / reflections table
    return "### Architect Reflection\nSuccessfully migrated n8n to PostgreSQL and implemented consolidated daily digest workflow. Fixed multi-input duplication issue through proper API design."

@router.get("/prd-summary")
async def prd_summary():
    return {"response": _latest_prd_summary()}

@router.get("/architect")
async def architect_reflection():
    return {"response": _latest_arch_reflection()}