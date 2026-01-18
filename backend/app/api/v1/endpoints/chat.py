"""
AI Chat Endpoints
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, ChatSessionResponse
from app.services.chat_service import ChatService

router = APIRouter()


@router.get("/sessions", response_model=List[ChatSessionResponse])
async def list_chat_sessions(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    채팅 세션 목록
    """
    service = ChatService(db)
    sessions = await service.get_user_sessions(current_user["id"])
    return sessions


@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    새 채팅 세션 생성
    """
    service = ChatService(db)
    session = await service.create_session(current_user["id"])
    return session


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    세션의 메시지 목록
    """
    service = ChatService(db)
    messages = await service.get_session_messages(session_id, current_user["id"])
    return messages


@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    session_id: str,
    message: ChatMessageCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    메시지 전송 및 AI 응답 받기
    """
    service = ChatService(db)
    response = await service.send_message(
        session_id=session_id,
        user_id=current_user["id"],
        content=message.content,
    )
    return response


@router.delete("/sessions/{session_id}")
async def delete_chat_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    채팅 세션 삭제
    """
    service = ChatService(db)
    deleted = await service.delete_session(session_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")
    return {"message": "삭제되었습니다"}


# WebSocket for real-time chat
@router.websocket("/ws/{session_id}")
async def websocket_chat(
    websocket: WebSocket,
    session_id: str,
    token: Optional[str] = None,
):
    """
    실시간 채팅 WebSocket
    """
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()
            message = data.get("message", "")

            # TODO: AI 서비스 호출
            response = {
                "type": "message",
                "content": f"AI 응답: {message}에 대한 답변입니다.",
                "cards": [],
                "suggestions": ["더 자세히 알려줘", "다른 매물 보여줘"],
            }

            await websocket.send_json(response)

    except WebSocketDisconnect:
        print(f"WebSocket disconnected: {session_id}")
