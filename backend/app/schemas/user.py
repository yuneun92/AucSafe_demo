"""
User Schemas
"""
from pydantic import BaseModel
from typing import Optional


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    profile_image: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    membership_tier: str
