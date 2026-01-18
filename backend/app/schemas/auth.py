"""
Authentication Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    phone: Optional[str] = None
    profile_image: Optional[str] = None
    membership_tier: str = "FREE"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
