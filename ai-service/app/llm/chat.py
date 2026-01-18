"""
Integrated Chat Service - RAG + Graph RAG Hybrid Retrieval
"""
from typing import List, Dict, Any, Optional, AsyncGenerator
from dataclasses import dataclass
from enum import Enum

from .base import BaseLLM, LLMFactory, Message, LLMResponse
from .rag import RAGRetriever, EmbeddingService, VectorStoreFactory
from .graph import GraphRAGRetriever, KnowledgeGraph, InMemoryKnowledgeGraph


class RetrievalMode(str, Enum):
    RAG = "rag"  # Vector-based retrieval only
    GRAPH = "graph"  # Graph-based retrieval only
    HYBRID = "hybrid"  # Both RAG and Graph RAG


@dataclass
class ChatContext:
    """Context retrieved for chat"""
    rag_context: Optional[str] = None
    graph_context: Optional[str] = None
    combined_context: str = ""
    sources: List[Dict[str, Any]] = None

    def __post_init__(self):
        if self.sources is None:
            self.sources = []


@dataclass
class ChatResponse:
    """Response from chat service"""
    content: str
    context: ChatContext
    suggestions: Optional[List[str]] = None
    cards: Optional[List[Dict[str, Any]]] = None


class ChatService:
    """Integrated chat service with RAG and Graph RAG support"""

    SYSTEM_PROMPT = """당신은 부동산 경매 전문 AI 어시스턴트 'AucSafe'입니다.

역할:
- 부동산 경매에 관한 전문적이고 정확한 정보를 제공합니다.
- 등기부등본 분석, 권리분석, 입찰 전략에 대해 조언합니다.
- 복잡한 법률 용어를 이해하기 쉽게 설명합니다.

원칙:
1. 항상 정확하고 신뢰할 수 있는 정보만 제공합니다.
2. 불확실한 내용은 명확히 표시하고, 전문가 상담을 권장합니다.
3. 사용자의 질문에 친절하고 상세하게 답변합니다.
4. 제공된 컨텍스트 정보를 우선적으로 활용하여 답변합니다.

{context_section}

위 컨텍스트 정보를 참고하여 사용자의 질문에 답변해주세요.
컨텍스트에 없는 내용은 일반적인 지식으로 보완하되, 출처가 불분명함을 명시하세요."""

    def __init__(
        self,
        llm: BaseLLM,
        rag_retriever: Optional[RAGRetriever] = None,
        graph_retriever: Optional[GraphRAGRetriever] = None,
        retrieval_mode: RetrievalMode = RetrievalMode.HYBRID
    ):
        self.llm = llm
        self.rag_retriever = rag_retriever
        self.graph_retriever = graph_retriever
        self.retrieval_mode = retrieval_mode

    @classmethod
    def create(
        cls,
        llm_provider: str,
        llm_api_key: str,
        llm_model: Optional[str] = None,
        openai_api_key: Optional[str] = None,
        embedding_model: str = "text-embedding-3-small",
        vector_store_type: str = "chroma",
        vector_store_config: Optional[Dict[str, Any]] = None,
        knowledge_graph: Optional[KnowledgeGraph] = None,
        retrieval_mode: str = "hybrid",
        **kwargs
    ) -> "ChatService":
        """Factory method to create ChatService with all dependencies"""
        # Create LLM
        llm = LLMFactory.create(
            provider=llm_provider,
            api_key=llm_api_key,
            model=llm_model
        )

        # Create RAG retriever if needed
        rag_retriever = None
        mode = RetrievalMode(retrieval_mode)

        if mode in [RetrievalMode.RAG, RetrievalMode.HYBRID]:
            # Use OpenAI API key for embeddings (required)
            embed_api_key = openai_api_key or llm_api_key
            embedding_service = EmbeddingService(
                api_key=embed_api_key,
                model=embedding_model
            )

            vector_store = VectorStoreFactory.create(
                store_type=vector_store_type,
                **(vector_store_config or {})
            )

            rag_retriever = RAGRetriever(
                embedding_service=embedding_service,
                vector_store=vector_store,
                top_k=kwargs.get("rag_top_k", 5),
                score_threshold=kwargs.get("rag_score_threshold", 0.7)
            )

        # Create Graph RAG retriever if needed
        graph_retriever = None
        if mode in [RetrievalMode.GRAPH, RetrievalMode.HYBRID]:
            kg = knowledge_graph or InMemoryKnowledgeGraph()
            graph_retriever = GraphRAGRetriever(
                knowledge_graph=kg,
                llm=llm,
                max_depth=kwargs.get("graph_max_depth", 2),
                max_nodes=kwargs.get("graph_max_nodes", 10)
            )

        return cls(
            llm=llm,
            rag_retriever=rag_retriever,
            graph_retriever=graph_retriever,
            retrieval_mode=mode
        )

    async def retrieve_context(
        self,
        query: str,
        mode: Optional[RetrievalMode] = None
    ) -> ChatContext:
        """Retrieve context using configured retrieval mode"""
        retrieval_mode = mode or self.retrieval_mode
        context = ChatContext()

        # RAG retrieval
        if retrieval_mode in [RetrievalMode.RAG, RetrievalMode.HYBRID]:
            if self.rag_retriever:
                try:
                    rag_result = await self.rag_retriever.retrieve(query)
                    context.rag_context = rag_result.context

                    # Add document sources
                    for doc in rag_result.documents:
                        context.sources.append({
                            "type": "document",
                            "id": doc.id,
                            "title": doc.metadata.get("title", ""),
                            "source": doc.metadata.get("source", ""),
                        })
                except Exception as e:
                    # Log error but continue
                    print(f"RAG retrieval error: {e}")

        # Graph RAG retrieval
        if retrieval_mode in [RetrievalMode.GRAPH, RetrievalMode.HYBRID]:
            if self.graph_retriever:
                try:
                    graph_result = await self.graph_retriever.retrieve(query)
                    context.graph_context = graph_result.context

                    # Add graph sources
                    for node in graph_result.nodes:
                        context.sources.append({
                            "type": "graph_node",
                            "id": node.id,
                            "name": node.name,
                            "node_type": node.type.value,
                        })
                except Exception as e:
                    # Log error but continue
                    print(f"Graph RAG retrieval error: {e}")

        # Combine contexts
        context.combined_context = self._combine_contexts(context)

        return context

    def _combine_contexts(self, context: ChatContext) -> str:
        """Combine RAG and Graph contexts"""
        parts = []

        if context.rag_context:
            parts.append("## 관련 문서\n" + context.rag_context)

        if context.graph_context:
            parts.append("## 지식 그래프 정보\n" + context.graph_context)

        return "\n\n".join(parts) if parts else ""

    def _build_system_prompt(self, context: ChatContext) -> str:
        """Build system prompt with context"""
        context_section = ""
        if context.combined_context:
            context_section = f"""
## 참고 정보

{context.combined_context}
"""
        return self.SYSTEM_PROMPT.format(context_section=context_section)

    async def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        retrieval_mode: Optional[RetrievalMode] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> ChatResponse:
        """Process a chat message and return response"""
        # Retrieve context
        context = await self.retrieve_context(message, retrieval_mode)

        # Build messages
        messages = [
            Message(role="system", content=self._build_system_prompt(context))
        ]

        # Add history
        if history:
            for h in history:
                messages.append(Message(role=h["role"], content=h["content"]))

        # Add current message
        messages.append(Message(role="user", content=message))

        # Generate response
        response = await self.llm.generate(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        )

        # Generate suggestions
        suggestions = await self._generate_suggestions(message, response.content)

        return ChatResponse(
            content=response.content,
            context=context,
            suggestions=suggestions
        )

    async def chat_stream(
        self,
        message: str,
        history: Optional[List[Dict[str, str]]] = None,
        retrieval_mode: Optional[RetrievalMode] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> AsyncGenerator[str, None]:
        """Process a chat message and stream response"""
        # Retrieve context
        context = await self.retrieve_context(message, retrieval_mode)

        # Build messages
        messages = [
            Message(role="system", content=self._build_system_prompt(context))
        ]

        # Add history
        if history:
            for h in history:
                messages.append(Message(role=h["role"], content=h["content"]))

        # Add current message
        messages.append(Message(role="user", content=message))

        # Stream response
        async for chunk in self.llm.generate_stream(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens
        ):
            yield chunk

    async def _generate_suggestions(
        self,
        query: str,
        response: str
    ) -> List[str]:
        """Generate follow-up question suggestions"""
        # Domain-specific suggestions based on keywords
        suggestions = []

        keywords_suggestions = {
            "등기부등본": ["등기부등본 분석 방법이 궁금해요", "갑구와 을구의 차이점은?"],
            "근저당권": ["근저당권 말소 조건은?", "채권최고액이란?"],
            "경매": ["경매 절차를 알려주세요", "입찰 방법이 궁금해요"],
            "권리분석": ["말소기준권리란?", "인수되는 권리가 있나요?"],
            "낙찰": ["낙찰 후 절차는?", "잔금 납부 기한은?"],
            "입찰": ["적정 입찰가 산정 방법은?", "입찰 시 주의사항은?"],
        }

        for keyword, sug in keywords_suggestions.items():
            if keyword in query or keyword in response:
                suggestions.extend(sug)
                if len(suggestions) >= 3:
                    break

        # Default suggestions if none found
        if not suggestions:
            suggestions = [
                "더 자세히 설명해주세요",
                "관련 사례가 있나요?",
                "주의해야 할 점은?"
            ]

        return suggestions[:3]

    async def analyze_registry(
        self,
        registry_text: str,
        analysis_type: str = "full"
    ) -> ChatResponse:
        """Analyze registry document"""
        prompts = {
            "full": "다음 등기부등본을 전체적으로 분석해주세요.",
            "rights": "다음 등기부등본의 권리관계를 분석해주세요.",
            "risks": "다음 등기부등본에서 주의해야 할 위험 요소를 분석해주세요.",
            "summary": "다음 등기부등본을 요약해주세요."
        }

        prompt = prompts.get(analysis_type, prompts["full"])
        message = f"{prompt}\n\n```\n{registry_text}\n```"

        return await self.chat(message)
