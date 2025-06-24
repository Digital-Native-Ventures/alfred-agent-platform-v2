import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
import httpx

router = APIRouter()

TIMEOUT = 8
PLANNER_HOST = "http://planner-api:8084"
ARCH_HOST = "http://architect-api:8083"

async def fetch_or_fallback(url: str, fallback: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            r = await client.get(url)
            r.raise_for_status()
            data = r.json()
            # endpoint returns {"response":"..."}
            return data.get("response", fallback)
    except Exception as e:
        return f"⚠️ fallback text – {fallback} (error: {e})"

async def get_prd_summary() -> str:
    return await fetch_or_fallback(f"{ARCH_HOST}/reflect/prd-summary", "_No PRD summary today._")

async def get_arch_reflection() -> str:
    return await fetch_or_fallback(f"{ARCH_HOST}/reflect/architect", "_No architect reflection today._")

async def get_next_prd() -> str:
    return await fetch_or_fallback(f"{PLANNER_HOST}/next-prd", "_No next-PRD suggestion today._")

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
    prd, refl, nxt = await asyncio.gather(
        get_prd_summary(), get_arch_reflection(), get_next_prd()
    )
    return DailyDigestResp(
        prd_summary=prd,
        architect_reflection=refl,
        next_prd=nxt,
    )
