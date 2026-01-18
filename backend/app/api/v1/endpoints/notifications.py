"""
Notification Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.notification import NotificationResponse

router = APIRouter()


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    unread_only: bool = Query(False, description="읽지 않은 알림만"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    알림 목록 조회
    """
    # TODO: 서비스 연결
    return []


@router.get("/unread-count")
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    읽지 않은 알림 개수
    """
    # TODO: 서비스 연결
    return {"count": 0}


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    알림 읽음 처리
    """
    # TODO: 서비스 연결
    return {"message": "읽음 처리되었습니다"}


@router.put("/read-all")
async def mark_all_as_read(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    모든 알림 읽음 처리
    """
    # TODO: 서비스 연결
    return {"message": "모든 알림이 읽음 처리되었습니다"}


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    알림 삭제
    """
    # TODO: 서비스 연결
    return {"message": "삭제되었습니다"}
