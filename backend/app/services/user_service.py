"""
User Service - 사용자 CRUD 비즈니스 로직
"""
from typing import Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserUpdate
from app.schemas.auth import UserCreate, UserResponse
from app.core.security import get_password_hash, verify_password


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        """ID로 사용자 조회"""
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def create(self, user_data: UserCreate) -> User:
        """새 사용자 생성"""
        # 이메일 중복 확인
        existing_user = await self.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 등록된 이메일입니다"
            )

        # 사용자 생성
        user = User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            name=user_data.name,
            phone=user_data.phone,
        )
        self.db.add(user)
        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """이메일과 비밀번호로 사용자 인증"""
        user = await self.get_by_email(email)
        if not user:
            return None
        if not user.is_active:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def update(self, user_id: UUID, user_data: UserUpdate) -> User:
        """사용자 정보 수정"""
        user = await self.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다"
            )

        # 변경된 필드만 업데이트
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(user, field, value)

        await self.db.flush()
        await self.db.refresh(user)
        return user

    async def delete(self, user_id: UUID) -> bool:
        """사용자 삭제 (soft delete)"""
        user = await self.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다"
            )

        user.is_active = False
        await self.db.flush()
        return True

    async def change_password(
        self, user_id: UUID, current_password: str, new_password: str
    ) -> bool:
        """비밀번호 변경"""
        user = await self.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="사용자를 찾을 수 없습니다"
            )

        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="현재 비밀번호가 올바르지 않습니다"
            )

        user.hashed_password = get_password_hash(new_password)
        await self.db.flush()
        return True

    @staticmethod
    def to_response(user: User) -> UserResponse:
        """User 모델을 UserResponse 스키마로 변환"""
        return UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            phone=user.phone,
            profile_image=user.profile_image,
            membership_tier=user.membership_tier.value,
        )
