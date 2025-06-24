from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

class PlanRequest(BaseModel):
    issue: int = Field(..., gt=0, description="GitHub issue number")

class PlanResponse(BaseModel):
    ok: bool
    message: str

@router.post("/plan", response_model=PlanResponse, status_code=201)
async def create_plan(req: PlanRequest):
    """
    Accept a GitHub issue ID and emit a stub AI-Spec.
    In production this will call the LLM planner; for now returns placeholder.
    """
    # -- TODO: integrate real planning logic --
    if not req.issue:
        raise HTTPException(status_code=400, detail="Invalid issue id")

    return PlanResponse(
        ok=True,
        message=f"Received request to plan issue #{req.issue}. (stub response)"
    )
