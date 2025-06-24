import asyncio
import json
import logging
import os
from datetime import datetime

from fastapi import FastAPI
from github import Github
from nats.aio.client import Client as NATS

# Import the plan router
from routes.plan import router as plan_router
from routes.next_prd import router as next_prd_router

PG_DSN = os.getenv("PG_DSN", "")
NATS_URL = os.getenv("NATS_URL", "nats://nats:4222")
GH_TOKEN = os.getenv("GITHUB_TOKEN")

app = FastAPI(title="Planner-API")

# Include the plan router
app.include_router(plan_router)
app.include_router(next_prd_router)


@app.get("/healthz")
def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat()}


async def prd_listener():
    if not GH_TOKEN or GH_TOKEN.startswith("<"):
        logging.warning("GitHub token not configured, PRD listener disabled")
        return

    try:
        nc = NATS()
        await nc.connect(NATS_URL)
        g = Github(GH_TOKEN)
        repo = g.get_user().get_repos()[0]  # naive: first repo

        sub = await nc.subscribe("prd.merged")
        async for msg in sub.messages:
            data = json.loads(msg.data.decode())
            issue = repo.create_issue(
                title=f"[AUTO] {data['title']}", body="Created by Planner-API"
            )
            logging.info("Created issue #%s for PRD %s", issue.number, data["id"])
    except Exception as e:
        logging.error("PRD listener failed: %s", e)


@app.on_event("startup")
async def start_listener():
    asyncio.create_task(prd_listener())
