import asyncio
import json
import os
from datetime import datetime
from typing import Dict, List

import asyncpg
from openai import OpenAI
import psycopg2
import redis
from fastapi import Body, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse, StreamingResponse
from nats.aio.client import Client as NATS
from pydantic import BaseModel

from app.routers import plan, chat


# Simple prompt builder function
def build_prompt(system_snips, user_query):
    context = "\n".join(system_snips) if system_snips else ""
    return f"Context: {context}\n\nUser Query: {user_query}"


PG_DSN = os.getenv("PG_DSN")
NATS_URL = os.getenv("NATS_URL", "nats://nats:4222")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

# Include available routers
app.include_router(plan.router)
app.include_router(chat.router)

# TODO: Enable these routers when implemented
# app.include_router(memory.router)
# app.include_router(project_sync.router)
# app.include_router(reflect.router)
# app.include_router(control.router)
# app.include_router(next_prd.router)
# app.include_router(report.router)
# app.include_router(auto_prd.router)
# app.include_router(suggested_prds.router)
# app.include_router(memory_update.router)
# app.include_router(memory_metrics.router)
# app.include_router(memory_archive.router)
# app.include_router(memory_archived.router)
# app.include_router(memory_revival.router)
# app.include_router(memory_status_metrics.router)
# app.include_router(admin_export.router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str


async def fetch_context():
    conn = await asyncpg.connect(dsn=os.getenv("PG_DSN"))
    memory = await conn.fetch("SELECT * FROM architect_memory ORDER BY created_at DESC LIMIT 5")
    state = await conn.fetch("SELECT * FROM project_state ORDER BY last_synced_at DESC LIMIT 5")
    await conn.close()

    memory_summary = "\n".join(
        f"- {m['title']} [{m['phase']}, {m['status']}] – {m['description'] or ''}" for m in memory
    )
    sync_summary = "\n".join(
        f"- {s['title']} – Issues: {len(s['planner_issues'])}, PRs: {len(s['reviewer_prs'])}"
        for s in state
    )

    return memory_summary, sync_summary


# Health route
@app.get("/healthz")
def health():
    try:
        psycopg2.connect(PG_DSN).close()
        return {"status": "ok"}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# Chat endpoint for direct OpenAI chat completion with project context
@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        memory_summary, sync_summary = await fetch_context()

        system_prompt = f"""You are the lead Architect AI for this software project.
Always consider the current memory (features, roadmap) and current sync status (issues, PRs).
Your job is to help plan, correct, and guide all agent workflows across Planner, Reviewer, and Summariser.

🧠 Memory:
{memory_summary}

📦 Project Sync:
{sync_summary}"""

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
            temperature=0.7,
            max_tokens=800,
        )
        return {"message": response.choices[0].message.content}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


# OPTIONS handler for CORS preflight
@app.options("/architect/complete")
async def complete_options():
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    return JSONResponse(content={"message": "OK"}, headers=headers)


# SSE chat completion
@app.post("/architect/complete")
async def complete(req: Request):
    body = await req.json()
    user_query = body.get("query", "")
    system_snips = body.get("context", [])
    prompt = build_prompt(system_snips, user_query)

    def event_generator():
        try:
            stream = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful AI product architect. Always return clear and structured product requirement documents.",
                    },
                    {"role": "user", "content": user_query},
                ],
                stream=True,
            )
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }
    return StreamingResponse(event_generator(), media_type="text/event-stream", headers=headers)


# PRD validator endpoint
@app.post("/prd/validate")
async def validate(prd: dict):
    required = ["id", "title", "acceptance_tasks"]
    missing = [k for k in required if k not in prd]
    return {"valid": not missing, "missing": missing}


# ---------------------------------------------------------------------------
# Chat Export Endpoint (Markdown)
# ---------------------------------------------------------------------------


def _messages_to_markdown(msgs: List[Dict]) -> str:
    md = ["# Architect Chat Export\n"]
    for m in msgs:
        role = m.get("role", "user").title()
        content = m.get("content", "")
        md.append(f"## {role}\n\n{content}\n")
    return "\n".join(md)


@app.post("/architect/export", response_class=PlainTextResponse)
async def export_chat(body: Dict = Body(...)):
    """
    Expects:
      {
        "thread_id": "abc123",
        "messages": [
          {"role": "user", "content": "Hi"},
          {"role": "assistant", "content": "Hello"}
        ]
      }
    Returns a Markdown document for download.
    """
    msgs = body.get("messages", [])
    return _messages_to_markdown(msgs)


# Planner trigger coroutine (optional)
async def planner_listener():
    nc = NATS()
    await nc.connect(NATS_URL)
    sub = await nc.subscribe("prd.merged")
    async for msg in sub.messages:
        print("Planner trigger", msg.data.decode())


@app.on_event("startup")
async def start_planner_listener():
    asyncio.create_task(planner_listener())
