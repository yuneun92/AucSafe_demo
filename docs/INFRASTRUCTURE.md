# AucSafe 인프라 가이드

## 목차
- [개요](#개요)
- [아키텍처](#아키텍처)
- [Docker 로컬 개발 환경](#docker-로컬-개발-환경)
- [Kubernetes 배포](#kubernetes-배포)
- [CI/CD 파이프라인](#cicd-파이프라인)
- [환경 변수 설정](#환경-변수-설정)
- [트러블슈팅](#트러블슈팅)

---

## 개요

AucSafe 플랫폼은 다음 서비스로 구성됩니다:

| 서비스 | 기술 스택 | 포트 | 설명 |
|--------|-----------|------|------|
| Frontend | Next.js 16, React 19 | 3000 | 웹 클라이언트 |
| Backend | FastAPI, SQLAlchemy | 8000 | REST API 서버 |
| AI Service | FastAPI, LangChain | 8001 | AI 분석/챗봇 서비스 |
| PostgreSQL | PostgreSQL 16 | 5432 | 메인 데이터베이스 |
| Redis | Redis 7 | 6379 | 캐시/세션 스토리지 |
| Nginx | Nginx Alpine | 80/443 | 리버스 프록시 |

---

## 아키텍처

```
                                    ┌─────────────────────────────────────────┐
                                    │              Kubernetes Cluster          │
                                    │                                          │
    ┌──────────┐                    │  ┌─────────────────────────────────────┐ │
    │  Client  │──── HTTPS ─────────┼─▶│           Ingress (Nginx)           │ │
    └──────────┘                    │  └─────────────────────────────────────┘ │
                                    │       │              │            │      │
                                    │       ▼              ▼            ▼      │
                                    │  ┌─────────┐   ┌─────────┐  ┌─────────┐  │
                                    │  │Frontend │   │ Backend │  │   AI    │  │
                                    │  │ (Next)  │   │(FastAPI)│  │ Service │  │
                                    │  └─────────┘   └────┬────┘  └────┬────┘  │
                                    │                     │            │       │
                                    │              ┌──────┴────────────┘       │
                                    │              │                           │
                                    │         ┌────▼────┐    ┌─────────┐       │
                                    │         │PostgreSQL│    │  Redis  │       │
                                    │         └─────────┘    └─────────┘       │
                                    │              │              │            │
                                    │         ┌────▼──────────────▼────┐       │
                                    │         │   Persistent Storage   │       │
                                    │         └────────────────────────┘       │
                                    └──────────────────────────────────────────┘
```

---

## Docker 로컬 개발 환경

### 사전 요구사항

- Docker 24.0+
- Docker Compose 2.20+

### 빠른 시작

```bash
# 1. 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값 설정

# 2. 전체 서비스 시작
docker-compose up -d

# 3. 로그 확인
docker-compose logs -f

# 4. 서비스 중지
docker-compose down
```

### 개별 서비스 관리

```bash
# 특정 서비스만 빌드
docker-compose build frontend
docker-compose build backend
docker-compose build ai-service

# 특정 서비스만 재시작
docker-compose restart backend

# 특정 서비스 로그 확인
docker-compose logs -f backend

# 컨테이너 쉘 접속
docker-compose exec backend bash
docker-compose exec postgres psql -U aucsafe
```

### 데이터베이스 관리

```bash
# PostgreSQL 접속
docker-compose exec postgres psql -U aucsafe -d aucsafe

# 데이터베이스 백업
docker-compose exec postgres pg_dump -U aucsafe aucsafe > backup.sql

# 데이터베이스 복원
docker-compose exec -T postgres psql -U aucsafe aucsafe < backup.sql

# Redis CLI 접속
docker-compose exec redis redis-cli
```

### 볼륨 관리

```bash
# 볼륨 목록 확인
docker volume ls | grep aucsafe

# 데이터 완전 초기화 (주의: 모든 데이터 삭제)
docker-compose down -v
```

### 서비스 접속 URL

| 서비스 | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Backend Docs | http://localhost:8000/docs |
| AI Service | http://localhost:8001 |
| Nginx (통합) | http://localhost |

---

## Kubernetes 배포

### 사전 요구사항

- kubectl 1.28+
- Kubernetes 클러스터 (EKS, GKE, AKS, 또는 로컬 minikube/kind)
- kustomize 5.0+ (또는 kubectl에 내장된 버전)

### 디렉토리 구조

```
infra/k8s/
├── base/                    # 기본 매니페스트
│   ├── kustomization.yaml
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   ├── pvc.yaml
│   ├── deployments/
│   │   ├── frontend.yaml
│   │   ├── backend.yaml
│   │   ├── ai-service.yaml
│   │   ├── postgres.yaml
│   │   └── redis.yaml
│   └── services/
│       ├── frontend.yaml
│       ├── backend.yaml
│       ├── ai-service.yaml
│       ├── postgres.yaml
│       └── redis.yaml
└── overlays/
    ├── dev/                 # 개발 환경 오버레이
    │   └── kustomization.yaml
    └── prod/                # 프로덕션 환경 오버레이
        └── kustomization.yaml
```

### 개발 환경 배포

```bash
# 매니페스트 미리보기
kubectl kustomize infra/k8s/overlays/dev

# 개발 환경 배포
kubectl apply -k infra/k8s/overlays/dev

# 배포 상태 확인
kubectl get all -n aucsafe-dev

# 파드 로그 확인
kubectl logs -f deployment/dev-backend -n aucsafe-dev
```

### 프로덕션 환경 배포

```bash
# Secrets 먼저 설정 (권장: External Secrets Operator 또는 Sealed Secrets 사용)
kubectl create secret generic aucsafe-secrets \
  --from-literal=JWT_SECRET_KEY='your-secure-secret' \
  --from-literal=POSTGRES_PASSWORD='secure-password' \
  --from-literal=OPENAI_API_KEY='sk-xxx' \
  -n aucsafe-prod

# 프로덕션 배포
kubectl apply -k infra/k8s/overlays/prod

# 롤아웃 상태 확인
kubectl rollout status deployment/prod-backend -n aucsafe-prod
```

### 스케일링

```bash
# 수동 스케일링
kubectl scale deployment/prod-backend --replicas=5 -n aucsafe-prod

# HPA 상태 확인
kubectl get hpa -n aucsafe-prod

# HPA 상세 정보
kubectl describe hpa prod-backend-hpa -n aucsafe-prod
```

### 모니터링

```bash
# 파드 상태 확인
kubectl get pods -n aucsafe-prod -w

# 리소스 사용량 확인
kubectl top pods -n aucsafe-prod
kubectl top nodes

# 이벤트 확인
kubectl get events -n aucsafe-prod --sort-by='.lastTimestamp'

# 파드 상세 정보
kubectl describe pod <pod-name> -n aucsafe-prod
```

### 롤백

```bash
# 롤아웃 히스토리 확인
kubectl rollout history deployment/prod-backend -n aucsafe-prod

# 이전 버전으로 롤백
kubectl rollout undo deployment/prod-backend -n aucsafe-prod

# 특정 버전으로 롤백
kubectl rollout undo deployment/prod-backend --to-revision=2 -n aucsafe-prod
```

---

## CI/CD 파이프라인

### 워크플로우 개요

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Push/PR   │────▶│     CI      │────▶│   Docker    │
│             │     │  (Lint/Test)│     │   Build     │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌──────────────────────────┘
                    │
                    ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Dev      │◀────│   Deploy    │────▶│  Staging    │
│ Environment │     │  Workflow   │     │ Environment │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼ (Manual Approval)
                    ┌─────────────┐
                    │ Production  │
                    │ Environment │
                    └─────────────┘
```

### 워크플로우 파일

| 파일 | 트리거 | 설명 |
|------|--------|------|
| `ci.yml` | Push, PR | 린트, 타입체크, 테스트, 보안 스캔 |
| `docker-build.yml` | Push, PR, Tag | Docker 이미지 빌드 및 푸시 |
| `deploy.yml` | docker-build 완료 후 | 환경별 Kubernetes 배포 |
| `release.yml` | Tag (v*.*.*) | 릴리즈 생성 및 프로덕션 배포 |

### CI 워크플로우

```bash
# PR 생성 시 자동 실행
# - Frontend: ESLint, TypeScript 체크, 빌드 테스트
# - Backend: Black, isort, pytest
# - AI Service: Black, isort, pytest
# - Security: Trivy 취약점 스캔
```

### Docker 빌드

```bash
# 이미지 레지스트리: ghcr.io
# 이미지 태그 전략:
# - branch: ghcr.io/yuneun92/aucsafe-{service}:main
# - PR: ghcr.io/yuneun92/aucsafe-{service}:pr-123
# - Tag: ghcr.io/yuneun92/aucsafe-{service}:1.0.0
# - SHA: ghcr.io/yuneun92/aucsafe-{service}:sha-abc1234
```

### 배포 전략

| 환경 | 브랜치/트리거 | 자동/수동 |
|------|---------------|-----------|
| Development | `develop` 브랜치 | 자동 |
| Staging | `main` 브랜치 | 자동 |
| Production | 수동 트리거 또는 릴리즈 태그 | 수동 승인 필요 |

### 릴리즈 생성

```bash
# 새 릴리즈 생성 (자동으로 프로덕션 배포)
git tag v1.0.0
git push origin v1.0.0

# Pre-release (프로덕션 배포 안 함)
git tag v1.0.0-rc.1
git push origin v1.0.0-rc.1
```

### GitHub Secrets 설정

Repository Settings > Secrets and variables > Actions에서 설정:

| Secret 이름 | 설명 |
|-------------|------|
| `KUBE_CONFIG_DEV` | 개발 환경 kubeconfig (base64) |
| `KUBE_CONFIG_STAGING` | 스테이징 환경 kubeconfig (base64) |
| `KUBE_CONFIG_PROD` | 프로덕션 환경 kubeconfig (base64) |
| `SLACK_WEBHOOK_URL` | Slack 알림 웹훅 URL |

```bash
# kubeconfig를 base64로 인코딩
cat ~/.kube/config | base64 | pbcopy
```

### Dependabot

자동 의존성 업데이트가 설정되어 있습니다:
- npm (Frontend): 매주 월요일
- pip (Backend, AI Service): 매주 월요일
- GitHub Actions: 매주
- Docker: 매월

---

## 환경 변수 설정

### 필수 환경 변수

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql+asyncpg://user:pass@host:5432/db` |
| `REDIS_URL` | Redis 연결 문자열 | `redis://host:6379/0` |
| `JWT_SECRET_KEY` | JWT 서명 키 (최소 32자) | 랜덤 문자열 |
| `OPENAI_API_KEY` | OpenAI API 키 | `sk-...` |

### 선택적 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `ENVIRONMENT` | 실행 환경 | `development` |
| `DEBUG` | 디버그 모드 | `false` |
| `ANTHROPIC_API_KEY` | Anthropic API 키 | - |
| `AWS_ACCESS_KEY_ID` | AWS 액세스 키 | - |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 키 | - |
| `S3_BUCKET_NAME` | S3 버킷 이름 | `aucsafe-uploads` |

### .env 파일 예시

```env
# Application
ENVIRONMENT=development
DEBUG=true

# Database
DATABASE_URL=postgresql+asyncpg://aucsafe:aucsafe@localhost:5432/aucsafe

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
JWT_SECRET_KEY=your-super-secret-key-at-least-32-characters

# AI Services
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# AWS (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=aucsafe-uploads
```

---

## 트러블슈팅

### Docker 관련

#### 컨테이너가 시작되지 않음
```bash
# 로그 확인
docker-compose logs <service-name>

# 컨테이너 상태 확인
docker-compose ps

# 이미지 재빌드
docker-compose build --no-cache <service-name>
```

#### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :3000
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

#### 볼륨 권한 문제
```bash
# 볼륨 권한 확인
docker-compose exec postgres ls -la /var/lib/postgresql/data

# 볼륨 초기화
docker-compose down -v
docker-compose up -d
```

### Kubernetes 관련

#### 파드가 Pending 상태
```bash
# 이벤트 확인
kubectl describe pod <pod-name> -n <namespace>

# 노드 리소스 확인
kubectl describe nodes

# PVC 상태 확인
kubectl get pvc -n <namespace>
```

#### 파드가 CrashLoopBackOff 상태
```bash
# 파드 로그 확인
kubectl logs <pod-name> -n <namespace> --previous

# 컨테이너 상세 정보
kubectl describe pod <pod-name> -n <namespace>
```

#### Ingress가 작동하지 않음
```bash
# Ingress 상태 확인
kubectl get ingress -n <namespace>

# Ingress Controller 로그 확인
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx
```

#### 서비스 연결 문제
```bash
# 서비스 엔드포인트 확인
kubectl get endpoints -n <namespace>

# DNS 확인 (파드 내부에서)
kubectl exec -it <pod-name> -n <namespace> -- nslookup backend-service

# 서비스 접근 테스트
kubectl exec -it <pod-name> -n <namespace> -- curl http://backend-service:8000/health
```

### 데이터베이스 관련

#### 연결 실패
```bash
# PostgreSQL 로그 확인
kubectl logs deployment/postgres -n <namespace>

# 연결 테스트
kubectl exec -it deployment/backend -n <namespace> -- \
  python -c "import asyncpg; print('OK')"
```

#### 마이그레이션 실패
```bash
# Alembic 마이그레이션 실행
kubectl exec -it deployment/backend -n <namespace> -- \
  alembic upgrade head

# 마이그레이션 히스토리 확인
kubectl exec -it deployment/backend -n <namespace> -- \
  alembic history
```

---

## 참고 자료

- [Docker Compose 공식 문서](https://docs.docker.com/compose/)
- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
- [Kustomize 공식 문서](https://kustomize.io/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)
- [Next.js Docker 배포](https://nextjs.org/docs/deployment)
