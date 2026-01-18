"""
Chat Service
"""
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.schemas.chat import ChatSessionResponse, ChatMessageResponse
from app.core.config import settings


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_sessions(self, user_id: str) -> List[ChatSessionResponse]:
        """Get all chat sessions for user"""
        # TODO: Implement DB query
        return []

    async def create_session(self, user_id: str) -> ChatSessionResponse:
        """Create new chat session"""
        # TODO: Create in DB
        return ChatSessionResponse(
            id="session-123",
            title="새 대화",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

    async def get_session_messages(
        self, session_id: str, user_id: str
    ) -> List[ChatMessageResponse]:
        """Get messages for session"""
        # TODO: Implement DB query
        return []

    async def send_message(
        self, session_id: str, user_id: str, content: str
    ) -> ChatMessageResponse:
        """Send message and get AI response"""
        # 1. Save user message
        # TODO: Save to DB

        # 2. Call AI service
        ai_response = await self._get_ai_response(content, session_id)

        # 3. Save AI response
        # TODO: Save to DB

        return ChatMessageResponse(
            id="msg-456",
            role="assistant",
            content=ai_response["content"],
            cards=ai_response.get("cards"),
            suggestions=ai_response.get("suggestions"),
            created_at=datetime.utcnow(),
        )

    async def _get_ai_response(self, content: str, session_id: str) -> dict:
        """Call AI service for response"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/chat/complete",
                    json={
                        "message": content,
                        "session_id": session_id,
                    },
                    timeout=30.0,
                )
                return response.json()
        except Exception as e:
            # Fallback response
            return {
                "content": "죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.",
                "suggestions": ["다시 질문하기", "다른 질문하기"],
            }

    async def delete_session(self, session_id: str, user_id: str) -> bool:
        """Delete chat session"""
        # TODO: Implement DB delete
        return True
