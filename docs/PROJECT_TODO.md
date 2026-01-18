# AucSafe 프로젝트 TODO

## 프로젝트 개요
부동산 경매 분석 플랫폼 - AI 기반 등기부등본 분석 및 투자 추천 서비스

### 진행 현황 요약

| 영역 | 상태 | 진행률 |
|------|------|--------|
| 프론트엔드 UI | ✅ 완료 | 100% |
| 프론트엔드 기능 | 🔄 진행 중 | 30% |
| 백엔드 구조 | ✅ 완료 | 100% |
| 백엔드 서비스 | 🔄 진행 중 | 40% |
| 백엔드 테스트 | 🔄 진행 중 | 30% |
| AI 서비스 | 🔄 진행 중 | 60% |
| Docker | ✅ 완료 | 100% |
| Kubernetes | ✅ 완료 | 100% |
| CI/CD | ✅ 완료 | 100% |
| 모니터링 | ⏳ 대기 | 0% |
| 데이터 | ⏳ 대기 | 0% |
| 모바일/앱 | ⏳ 대기 | 0% |

---

## 1. 프론트엔드 (Next.js)

### 완료됨 ✅
- [x] 프로젝트 초기 설정 (Next.js 16, React 19, Tailwind v4)
- [x] shadcn/ui 컴포넌트 설정
- [x] 랜딩 페이지 (등기부등본 업로드, AI 챗봇 입력)
- [x] 매물 탐색 페이지 (리스트/그리드/지도 뷰)
- [x] 매물 상세 슬라이드 패널
- [x] 권리분석 컴포넌트 (말소기준권리, 입찰가 계산기)
- [x] 등기부등본 분석 결과 페이지
- [x] AI 챗봇 전체 화면 페이지
- [x] 대시보드 페이지
- [x] 알림 페이지
- [x] 프로필 페이지
- [x] 관심목록 페이지
- [x] 다크/라이트 테마 전환
- [x] 커맨드 팔레트 (⌘K)

### 진행 필요 🔄
- [ ] **지도 뷰 개선**
  - [ ] 네이버 지도 SDK 연동 또는 카카오 맵 연동
  - [ ] 마커 클러스터링
  - [ ] 지도 영역 기반 매물 검색
  - [ ] 매물 정보 인포윈도우
  - [ ] 지도 위 필터 UI

- [ ] **백엔드 API 연동**
  - [ ] API 클라이언트 설정 (axios/fetch wrapper)
  - [ ] 인증 상태 관리 (zustand/jotai)
  - [ ] API 훅 (react-query/SWR)
  - [ ] 에러 핸들링 & 토스트 알림

- [ ] **성능 최적화**
  - [ ] 이미지 최적화 (next/image)
  - [ ] 코드 스플리팅
  - [ ] SSR/SSG 적용
  - [ ] 무한 스크롤/가상화 리스트

- [ ] **사용자 경험**
  - [ ] 스켈레톤 로딩
  - [ ] 에러 바운더리
  - [ ] 오프라인 지원 (PWA)
  - [ ] 모바일 반응형 개선

---

## 2. 백엔드 (FastAPI)

### 완료됨 ✅
- [x] FastAPI 프로젝트 구조
- [x] 설정 관리 (pydantic-settings)
- [x] JWT 인증 시스템
- [x] SQLAlchemy 모델 정의
- [x] API 엔드포인트 스켈레톤
  - [x] 인증 (회원가입, 로그인, 토큰 갱신)
  - [x] 사용자 관리
  - [x] 매물 조회/검색
  - [x] 등기부등본 업로드/분석
  - [x] 관심목록
  - [x] 알림
  - [x] AI 챗봇
  - [x] 입찰가 계산기
- [x] Pydantic 스키마 정의
- [x] 서비스 레이어 스켈레톤

### 진행 필요 🔄
- [ ] **데이터베이스**
  - [ ] Alembic 마이그레이션 설정
  - [ ] 인덱스 최적화
  - [ ] 쿼리 최적화
  - [ ] 데이터 시딩 스크립트

- [ ] **서비스 구현**
  - [ ] 사용자 서비스 (CRUD, 인증)
  - [x] ✅ **매물 서비스 (검색, 필터링, 추천)** - 완료
    - [x] 매물 검색 (다중 필터링, 정렬, 페이징)
    - [x] 매물 상세 조회 (권리정보, 임차인 포함)
    - [x] AI 추천 매물 조회
    - [x] 권리분석 (말소기준권리, 인수/소멸 권리)
    - [x] 유사 매물 추천
    - [x] 매물 CRUD (생성/수정/삭제)
    - [x] 사건번호 조회, 다가오는 경매 조회
  - [ ] 등기부등본 서비스 (업로드, OCR, 분석)
  - [ ] 관심목록 서비스
  - [ ] 알림 서비스 (이메일, 푸시)
  - [ ] 챗봇 서비스 (AI 연동)

- [ ] **외부 API 연동**
  - [ ] 네이버 부동산 API
  - [ ] 대법원 경매 정보 API
  - [ ] 국토교통부 실거래가 API
  - [ ] 카카오/네이버 지도 API

- [ ] **파일 처리**
  - [ ] S3 업로드/다운로드
  - [ ] 이미지 리사이징
  - [ ] PDF 처리

- [ ] **보안**
  - [ ] Rate limiting
  - [ ] CORS 설정
  - [ ] SQL Injection 방지
  - [ ] XSS 방지
  - [ ] 입력 검증 강화

- [x] **테스트** (매물 서비스)
  - [x] ✅ 단위 테스트 (PropertyService - 34개)
  - [x] ✅ 통합 테스트 (Properties API - 32개)
  - [ ] 다른 서비스 테스트 (진행 필요)

---

## 3. AI 서비스

### 완료됨 ✅
- [x] **LLM 모듈 구조** (`ai-service/app/llm/`)
  - [x] LLM 베이스 인터페이스 (`base.py`)
  - [x] OpenAI LLM 구현
  - [x] Anthropic LLM 구현
  - [x] LLM Factory 패턴

- [x] **RAG 시스템** (`ai-service/app/llm/rag/`)
  - [x] 임베딩 서비스 (`embeddings.py`) - OpenAI text-embedding-3-small
  - [x] 벡터 스토어 (`vector_store.py`) - Chroma, Qdrant 지원
  - [x] RAG 검색기 (`retriever.py`) - 유사도 기반 문서 검색
  - [x] 문서 추가/삭제 API

- [x] **Graph RAG 시스템** (`ai-service/app/llm/graph/`)
  - [x] 지식 그래프 (`knowledge_graph.py`) - Neo4j, InMemory 지원
  - [x] 노드/엣지 타입 정의 (부동산 도메인 특화)
  - [x] Graph RAG 검색기 (`graph_retriever.py`)
  - [x] 엔티티 추출 (LLM 기반 + 키워드 기반)

- [x] **통합 채팅 서비스** (`ai-service/app/llm/chat.py`)
  - [x] 하이브리드 검색 (RAG + Graph RAG)
  - [x] 검색 모드 선택 (rag, graph, hybrid)
  - [x] 컨텍스트 결합 및 프롬프트 엔지니어링
  - [x] 스트리밍 응답 지원
  - [x] 등기부등본 분석 기능

- [x] **API 엔드포인트** (`ai-service/app/api/v1/chat.py`)
  - [x] `POST /api/v1/chat/complete` - 채팅 완성
  - [x] `POST /api/v1/chat/stream` - 스트리밍 응답
  - [x] `POST /api/v1/chat/analyze-registry` - 등기부등본 분석
  - [x] `POST /api/v1/chat/documents/add` - 문서 추가
  - [x] `POST /api/v1/chat/documents/delete` - 문서 삭제

- [x] **문서화**
  - [x] README.md (설치, 설정, API 설명)
  - [x] API 사용 예제 (`docs/api-examples.md`)
  - [x] 아키텍처 문서 (`docs/architecture.md`)

### 진행 필요 🔄
- [ ] **등기부등본 분석**
  - [ ] OCR 엔진 연동 (Tesseract/Google Vision/Naver Clova)
  - [ ] 문서 구조 파싱
  - [ ] 권리관계 추출
  - [ ] 말소기준권리 판단 로직
  - [ ] 위험 요소 분석

- [ ] **분석 모델**
  - [ ] 안전점수 계산 모델
  - [ ] 적정 입찰가 추천 모델
  - [ ] 시세 예측 모델
  - [ ] 유사 매물 추천

- [ ] **데이터 구축**
  - [ ] 부동산 경매 지식 문서 임베딩
  - [ ] 지식 그래프 데이터 구축
  - [ ] 법률/용어 사전 구축

---

## 4. 인프라

### Docker ✅
- [x] Frontend Dockerfile
- [x] Backend Dockerfile
- [x] AI Service Dockerfile
- [x] Docker Compose (로컬 개발)
  - [x] PostgreSQL
  - [x] Redis
  - [x] Nginx

### Kubernetes ✅
- [x] 네임스페이스 설정
- [x] ConfigMap/Secret
- [x] Deployment 매니페스트
  - [x] Frontend
  - [x] Backend
  - [x] AI Service
- [x] Service 매니페스트
- [x] Ingress 설정
- [x] HPA (오토스케일링)
- [x] PVC (영구 스토리지)
- [x] Kustomize 오버레이 (dev/staging/prod)

### CI/CD ✅
- [x] GitHub Actions 워크플로우
  - [x] 린트/테스트 (ci.yml)
  - [x] Docker 이미지 빌드 (docker-build.yml)
  - [x] 배포 자동화 (deploy.yml)
  - [x] 릴리즈 자동화 (release.yml)
- [x] 환경별 배포 (dev/staging/prod)
- [x] Dependabot 설정
- [x] PR 템플릿 & CODEOWNERS

### 모니터링
- [ ] 로깅 (ELK/Loki)
- [ ] 메트릭 (Prometheus/Grafana)
- [ ] APM (Sentry)
- [ ] 알림 설정

---

## 5. 데이터

### 수집
- [ ] 경매 매물 데이터 크롤링/API
- [ ] 실거래가 데이터
- [ ] 지역 정보 데이터
- [ ] 학군/교통 데이터

### 저장
- [ ] PostgreSQL 스키마 설계
- [ ] Redis 캐싱 전략
- [ ] S3 파일 저장 구조

### 분석
- [ ] 데이터 파이프라인
- [ ] ETL 프로세스
- [ ] 데이터 품질 모니터링

---

## 6. 법적/보안 고려사항

### 개인정보
- [ ] 개인정보 처리방침
- [ ] 이용약관
- [ ] 데이터 암호화
- [ ] 접근 로그 관리

### 금융
- [ ] 투자 권유 면책 조항
- [ ] 정보 정확성 고지

---

## 7. 우선순위 (Phase)

### Phase 1: MVP (현재)
1. ✅ 프론트엔드 UI 완성
2. 🔄 백엔드 API 기본 구현
3. ✅ Docker Compose 로컬 환경
4. 🔄 Mock 데이터로 동작 확인

### Phase 2: 핵심 기능
1. 등기부등본 OCR 분석
2. AI 챗봇 기본 기능
3. 네이버 지도 연동
4. 실제 DB 연동

### Phase 3: 고급 기능
1. 매물 추천 시스템
2. 알림 시스템
3. 결제/구독 시스템
4. ✅ K8s 배포 (완료)

### Phase 4: 확장
1. 모바일 앱
2. 고급 AI 분석
3. 소셜 기능
4. B2B API

---

## 8. 기술 스택 요약

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16, React 19, Tailwind v4, shadcn/ui |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL, Redis |
| AI | OpenAI/Anthropic API, LangChain |
| OCR | Google Vision / Naver Clova |
| Storage | AWS S3 |
| Container | Docker, Kubernetes |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus, Grafana, Sentry |

---

## 9. 프로젝트 파일 구조

### AI 서비스 구조
```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI 앱
│   ├── config.py                   # 환경 설정
│   │
│   ├── api/                        # API 엔드포인트
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── chat.py             # 채팅 API
│   │
│   └── llm/                        # LLM 모듈
│       ├── __init__.py
│       ├── base.py                 # LLM 베이스 (OpenAI/Anthropic)
│       ├── chat.py                 # 통합 채팅 서비스
│       │
│       ├── rag/                    # RAG 모듈
│       │   ├── __init__.py
│       │   ├── embeddings.py       # 임베딩 서비스
│       │   ├── vector_store.py     # 벡터 스토어 (Chroma/Qdrant)
│       │   └── retriever.py        # RAG 검색기
│       │
│       └── graph/                  # Graph RAG 모듈
│           ├── __init__.py
│           ├── knowledge_graph.py  # 지식 그래프 (Neo4j/InMemory)
│           └── graph_retriever.py  # Graph RAG 검색기
│
├── docs/
│   ├── api-examples.md             # API 사용 예제
│   └── architecture.md             # 아키텍처 문서
│
├── tests/
├── requirements.txt
└── README.md
```

### 인프라 구조
```
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # 린트/테스트 워크플로우
│   │   ├── docker-build.yml    # Docker 빌드 & 푸시
│   │   ├── deploy.yml          # K8s 배포 자동화
│   │   └── release.yml         # 릴리즈 자동화
│   ├── dependabot.yml          # 의존성 자동 업데이트
│   ├── CODEOWNERS              # 코드 리뷰어 자동 할당
│   └── pull_request_template.md
│
├── infra/
│   ├── docker/
│   │   ├── frontend.Dockerfile
│   │   ├── backend.Dockerfile
│   │   ├── ai-service.Dockerfile
│   │   ├── nginx.conf
│   │   ├── init-db.sql
│   │   └── ssl/
│   │
│   └── k8s/
│       ├── base/
│       │   ├── kustomization.yaml
│       │   ├── namespace.yaml
│       │   ├── configmap.yaml
│       │   ├── secret.yaml
│       │   ├── ingress.yaml
│       │   ├── hpa.yaml
│       │   ├── pvc.yaml
│       │   ├── deployments/
│       │   │   ├── frontend.yaml
│       │   │   ├── backend.yaml
│       │   │   ├── ai-service.yaml
│       │   │   ├── postgres.yaml
│       │   │   └── redis.yaml
│       │   └── services/
│       │       ├── frontend.yaml
│       │       ├── backend.yaml
│       │       ├── ai-service.yaml
│       │       ├── postgres.yaml
│       │       └── redis.yaml
│       │
│       └── overlays/
│           ├── dev/
│           │   └── kustomization.yaml
│           ├── staging/
│           │   └── kustomization.yaml
│           └── prod/
│               └── kustomization.yaml
│
├── docker-compose.yml          # 로컬 개발 환경
│
└── docs/
    ├── PROJECT_TODO.md         # 이 문서
    └── INFRASTRUCTURE.md       # 인프라 가이드
```

---

## 10. 팀/역할 (예상)

- **프론트엔드**: UI/UX, React 개발
- **백엔드**: API, 데이터베이스, 인증
- **AI/ML**: 분석 모델, 챗봇
- **인프라**: DevOps, 배포, 모니터링
- **데이터**: 수집, ETL, 분석

---

*마지막 업데이트: 2025-01-18*

---

## 11. 모바일 / 앱 개발

### 모바일 웹 최적화
- [ ] **반응형 디자인 개선**
  - [ ] 터치 친화적 UI 컴포넌트
  - [ ] 모바일 네비게이션 (햄버거 메뉴, 바텀 탭)
  - [ ] 스와이프 제스처 지원
  - [ ] 모바일 키보드 대응 레이아웃

- [ ] **PWA (Progressive Web App)**
  - [ ] Service Worker 설정
  - [ ] 오프라인 캐싱 전략
  - [ ] 앱 매니페스트 (홈 화면 추가)
  - [ ] 푸시 알림 지원
  - [ ] 백그라운드 동기화

### 네이티브 앱 개발
- [ ] **크로스 플랫폼 프레임워크 선택**
  - [ ] React Native 또는 Flutter 평가
  - [ ] 기술 스택 결정 및 프로젝트 초기화

- [ ] **iOS 앱**
  - [ ] 프로젝트 설정 및 기본 네비게이션
  - [ ] 네이티브 카메라 연동 (등기부등본 촬영)
  - [ ] Face ID / Touch ID 인증
  - [ ] Apple 지도 연동
  - [ ] App Store 배포 준비

- [ ] **Android 앱**
  - [ ] 프로젝트 설정 및 기본 네비게이션
  - [ ] 카메라 연동 (등기부등본 촬영)
  - [ ] 생체 인증 (지문/얼굴)
  - [ ] Google Maps 연동
  - [ ] Play Store 배포 준비

### 공통 모바일 기능
- [ ] **인증**
  - [ ] 소셜 로그인 (카카오, 네이버, Apple)
  - [ ] 자동 로그인 (토큰 저장)
  - [ ] 생체 인증 통합

- [ ] **알림**
  - [ ] FCM (Firebase Cloud Messaging) 연동
  - [ ] 푸시 알림 권한 관리
  - [ ] 알림 설정 (경매일, 관심 매물, 가격 변동)

- [ ] **오프라인 지원**
  - [ ] 로컬 데이터 저장 (SQLite/Realm)
  - [ ] 오프라인 매물 조회
  - [ ] 동기화 처리

- [ ] **성능 최적화**
  - [ ] 이미지 지연 로딩
  - [ ] 목록 가상화
  - [ ] 앱 시작 시간 최적화

### 모바일 전용 기능
- [ ] **등기부등본 스캔**
  - [ ] OCR을 위한 카메라 스캔 UI
  - [ ] 이미지 크롭/보정
  - [ ] 실시간 문서 인식 가이드

- [ ] **위치 기반 서비스**
  - [ ] 현재 위치 기반 주변 매물 검색
  - [ ] 매물 방문 경로 안내
  - [ ] 지오펜싱 알림

- [ ] **위젯/단축어**
  - [ ] iOS 위젯 (관심 매물 현황)
  - [ ] Android 위젯
  - [ ] Siri/Google Assistant 연동

---

## 12. 최근 변경 이력

### 2025-01-18 (2차)
- ✅ **AI 서비스 - RAG + Graph RAG 시스템 구현 완료**
  - LLM 모듈 (`ai-service/app/llm/`)
    - OpenAI/Anthropic LLM 베이스 인터페이스
    - LLM Factory 패턴
  - RAG 모듈 (`ai-service/app/llm/rag/`)
    - 임베딩 서비스 (OpenAI text-embedding-3-small)
    - 벡터 스토어 (Chroma, Qdrant 지원)
    - RAG 검색기 (유사도 기반 문서 검색)
  - Graph RAG 모듈 (`ai-service/app/llm/graph/`)
    - 지식 그래프 (Neo4j, InMemory 지원)
    - 노드/엣지 타입 (부동산 도메인 특화)
    - Graph RAG 검색기
    - 엔티티 추출 (LLM + 키워드)
  - 통합 채팅 서비스 (`ai-service/app/llm/chat.py`)
    - 하이브리드 검색 (rag, graph, hybrid 모드)
    - 스트리밍 응답 지원
    - 등기부등본 분석 기능
  - API 엔드포인트 (`ai-service/app/api/v1/chat.py`)
    - 채팅, 스트리밍, 등기부등본 분석, 문서 관리
  - 문서화
    - `ai-service/README.md`
    - `ai-service/docs/api-examples.md`
    - `ai-service/docs/architecture.md`

### 2025-01-18 (1차)
- ✅ **매물 서비스 (PropertyService) 구현 완료**
  - 매물 검색 API (다중 필터링, 정렬, 페이징)
  - 매물 상세 조회 (권리정보, 임차인 정보 포함)
  - AI 추천 매물 조회
  - 권리분석 API (말소기준권리, 인수/소멸 권리, 위험/안전 요소)
  - 유사 매물 추천
  - 매물 CRUD (생성/수정/삭제)
  - 사건번호 조회, 다가오는 경매 조회, 안전점수 업데이트

- ✅ **매물 서비스 테스트 완료 (66개 테스트)**
  - `test_property_service.py`: 단위 테스트 34개
  - `test_properties_api.py`: API 통합 테스트 32개
  - pytest 설정 및 fixtures 구성
  - SQLite 테스트 환경 구축 (UUID 호환성 처리)
