"""
Favorites Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.favorite import FavoriteResponse, FavoriteCreate, FavoriteUpdate

router = APIRouter()


@router.get("", response_model=List[FavoriteResponse])
async def list_favorites(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    관심 목록 조회
    """
    # TODO: 서비스 연결
    return []


@router.post("", response_model=FavoriteResponse)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    관심 목록에 추가
    """
    # TODO: 서비스 연결
    return {
        "id": "fav-1",
        "property_id": favorite_data.property_id,
        "memo": favorite_data.memo,
        "alert_enabled": favorite_data.alert_enabled,
        "created_at": "2024-01-01T00:00:00Z",
    }


@router.put("/{favorite_id}", response_model=FavoriteResponse)
async def update_favorite(
    favorite_id: str,
    favorite_data: FavoriteUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    관심 목록 수정 (메모, 알림 설정)
    """
    # TODO: 서비스 연결
    return {
        "id": favorite_id,
        "property_id": "prop-1",
        "memo": favorite_data.memo,
        "alert_enabled": favorite_data.alert_enabled,
        "created_at": "2024-01-01T00:00:00Z",
    }


@router.delete("/{favorite_id}")
async def remove_favorite(
    favorite_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    관심 목록에서 삭제
    """
    # TODO: 서비스 연결
    return {"message": "삭제되었습니다"}
