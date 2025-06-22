import asyncio
import json
from typing import List, Dict

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

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