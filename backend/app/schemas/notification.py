"""
Notification Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    property_id: Optional[str] = None
    read: bool
    created_at: datetime
