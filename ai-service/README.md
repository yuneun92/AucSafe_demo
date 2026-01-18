# AucSafe AI Service

부동산 경매 AI 분석 서비스 - RAG + Graph RAG 기반 하이브리드 검색 시스템

## 개요

이 서비스는 부동산 경매 도메인에 특화된 AI 챗봇 서비스입니다. RAG(Retrieval-Augmented Generation)와 Graph RAG를 결합한 하이브리드 검색 시스템을 통해 정확하고 맥락에 맞는 답변을 제공합니다.

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Service                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────────────────────────┐     │
│  │   API v1    │    │         Chat Service             │     │
│  │  /chat/*    │───▶│   (Hybrid Retrieval + LLM)      │     │
│  └─────────────┘    └─────────────────────────────────┘     │
│                              │                               │
│              ┌───────────────┼───────────────┐              │
│              ▼               ▼               ▼              │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐   │
│  │  RAG Module   │  │ Graph Module  │  │  LLM Module   │   │
│  │               │  │               │  │               │   │
│  │ - Embeddings  │  │ - Knowledge   │  │ - OpenAI      │   │
│  │ - VectorStore │  │   Graph       │  │ - Anthropic   │   │
│  │ - Retriever   │  │ - Retriever   │  │               │   │
│  └───────┬───────┘  └───────┬───────┘  └───────────────┘   │
│          │                  │                               │
│          ▼                  ▼                               │
│  ┌───────────────┐  ┌───────────────┐                      │
│  │ Chroma/Qdrant │  │    Neo4j      │                      │
│  │ (Vector DB)   │  │  (Graph DB)   │                      │
│  └───────────────┘  └───────────────┘                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 디렉토리 구조

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI 애플리케이션 엔트리포인트
│   ├── config.py               # 환경 설정
│   │
│   ├── api/                    # API 엔드포인트
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── chat.py         # 채팅 API
│   │
│   └── llm/                    # LLM 모듈
│       ├── __init__.py
│       ├── base.py             # LLM 베이스 클래스
│       ├── chat.py             # 통합 채팅 서비스
│       │
│       ├── rag/                # RAG 모듈
│       │   ├── __init__.py
│       │   ├── embeddings.py   # 임베딩 서비스
│       │   ├── vector_store.py # 벡터 스토어
│       │   └── retriever.py    # RAG 검색기
│       │
│       └── graph/              # Graph RAG 모듈
│           ├── __init__.py
│           ├── knowledge_graph.py  # 지식 그래프
│           └── graph_retriever.py  # Graph RAG 검색기
│
├── tests/                      # 테스트
├── requirements.txt            # 의존성
└── README.md
```

## 설치

### 1. 의존성 설치

```bash
cd ai-service
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정합니다:

```env
# LLM Provider 설정
LLM_PROVIDER=openai                    # openai 또는 anthropic
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Embedding 설정
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=1536

# Vector Store 설정
VECTOR_STORE_TYPE=chroma               # chroma 또는 qdrant
CHROMA_PERSIST_DIR=./data/chroma
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=aucsafe

# Graph Database 설정 (Graph RAG)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# 검색 설정
RETRIEVAL_MODE=hybrid                  # rag, graph, hybrid
RAG_TOP_K=5
RAG_SCORE_THRESHOLD=0.7
GRAPH_RAG_MAX_DEPTH=2
GRAPH_RAG_MAX_NODES=10

# 서버 설정
HOST=0.0.0.0
PORT=8001
DEBUG=true
```

### 3. 서버 실행

```bash
# 개발 모드
uvicorn app.main:app --reload --port 8001

# 또는
python -m app.main
```

## API 엔드포인트

### 채팅 완성

```http
POST /api/v1/chat/complete
Content-Type: application/json

{
    "message": "근저당권이 설정된 물건의 경매 시 주의사항은?",
    "session_id": "session-123",
    "history": [
        {"role": "user", "content": "이전 질문"},
        {"role": "assistant", "content": "이전 답변"}
    ],
    "retrieval_mode": "hybrid"
}
```

**응답:**
```json
{
    "content": "근저당권이 설정된 물건 경매 시 다음 사항을 주의해야 합니다...",
    "suggestions": [
        "말소기준권리란?",
        "채권최고액이란?",
        "배당순위 확인 방법"
    ],
    "sources": [
        {
            "type": "document",
            "id": "doc-1",
            "title": "경매 권리분석 가이드"
        },
        {
            "type": "graph_node",
            "id": "node-1",
            "name": "근저당권",
            "node_type": "right"
        }
    ]
}
```

### 스트리밍 응답

```http
POST /api/v1/chat/stream
Content-Type: application/json

{
    "message": "등기부등본 분석 방법을 알려주세요",
    "stream": true
}
```

**응답 (Server-Sent Events):**
```
data: {"content": "등기부"}
data: {"content": "등본은"}
data: {"content": " 크게"}
...
data: [DONE]
```

### 등기부등본 분석

```http
POST /api/v1/chat/analyze-registry
Content-Type: application/json

{
    "registry_text": "【 갑    구 】 (소유권에 관한 사항)\n순위번호 | 등기목적 | ...",
    "analysis_type": "full"
}
```

**analysis_type 옵션:**
- `full`: 전체 분석
- `rights`: 권리관계 분석
- `risks`: 위험요소 분석
- `summary`: 요약

### 문서 추가 (RAG)

```http
POST /api/v1/chat/documents/add
Content-Type: application/json

{
    "documents": [
        {
            "id": "doc-1",
            "content": "근저당권은 채무자가 채무를 이행하지 않을 경우...",
            "metadata": {
                "title": "근저당권 설명",
                "source": "법률 가이드",
                "category": "권리"
            }
        }
    ]
}
```

### 문서 삭제 (RAG)

```http
POST /api/v1/chat/documents/delete
Content-Type: application/json

{
    "ids": ["doc-1", "doc-2"]
}
```

### 설정 확인

```http
GET /api/v1/chat/config
```

### 헬스 체크

```http
GET /health
```

## 검색 모드

### 1. RAG (Retrieval-Augmented Generation)

벡터 유사도 기반 문서 검색을 사용합니다.

- **장점**: 문서 내용 기반 정확한 검색
- **사용 사례**: 법률 문서, 가이드, FAQ 검색

```python
# 설정
RETRIEVAL_MODE=rag
```

### 2. Graph RAG

지식 그래프 기반 관계 검색을 사용합니다.

- **장점**: 엔티티 간 관계 파악, 연결된 정보 탐색
- **사용 사례**: 권리관계 분석, 용어 정의 연결

```python
# 설정
RETRIEVAL_MODE=graph
```

### 3. Hybrid (기본값)

RAG와 Graph RAG를 모두 사용합니다.

- **장점**: 문서 내용 + 관계 정보 통합
- **사용 사례**: 종합적인 분석이 필요한 경우

```python
# 설정
RETRIEVAL_MODE=hybrid
```

## 모듈 상세

### LLM Base (`llm/base.py`)

LLM 프로바이더 추상화 및 팩토리 패턴 구현

```python
from app.llm import LLMFactory, Message

# LLM 생성
llm = LLMFactory.create(
    provider="openai",  # 또는 "anthropic"
    api_key="sk-...",
    model="gpt-4o"
)

# 응답 생성
response = await llm.generate([
    Message(role="system", content="You are a helpful assistant."),
    Message(role="user", content="Hello!")
])

print(response.content)
```

### RAG Retriever (`llm/rag/retriever.py`)

벡터 유사도 기반 문서 검색

```python
from app.llm.rag import RAGRetriever, EmbeddingService, VectorStoreFactory

# 서비스 초기화
embedding_service = EmbeddingService(
    api_key="sk-...",
    model="text-embedding-3-small"
)

vector_store = VectorStoreFactory.create(
    store_type="chroma",
    persist_dir="./data/chroma"
)

retriever = RAGRetriever(
    embedding_service=embedding_service,
    vector_store=vector_store,
    top_k=5,
    score_threshold=0.7
)

# 문서 추가
await retriever.add_documents([
    {"id": "1", "content": "문서 내용", "metadata": {"title": "제목"}}
])

# 검색
result = await retriever.retrieve("근저당권이란?")
print(result.context)
```

### Graph RAG Retriever (`llm/graph/graph_retriever.py`)

지식 그래프 기반 관계 검색

```python
from app.llm.graph import GraphRAGRetriever, InMemoryKnowledgeGraph, Node, NodeType

# 지식 그래프 초기화
kg = InMemoryKnowledgeGraph()

# 노드 추가
await kg.add_node(Node(
    id="1",
    type=NodeType.RIGHT,
    name="근저당권",
    content="근저당권은 채무자가 채무를 이행하지 않을 경우..."
))

# 검색기 초기화
retriever = GraphRAGRetriever(
    knowledge_graph=kg,
    max_depth=2,
    max_nodes=10
)

# 검색
result = await retriever.retrieve("근저당권 관련 정보")
print(result.context)
```

### Chat Service (`llm/chat.py`)

통합 채팅 서비스

```python
from app.llm import ChatService

# 서비스 생성
chat_service = ChatService.create(
    llm_provider="openai",
    llm_api_key="sk-...",
    retrieval_mode="hybrid"
)

# 채팅
response = await chat_service.chat(
    message="등기부등본 분석 방법을 알려주세요",
    history=[
        {"role": "user", "content": "이전 질문"},
        {"role": "assistant", "content": "이전 답변"}
    ]
)

print(response.content)
print(response.suggestions)
```

## 지식 그래프 노드/엣지 타입

### 노드 타입 (NodeType)

| 타입 | 설명 | 예시 |
|------|------|------|
| `property` | 부동산 물건 | 아파트, 빌라, 토지 |
| `registry` | 등기부등본 | 등기부등본 문서 |
| `owner` | 소유자 | 개인, 법인 |
| `right` | 권리 | 저당권, 전세권, 지상권 |
| `restriction` | 제한사항 | 압류, 가압류, 가처분 |
| `court` | 법원 | 서울중앙지방법원 |
| `auction` | 경매 정보 | 경매 사건 |
| `location` | 위치 | 서울시 강남구 |
| `document` | 문서 | 일반 문서 |
| `concept` | 개념/용어 | 말소기준권리 |

### 엣지 타입 (EdgeType)

| 타입 | 설명 |
|------|------|
| `has_registry` | 부동산 → 등기부등본 |
| `owned_by` | 부동산 → 소유자 |
| `has_right` | 등기부등본 → 권리 |
| `has_restriction` | 등기부등본 → 제한사항 |
| `located_in` | 부동산 → 위치 |
| `auctioned_at` | 부동산 → 법원 |
| `related_to` | 일반적인 관계 |
| `defined_as` | 용어 정의 |
| `refers_to` | 참조 관계 |

## 벡터 스토어

### Chroma (기본값)

로컬 파일 시스템 기반, 개발/테스트에 적합

```env
VECTOR_STORE_TYPE=chroma
CHROMA_PERSIST_DIR=./data/chroma
```

### Qdrant

분산 벡터 데이터베이스, 프로덕션에 적합

```env
VECTOR_STORE_TYPE=qdrant
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=aucsafe
```

## 개발

### 테스트 실행

```bash
pytest tests/ -v
```

### 코드 포맷팅

```bash
black app/
isort app/
```

## 라이선스

Private - AucSafe
