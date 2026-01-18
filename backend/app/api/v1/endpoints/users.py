"""
User Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import get_current_active_user
from app.schemas.user import UserUpdate
from app.schemas.auth import UserResponse
from app.services.user_service import UserService
from app.models.user import User

router = APIRouter()


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
):
    """
    현재 로그인한 사용자 정보 조회
    """
    return UserService.to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    현재 사용자 정보 수정
    """
    user_service = UserService(db)
    updated_user = await user_service.update(current_user.id, user_data)
    return UserService.to_response(updated_user)


@router.delete("/me")
async def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    회원 탈퇴 (soft delete)
    """
    user_service = UserService(db)
    await user_service.delete(current_user.id)
    return {"message": "회원 탈퇴가 완료되었습니다"}


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    비밀번호 변경
    """
    user_service = UserService(db)
    await user_service.change_password(
        current_user.id,
        password_data.current_password,
        password_data.new_password,
    )
    return {"message": "비밀번호가 변경되었습니다"}
