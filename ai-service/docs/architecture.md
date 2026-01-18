# 아키텍처 문서

## 시스템 개요

AucSafe AI Service는 RAG(Retrieval-Augmented Generation)와 Graph RAG를 결합한 하이브리드 검색 시스템입니다. 부동산 경매 도메인에 특화된 AI 챗봇 서비스를 제공합니다.

## 핵심 컴포넌트

### 1. LLM 모듈 (`llm/base.py`)

```
┌─────────────────────────────────────────────┐
│              BaseLLM (Abstract)             │
├─────────────────────────────────────────────┤
│ + generate(messages) -> LLMResponse         │
│ + generate_stream(messages) -> AsyncGen     │
└─────────────────────────────────────────────┘
          ▲                      ▲
          │                      │
┌─────────────────┐    ┌─────────────────┐
│   OpenAILLM     │    │  AnthropicLLM   │
├─────────────────┤    ├─────────────────┤
│ - api_key       │    │ - api_key       │
│ - model         │    │ - model         │
│ - client        │    │ - client        │
└─────────────────┘    └─────────────────┘
```

**역할:**
- LLM 프로바이더 추상화
- OpenAI와 Anthropic API 통합
- 동기/스트리밍 응답 지원

**주요 클래스:**
- `BaseLLM`: 추상 베이스 클래스
- `OpenAILLM`: OpenAI GPT 모델 구현
- `AnthropicLLM`: Anthropic Claude 모델 구현
- `LLMFactory`: LLM 인스턴스 생성 팩토리

### 2. RAG 모듈 (`llm/rag/`)

```
┌─────────────────────────────────────────────────────────────┐
│                       RAG Pipeline                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ EmbeddingService│   │  VectorStore  │   │  RAGRetriever │
├───────────────┤   ├───────────────┤   ├───────────────┤
│ - embed_text  │   │ - add_documents│  │ - retrieve    │
│ - embed_texts │   │ - search      │   │ - add_documents│
└───────────────┘   │ - delete      │   └───────────────┘
                    └───────────────┘
                            ▲
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐
    │ ChromaStore   │ │ QdrantStore   │
    └───────────────┘ └───────────────┘
```

**역할:**
- 텍스트 임베딩 생성
- 벡터 유사도 기반 문서 검색
- 문서 저장 및 관리

**데이터 흐름:**
```
Query → Embedding → Vector Search → Documents → Context
```

### 3. Graph RAG 모듈 (`llm/graph/`)

```
┌─────────────────────────────────────────────────────────────┐
│                    Graph RAG Pipeline                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ EntityExtractor│   │ KnowledgeGraph│   │GraphRetriever │
├───────────────┤   ├───────────────┤   ├───────────────┤
│ - extract     │   │ - add_node    │   │ - retrieve    │
│   entities    │   │ - add_edge    │   │ - add_entity  │
│               │   │ - search      │   │ - add_relation│
└───────────────┘   │ - get_neighbors│  └───────────────┘
                    └───────────────┘
                            ▲
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌───────────────┐ ┌───────────────┐
    │Neo4jGraph     │ │InMemoryGraph  │
    └───────────────┘ └───────────────┘
```

**역할:**
- 지식 그래프 관리
- 엔티티 추출 및 관계 파악
- 그래프 기반 컨텍스트 검색

**데이터 흐름:**
```
Query → Entity Extraction → Graph Search → Subgraph → Context
```

### 4. Chat Service (`llm/chat.py`)

```
┌─────────────────────────────────────────────────────────────┐
│                       ChatService                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │    Query    │───▶│  Retrieval  │───▶│   Context   │     │
│  └─────────────┘    │   Engine    │    │   Builder   │     │
│                     └──────┬──────┘    └──────┬──────┘     │
│                            │                   │            │
│              ┌─────────────┼─────────────┐    │            │
│              ▼             ▼             ▼    ▼            │
│        ┌─────────┐   ┌─────────┐   ┌─────────────┐        │
│        │   RAG   │   │  Graph  │   │   System    │        │
│        │Retriever│   │Retriever│   │   Prompt    │        │
│        └─────────┘   └─────────┘   └──────┬──────┘        │
│                                            │               │
│                                            ▼               │
│                                    ┌─────────────┐         │
│                                    │     LLM     │         │
│                                    └──────┬──────┘         │
│                                            │               │
│                                            ▼               │
│                                    ┌─────────────┐         │
│                                    │  Response   │         │
│                                    └─────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**역할:**
- RAG와 Graph RAG 통합
- 하이브리드 검색 조율
- 프롬프트 엔지니어링
- 응답 생성 및 후처리

## 검색 모드

### RAG 모드

```
User Query
    │
    ▼
┌──────────────┐
│   Embedding  │
│   Service    │
└──────┬───────┘
       │ query_embedding
       ▼
┌──────────────┐
│ Vector Store │───▶ Top-K Documents
│   Search     │
└──────────────┘
       │
       ▼
┌──────────────┐
│   Context    │───▶ "## 관련 문서\n[문서1]...[문서2]..."
│   Builder    │
└──────────────┘
```

### Graph 모드

```
User Query
    │
    ▼
┌──────────────┐
│   Entity     │───▶ [근저당권, 경매, ...]
│  Extraction  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Graph Search │───▶ Matching Nodes
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Subgraph    │───▶ Nodes + Edges (depth=2)
│  Expansion   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Context    │───▶ "## 지식 그래프 정보\n..."
│   Builder    │
└──────────────┘
```

### Hybrid 모드

```
User Query
    │
    ├─────────────────────────────────┐
    ▼                                 ▼
┌──────────────┐              ┌──────────────┐
│     RAG      │              │    Graph     │
│  Retrieval   │              │  Retrieval   │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │ rag_context                 │ graph_context
       │                             │
       └─────────────┬───────────────┘
                     ▼
             ┌──────────────┐
             │   Combine    │
             │   Contexts   │
             └──────┬───────┘
                    │
                    ▼
             combined_context
```

## 지식 그래프 스키마

### 노드 타입

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PROPERTY   │     │  REGISTRY   │     │    OWNER    │
│  (부동산)    │     │ (등기부등본) │     │   (소유자)   │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    RIGHT    │     │ RESTRICTION │     │    COURT    │
│   (권리)    │     │  (제한사항)  │     │   (법원)    │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   AUCTION   │     │  LOCATION   │     │   CONCEPT   │
│  (경매정보)  │     │   (위치)    │     │  (개념/용어) │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 관계 타입

```
PROPERTY ──[HAS_REGISTRY]──▶ REGISTRY
PROPERTY ──[OWNED_BY]──────▶ OWNER
PROPERTY ──[LOCATED_IN]────▶ LOCATION
PROPERTY ──[AUCTIONED_AT]──▶ COURT

REGISTRY ──[HAS_RIGHT]─────▶ RIGHT
REGISTRY ──[HAS_RESTRICTION]▶ RESTRICTION

CONCEPT ──[DEFINED_AS]─────▶ CONCEPT
CONCEPT ──[RELATED_TO]─────▶ CONCEPT
```

### 예시 그래프

```
                    ┌─────────────┐
                    │   서울시    │
                    │   강남구    │
                    │ (LOCATION)  │
                    └──────▲──────┘
                           │ LOCATED_IN
                           │
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   홍길동    │◀────│  테헤란로   │────▶│ 등기부등본  │
│  (OWNER)   │OWNED_BY│   123     │HAS_  │  (REGISTRY) │
└─────────────┘     │ (PROPERTY)  │REGISTRY└──────┬──────┘
                    └─────────────┘            │
                           │                   │
                    AUCTIONED_AT      ┌────────┼────────┐
                           │          │HAS_RIGHT        │HAS_RESTRICTION
                           ▼          ▼                 ▼
                    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                    │ 서울중앙    │  │  근저당권   │  │   가압류    │
                    │ 지방법원   │  │  (RIGHT)   │  │(RESTRICTION)│
                    │  (COURT)   │  └─────────────┘  └─────────────┘
                    └─────────────┘
```

## 데이터 흐름

### 채팅 요청 처리

```
1. HTTP Request
   │
   ▼
2. API Endpoint (/api/v1/chat/complete)
   │
   ▼
3. ChatService.chat()
   │
   ├── 4a. retrieve_context()
   │       │
   │       ├── RAG: query → embedding → vector_search → documents
   │       │
   │       └── Graph: query → entity_extraction → graph_search → subgraph
   │
   ├── 4b. build_system_prompt(context)
   │
   └── 4c. llm.generate(messages)
   │
   ▼
5. ChatResponse
   │
   ▼
6. HTTP Response
```

### 문서 추가 처리

```
1. HTTP Request (documents)
   │
   ▼
2. API Endpoint (/api/v1/chat/documents/add)
   │
   ▼
3. RAGRetriever.add_documents()
   │
   ├── 4a. EmbeddingService.embed_texts()
   │       │
   │       └── OpenAI Embedding API
   │
   └── 4b. VectorStore.add_documents()
           │
           └── Chroma/Qdrant
   │
   ▼
5. Document IDs
   │
   ▼
6. HTTP Response
```

## 확장 가이드

### 새로운 LLM 프로바이더 추가

```python
# llm/base.py

class NewProviderLLM(BaseLLM):
    def __init__(self, api_key: str, model: str):
        self.api_key = api_key
        self.model = model

    async def generate(self, messages: List[Message], **kwargs) -> LLMResponse:
        # 구현
        pass

    async def generate_stream(self, messages: List[Message], **kwargs):
        # 구현
        pass

# LLMFactory에 추가
class LLMFactory:
    @staticmethod
    def create(provider: str, api_key: str, model: str = None) -> BaseLLM:
        if provider == "new_provider":
            return NewProviderLLM(api_key, model)
        # ...
```

### 새로운 Vector Store 추가

```python
# llm/rag/vector_store.py

class NewVectorStore(VectorStore):
    async def add_documents(self, documents: List[Document]) -> List[str]:
        # 구현
        pass

    async def search(self, query_embedding: List[float], **kwargs) -> List[SearchResult]:
        # 구현
        pass

    # ... 기타 메서드

# VectorStoreFactory에 추가
class VectorStoreFactory:
    @staticmethod
    def create(store_type: str, **kwargs) -> VectorStore:
        if store_type == "new_store":
            return NewVectorStore(**kwargs)
        # ...
```

### 새로운 Knowledge Graph 추가

```python
# llm/graph/knowledge_graph.py

class NewKnowledgeGraph(KnowledgeGraph):
    async def add_node(self, node: Node) -> str:
        # 구현
        pass

    async def get_neighbors(self, node_id: str, depth: int = 1, **kwargs) -> List[Node]:
        # 구현
        pass

    # ... 기타 메서드
```

## 성능 최적화

### 캐싱 전략

```python
# 임베딩 캐시 (추천)
from functools import lru_cache

@lru_cache(maxsize=1000)
def get_cached_embedding(text: str) -> List[float]:
    # 캐시된 임베딩 반환
    pass
```

### 배치 처리

```python
# 여러 문서 동시 임베딩
embeddings = await embedding_service.embed_texts([
    doc1.content,
    doc2.content,
    doc3.content,
])
```

### 비동기 병렬 처리

```python
# RAG와 Graph 동시 검색
import asyncio

rag_task = asyncio.create_task(rag_retriever.retrieve(query))
graph_task = asyncio.create_task(graph_retriever.retrieve(query))

rag_result, graph_result = await asyncio.gather(rag_task, graph_task)
```

## 모니터링

### 로깅

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 사용
logger.info(f"Query: {query}")
logger.info(f"Retrieved {len(documents)} documents")
logger.info(f"LLM response tokens: {response.usage}")
```

### 메트릭

권장 메트릭:
- 응답 시간 (p50, p95, p99)
- 검색 결과 수
- LLM 토큰 사용량
- 에러율
