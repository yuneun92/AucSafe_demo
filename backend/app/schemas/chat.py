"""
Chat Schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class ChatMessageCreate(BaseModel):
    content: str


class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    cards: Optional[List[Any]] = None
    suggestions: Optional[List[str]] = None
    created_at: datetime


class ChatSessionResponse(BaseModel):
    id: str
    title: Optional[str] = None
    created_at: datetime
    updated_at: datetime
