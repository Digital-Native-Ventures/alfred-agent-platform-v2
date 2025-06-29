from pathlib import Path

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/plan", tags=["plan"])


@router.get("/{phase}")
def get_plan(phase: str):
    docs_dir = Path("/app/docs")
    file = docs_dir / f"phase-{phase}.md"
    if not file.exists():
        raise HTTPException(status_code=404, detail="Phase not found")
    return {"phase": phase, "markdown": file.read_text(encoding="utf-8")}
