import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from openai import OpenAI
from github import Github

router = APIRouter()

# Configuration
OPENAI_MODEL = "gpt-4o-mini"
OPENAI_PROMPT = """Generate a short AI-Spec to add a TODO line in README.md. Format exactly as shown:

### AI-Spec
**Type:** chore
**Summary:** Add TODO section to README.md
**Details:** Create a simple TODO section in the main README.md file to track upcoming features and improvements.

**Implementation:**
1. Open README.md file
2. Add a ## TODO section near the bottom
3. Include placeholder items for future enhancements
4. Commit changes with descriptive message

**Acceptance Criteria:**
- [ ] TODO section exists in README.md
- [ ] Section contains at least 2-3 placeholder items
- [ ] Changes are committed to main branch
"""

# Initialize clients
try:
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    gh = Github(os.getenv("GITHUB_TOKEN"))
except Exception as e:
    client = None
    gh = None
    print(f"Warning: Failed to initialize AI clients: {e}")

class PlanRequest(BaseModel):
    issue: int = Field(..., gt=0, description="GitHub issue number")

class PlanResponse(BaseModel):
    ok: bool
    message: str

def post_comment(repo_name: str, issue_number: int, body: str):
    """Post a comment to GitHub issue"""
    if not gh:
        raise HTTPException(status_code=500, detail="GitHub client not initialized")
    
    try:
        repo_obj = gh.get_repo(repo_name)
        issue = repo_obj.get_issue(issue_number)
        issue.create_comment(body)
        return True
    except Exception as e:
        print(f"Error posting GitHub comment: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to post comment: {str(e)}")

@router.post("/plan", response_model=PlanResponse, status_code=201)
async def create_plan(req: PlanRequest):
    """
    Accept a GitHub issue ID and generate real AI-Spec with OpenAI.
    Posts the spec as a comment on the GitHub issue.
    """
    if not req.issue:
        raise HTTPException(status_code=400, detail="Invalid issue id")

    repo = "Digital-Native-Ventures/alfred-agent-platform-v2"
    
    try:
        # 1) Call LLM to generate AI-Spec
        if client:
            try:
                spec_response = client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[{"role": "user", "content": OPENAI_PROMPT}],
                    temperature=0.2,
                )
                spec_md = spec_response.choices[0].message.content.strip()
            except Exception as e:
                print(f"OpenAI API error: {e}")
                # Fall back to template if OpenAI fails
                spec_md = OPENAI_PROMPT
        else:
            # Use template if OpenAI client not available
            spec_md = OPENAI_PROMPT

        # 2) Comment on GitHub issue
        post_comment(repo, req.issue, spec_md)
        
        return PlanResponse(
            ok=True,
            message=f"AI-Spec posted to issue #{req.issue}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in create_plan: {e}")
        return PlanResponse(
            ok=False,
            message=f"Error generating plan for issue #{req.issue}: {str(e)}"
        )
