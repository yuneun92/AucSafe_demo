"""
Chat API Endpoints
"""
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

from app.config import settings
from app.llm import ChatService
from app.llm.chat import RetrievalMode

router = APIRouter(prefix="/chat", tags=["chat"])

# Global chat service instance (initialized on startup)
_chat_service: Optional[ChatService] = None


def get_chat_service() -> ChatService:
    """Get or create chat service instance"""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService.create(
            llm_provider=settings.LLM_PROVIDER,
            llm_api_key=(
                settings.OPENAI_API_KEY
                if settings.LLM_PROVIDER == "openai"
                else settings.ANTHROPIC_API_KEY
            ),
            llm_model=(
                settings.OPENAI_MODEL
                if settings.LLM_PROVIDER == "openai"
                else settings.ANTHROPIC_MODEL
            ),
            openai_api_key=settings.OPENAI_API_KEY,
            embedding_model=settings.EMBEDDING_MODEL,
            vector_store_type=settings.VECTOR_STORE_TYPE,
            vector_store_config={
                "persist_dir": settings.CHROMA_PERSIST_DIR,
                "collection_name": "aucsafe",
            },
            retrieval_mode=settings.RETRIEVAL_MODE,
            rag_top_k=settings.RAG_TOP_K,
            rag_score_threshold=settings.RAG_SCORE_THRESHOLD,
            graph_max_depth=settings.GRAPH_RAG_MAX_DEPTH,
            graph_max_nodes=settings.GRAPH_RAG_MAX_NODES,
        )
    return _chat_service


# Request/Response Models
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = None
    retrieval_mode: Optional[str] = None  # "rag", "graph", "hybrid"
    stream: bool = False


class ChatResponse(BaseModel):
    content: str
    suggestions: Optional[List[str]] = None
    cards: Optional[List[Dict[str, Any]]] = None
    sources: Optional[List[Dict[str, Any]]] = None


class RegistryAnalysisRequest(BaseModel):
    registry_text: str
    analysis_type: str = "full"  # "full", "rights", "risks", "summary"


class DocumentRequest(BaseModel):
    id: str
    content: str
    metadata: Optional[Dict[str, Any]] = None


class DocumentsAddRequest(BaseModel):
    documents: List[DocumentRequest]


class DocumentsDeleteRequest(BaseModel):
    ids: List[str]


@router.post("/complete", response_model=ChatResponse)
async def chat_complete(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Process chat message and return response"""
    try:
        # Convert history format
        history = None
        if request.history:
            history = [{"role": m.role, "content": m.content} for m in request.history]

        # Determine retrieval mode
        retrieval_mode = None
        if request.retrieval_mode:
            try:
                retrieval_mode = RetrievalMode(request.retrieval_mode)
            except ValueError:
                pass

        # Get response
        response = await chat_service.chat(
            message=request.message,
            history=history,
            retrieval_mode=retrieval_mode
        )

        return ChatResponse(
            content=response.content,
            suggestions=response.suggestions,
            cards=response.cards,
            sources=response.context.sources if response.context else None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Stream chat response"""
    async def generate():
        try:
            # Convert history format
            history = None
            if request.history:
                history = [{"role": m.role, "content": m.content} for m in request.history]

            # Determine retrieval mode
            retrieval_mode = None
            if request.retrieval_mode:
                try:
                    retrieval_mode = RetrievalMode(request.retrieval_mode)
                except ValueError:
                    pass

            # Stream response
            async for chunk in chat_service.chat_stream(
                message=request.message,
                history=history,
                retrieval_mode=retrieval_mode
            ):
                yield f"data: {json.dumps({'content': chunk})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )


@router.post("/analyze-registry", response_model=ChatResponse)
async def analyze_registry(
    request: RegistryAnalysisRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Analyze registry document"""
    try:
        response = await chat_service.analyze_registry(
            registry_text=request.registry_text,
            analysis_type=request.analysis_type
        )

        return ChatResponse(
            content=response.content,
            suggestions=response.suggestions,
            cards=response.cards,
            sources=response.context.sources if response.context else None
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents/add")
async def add_documents(
    request: DocumentsAddRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Add documents to RAG vector store"""
    if not chat_service.rag_retriever:
        raise HTTPException(status_code=400, detail="RAG retriever not configured")

    try:
        documents = [
            {
                "id": doc.id,
                "content": doc.content,
                "metadata": doc.metadata or {}
            }
            for doc in request.documents
        ]

        ids = await chat_service.rag_retriever.add_documents(documents)
        return {"success": True, "ids": ids}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/documents/delete")
async def delete_documents(
    request: DocumentsDeleteRequest,
    chat_service: ChatService = Depends(get_chat_service)
):
    """Delete documents from RAG vector store"""
    if not chat_service.rag_retriever:
        raise HTTPException(status_code=400, detail="RAG retriever not configured")

    try:
        success = await chat_service.rag_retriever.delete_documents(request.ids)
        return {"success": success}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config")
async def get_config():
    """Get current chat service configuration"""
    return {
        "llm_provider": settings.LLM_PROVIDER,
        "retrieval_mode": settings.RETRIEVAL_MODE,
        "vector_store_type": settings.VECTOR_STORE_TYPE,
        "rag_top_k": settings.RAG_TOP_K,
        "graph_max_depth": settings.GRAPH_RAG_MAX_DEPTH,
    }
