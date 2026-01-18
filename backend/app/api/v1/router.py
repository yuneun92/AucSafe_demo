"""
API V1 Router - 모든 엔드포인트 통합
"""
from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, properties, registry, favorites, notifications, chat, bid_calculator

api_router = APIRouter()

# 인증
api_router.include_router(auth.router, prefix="/auth", tags=["인증"])

# 사용자
api_router.include_router(users.router, prefix="/users", tags=["사용자"])

# 매물
api_router.include_router(properties.router, prefix="/properties", tags=["매물"])

# 등기부등본 분석
api_router.include_router(registry.router, prefix="/registry", tags=["등기부등본"])

# 관심목록
api_router.include_router(favorites.router, prefix="/favorites", tags=["관심목록"])

# 알림
api_router.include_router(notifications.router, prefix="/notifications", tags=["알림"])

# AI 챗봇
api_router.include_router(chat.router, prefix="/chat", tags=["AI 챗봇"])

# 입찰가 계산기
api_router.include_router(bid_calculator.router, prefix="/bid-calculator", tags=["입찰계산기"])
