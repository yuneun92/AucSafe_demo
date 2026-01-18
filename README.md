# AucSafe - 부동산 경매 AI 챗봇

부동산 경매 정보를 AI 기반으로 분석하고 제공하는 서비스입니다.

## 프로젝트 구조

```
├── app/                    # Next.js 프론트엔드
├── backend/                # FastAPI 백엔드
├── ai-service/             # AI/RAG 서비스
├── mobile/                 # React Native 모바일 앱
├── infra/                  # 인프라 설정
│   ├── docker/             # Docker 설정
│   └── k8s/                # Kubernetes 매니페스트
└── docs/                   # 문서
```

## 기술 스택

### Frontend
- Next.js 16
- React 19
- Tailwind CSS
- Radix UI

### Backend
- FastAPI
- PostgreSQL
- Redis

### AI Service
- LangChain
- RAG (Retrieval-Augmented Generation)
- Knowledge Graph

## 배포

### GitHub Pages (데모)

Private repo에서 main/dev 브랜치에 push하면 자동으로 빌드되어 public repo에 배포됩니다.

```
Private Repo (yuneun92/Aucsafe)
        ↓ GitHub Actions
Public Repo (yuneun92/AucSafe_demo)
        ↓ GitHub Pages
https://yuneun92.github.io/AucSafe_demo
```

#### 배포 설정 방법

1. **GitHub Personal Access Token 생성**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - `repo` 권한 선택 후 생성

2. **Private repo에 Secret 추가**
   - `yuneun92/Aucsafe` → Settings → Secrets and variables → Actions
   - Name: `DEPLOY_TOKEN`
   - Value: 생성한 토큰

3. **Public repo에서 GitHub Pages 활성화**
   - `yuneun92/AucSafe_demo` → Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` / `/ (root)`

### Kubernetes (프로덕션)

```bash
# 개발 환경
kubectl apply -k infra/k8s/overlays/dev

# 스테이징
kubectl apply -k infra/k8s/overlays/staging

# 프로덕션
kubectl apply -k infra/k8s/overlays/prod
```

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경 변수

`.env` 파일에 다음 변수들을 설정하세요:

```env
# Kakao Map API
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_api_key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 라이선스

Private
