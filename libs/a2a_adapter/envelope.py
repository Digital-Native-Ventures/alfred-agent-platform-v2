from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class Artifact(BaseModel):
    key: str
    uri: str
    mime_type: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class A2AEnvelope(BaseModel):
    """Agent-to-Agent communication envelope.

    Provides standardized message format for A2A communication.
    """

    message_id: str = Field(default_factory=lambda: str(uuid4()))
    workflow_id: str = Field(default_factory=lambda: str(uuid4()))
    sender: str
    recipient: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = "request"  # request, response, notification
    content: Dict[str, Any] = Field(default_factory=dict)
    artifacts: List[Artifact] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
