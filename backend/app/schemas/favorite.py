"""
Favorite Schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FavoriteCreate(BaseModel):
    property_id: str
    memo: Optional[str] = None
    alert_enabled: bool = True


class FavoriteUpdate(BaseModel):
    memo: Optional[str] = None
    alert_enabled: Optional[bool] = None


class FavoriteResponse(BaseModel):
    id: str
    property_id: str
    memo: Optional[str] = None
    alert_enabled: bool
    created_at: datetime
