"""
Authentication Service
"""
from typing import Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.auth import UserCreate, UserResponse, TokenResponse
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.services.user_service import UserService


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_service = UserService(db)

    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        user = await self.user_service.create(user_data)
        return UserService.to_response(user)

    async def authenticate(self, email: str, password: str) -> Optional[TokenResponse]:
        """Authenticate user and return tokens"""
        user = await self.user_service.authenticate(email, password)
        if not user:
            return None

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id))

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def refresh_tokens(self, refresh_token: str) -> Optional[TokenResponse]:
        """Refresh access token"""
        try:
            payload = decode_token(refresh_token)
            if payload.get("type") != "refresh":
                return None

            user_id = payload.get("sub")

            # 사용자 존재 여부 확인
            user = await self.user_service.get_by_id(UUID(user_id))
            if not user:
                return None

            access_token = create_access_token(subject=user_id)
            new_refresh_token = create_refresh_token(subject=user_id)

            return TokenResponse(
                access_token=access_token,
                refresh_token=new_refresh_token,
                expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            )
        except Exception:
            return None
