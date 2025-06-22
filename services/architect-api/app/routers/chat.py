import asyncio
import json
from typing import List, Dict
from uuid import UUID

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncpg
import os

router = APIRouter(prefix="/chat", tags=["chat"])


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]


class SimpleMessage(BaseModel):
    message: str


@router.post("/stream")
async def chat_stream(request: ChatRequest = Body(...)):
    """Stream chat responses using Server-Sent Events"""
    
    async def event_stream():
        # Simulate architect assistant response
        response_text = "Hello! I'm the Architect Assistant. I can help you with system design, architecture patterns, microservices, database design, and technical decision making. "
        
        # Send chunks
        words = response_text.split()
        for i, word in enumerate(words):
            chunk_data = {
                "type": "chunk",
                "content": word + " "
            }
            yield f"data: {json.dumps(chunk_data)}\n\n"
            await asyncio.sleep(0.1)  # Simulate processing delay
        
        # Send completion signal
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.get("/stream")
async def chat_stream_get():
    """GET endpoint for SSE connection"""
    
    async def event_stream():
        # Simple test stream
        for i in range(5):
            chunk_data = {
                "type": "chunk",
                "content": f"Test message chunk {i + 1}. "
            }
            yield f"data: {json.dumps(chunk_data)}\n\n"
            await asyncio.sleep(1)
        
        yield f"data: {json.dumps({'type': 'done'})}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
        }
    )


@router.post("")
async def simple_chat(request: SimpleMessage):
    """Simple chat endpoint for direct responses"""
    # Echo response for now
    response = f"I received your message: '{request.message}'. This is a simple echo response from the Architect AI."
    return {"response": response, "status": "ok"}


@router.get("/health")
def chat_health():
    """Simple health check for chat service"""
    return {"status": "ok", "service": "architect-chat"}


@router.get("/history")
async def chat_history(session_id: UUID):
    try:
        dsn = "postgresql://postgres:VnVSL/oHOKNYk4qf9ewYQAURIug7LVYO@db-postgres:5432/postgres"
        conn = await asyncpg.connect(dsn=dsn)
        rows = await conn.fetch(
            "SELECT role, content, id FROM memories WHERE session_id=$1 ORDER BY ts ASC", session_id)
        await conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        return {"error": str(e), "empty_history": []}

@router.get("/sessions")
async def chat_sessions(limit: int = 10):
    try:
        dsn = "postgresql://postgres:VnVSL/oHOKNYk4qf9ewYQAURIug7LVYO@db-postgres:5432/postgres"
        conn = await asyncpg.connect(dsn=dsn)
        rows = await conn.fetch(
            "SELECT session_id, max(ts) AS last_ts FROM memories GROUP BY session_id ORDER BY last_ts DESC LIMIT $1", limit)
        await conn.close()
        return [dict(r) for r in rows]
    except Exception as e:
        return {"error": str(e), "empty_sessions": []}

@router.get("/api/chat/history")
async def history(session_id: UUID):
    # Return empty history for now since we don't have real data
    return []

@router.get("/api/chat/sessions")
async def sessions(limit: int = 10):
    # Return empty sessions for now since we don't have real data
    return []