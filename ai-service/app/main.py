"""
AI Service - 등기부등본 분석 및 AI 챗봇 서비스
RAG + Graph RAG 기반 하이브리드 검색 지원
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api.v1 import chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"LLM Provider: {settings.LLM_PROVIDER}")
    print(f"Retrieval Mode: {settings.RETRIEVAL_MODE}")
    print(f"Vector Store: {settings.VECTOR_STORE_TYPE}")

    yield

    # Shutdown
    print("Shutting down AI Service...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
부동산 경매 AI 분석 서비스

## 기능
- **RAG 기반 검색**: 문서 임베딩을 통한 유사도 기반 검색
- **Graph RAG**: 지식 그래프 기반 관계 검색
- **하이브리드 검색**: RAG + Graph RAG 통합 검색
- **등기부등본 분석**: 권리분석, 위험요소 분석
- **AI 챗봇**: 부동산 경매 전문 상담

## 검색 모드
- `rag`: 벡터 유사도 기반 검색
- `graph`: 지식 그래프 기반 검색
- `hybrid`: RAG + Graph RAG 통합 검색 (기본값)
    """,
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(chat_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": settings.VERSION,
        "config": {
            "llm_provider": settings.LLM_PROVIDER,
            "retrieval_mode": settings.RETRIEVAL_MODE,
        }
    }


@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "endpoints": {
            "chat": "/api/v1/chat/complete",
            "stream": "/api/v1/chat/stream",
            "analyze_registry": "/api/v1/chat/analyze-registry",
            "add_documents": "/api/v1/chat/documents/add",
            "delete_documents": "/api/v1/chat/documents/delete",
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
