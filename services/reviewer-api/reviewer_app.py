import os, logging
from datetime import datetime
from fastapi import FastAPI
from github import Github

GH_TOKEN   = os.getenv("GITHUB_TOKEN")
MODEL_NAME = os.getenv("REVIEWER_MODEL", "gpt-4o-mini")  # placeholder

app  = FastAPI(title="Reviewer-API")

@app.get("/healthz")
def health():
    return {"status": "ok", "model": MODEL_NAME, "time": datetime.utcnow().isoformat()}

@app.post("/review/{pr_number}")
def review(pr_number: int):
    if not GH_TOKEN or GH_TOKEN.startswith("<"):
        return {"status": "error", "message": "GitHub token not configured"}
    
    try:
        gh = Github(GH_TOKEN)
        repo = gh.get_user().get_repos()[0]
        pr = repo.get_pull(pr_number)
        pr.create_issue_comment(f"✅ *LLM {MODEL_NAME} stub*: LGTM!")
        pr.create_review(event="APPROVE")
        logging.info("Approved PR #%s", pr_number)
        return {"status": "approved"}
    except Exception as e:
        logging.error("Failed to review PR #%s: %s", pr_number, e)
        return {"status": "error", "message": str(e)}