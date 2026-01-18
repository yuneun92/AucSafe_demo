# AucSafe 데이터베이스 스키마

## 개요

- **데이터베이스**: PostgreSQL 16
- **ORM**: SQLAlchemy 2.0 (비동기)
- **드라이버**: asyncpg

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     users       │       │   properties    │       │ property_rights │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │◄──────│ property_id(FK) │
│ email           │       │ case_number     │       │ right_type      │
│ hashed_password │       │ title           │       │ holder          │
│ name            │       │ address         │       │ amount          │
│ membership_tier │       │ property_type   │       └─────────────────┘
└────────┬────────┘       │ appraisal_price │
         │                │ minimum_bid     │       ┌─────────────────┐
         │                │ risk_score      │       │    tenants      │
         │                └────────┬────────┘       ├─────────────────┤
         │                         │                │ property_id(FK) │
         │                         │                │ deposit         │
         ▼                         ▼                │ move_in_date    │
┌─────────────────┐       ┌─────────────────┐       └─────────────────┘
│   favorites     │       │ price_history   │
├─────────────────┤       ├─────────────────┤       ┌─────────────────┐
│ user_id (FK)    │       │ property_id(FK) │       │ registry_docs   │
│ property_id(FK) │       │ auction_date    │       ├─────────────────┤
│ memo            │       │ result          │       │ user_id (FK)    │
└─────────────────┘       └─────────────────┘       │ file_url        │
         │                                          │ analysis_result │
         │                                          └─────────────────┘
         ▼
┌─────────────────┐       ┌─────────────────┐
│ notifications   │       │ chat_sessions   │───────┐
├─────────────────┤       ├─────────────────┤       │
│ user_id (FK)    │       │ user_id (FK)    │       ▼
│ type            │       │ title           │  ┌─────────────────┐
│ title           │       └─────────────────┘  │ chat_messages   │
│ message         │                            ├─────────────────┤
└─────────────────┘                            │ session_id (FK) │
                                               │ role            │
                                               │ content         │
                                               └─────────────────┘
```

---

## 테이블 상세 명세

### 1. users (사용자)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 사용자 고유 ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL, INDEX | 이메일 (로그인 ID) |
| `hashed_password` | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| `name` | VARCHAR(100) | NOT NULL | 이름 |
| `phone` | VARCHAR(20) | NULL | 전화번호 |
| `profile_image` | VARCHAR(500) | NULL | 프로필 이미지 URL |
| `membership_tier` | ENUM | NOT NULL, DEFAULT 'FREE' | 멤버십 등급 |
| `is_active` | BOOLEAN | DEFAULT TRUE | 활성화 상태 |
| `is_verified` | BOOLEAN | DEFAULT FALSE | 이메일 인증 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**ENUM: MembershipTier**
- `FREE`: 무료 회원
- `BASIC`: 베이직 회원
- `PREMIUM`: 프리미엄 회원

**관계**
- `favorites`: 1:N (관심목록)
- `notifications`: 1:N (알림)
- `chat_sessions`: 1:N (채팅 세션)
- `registry_documents`: 1:N (등기부등본)

---

### 2. properties (경매 매물)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 매물 고유 ID |
| `case_number` | VARCHAR(50) | UNIQUE, NOT NULL, INDEX | 사건번호 |
| `title` | VARCHAR(200) | NOT NULL | 매물 제목 |
| `address` | VARCHAR(500) | NOT NULL | 전체 주소 |
| `location` | VARCHAR(200) | NOT NULL | 지역 (서울시 강남구) |
| `property_type` | ENUM | NOT NULL | 부동산 유형 |
| `area` | VARCHAR(50) | NOT NULL | 면적 (표시용) |
| `area_size` | FLOAT | NOT NULL | 평수 |
| `appraisal_price` | INTEGER | NOT NULL | 감정가 (원) |
| `minimum_bid_price` | INTEGER | NOT NULL | 최저입찰가 (원) |
| `market_price` | INTEGER | NULL | 시세 (원) |
| `court` | VARCHAR(100) | NOT NULL | 담당법원 |
| `auction_date` | TIMESTAMP | NOT NULL | 경매일시 |
| `auction_round` | INTEGER | DEFAULT 1 | 경매 회차 |
| `failed_count` | INTEGER | DEFAULT 0 | 유찰 횟수 |
| `risk_score` | INTEGER | DEFAULT 50 | AI 안전점수 (0-100) |
| `status` | ENUM | DEFAULT 'SCHEDULED' | 경매 상태 |
| `images` | JSON | DEFAULT [] | 이미지 URL 배열 |
| `image` | VARCHAR(500) | NULL | 대표 이미지 |
| `latitude` | FLOAT | NULL | 위도 |
| `longitude` | FLOAT | NULL | 경도 |
| `description` | TEXT | NULL | 상세 설명 |
| `build_year` | INTEGER | NULL | 건축년도 |
| `floor` | VARCHAR(20) | NULL | 층수 |
| `total_floors` | INTEGER | NULL | 전체 층수 |
| `direction` | VARCHAR(20) | NULL | 방향 |
| `ai_analysis` | JSON | NULL | AI 분석 결과 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**ENUM: PropertyType**
- `아파트`, `오피스텔`, `빌라`, `상가`, `토지`, `기타`

**ENUM: PropertyStatus**
- `SCHEDULED`: 예정
- `IN_PROGRESS`: 진행중
- `COMPLETED`: 완료
- `CANCELLED`: 취소

**관계**
- `rights`: 1:N (권리 정보)
- `tenants`: 1:N (임차인)
- `price_history`: 1:N (입찰 이력)
- `favorites`: 1:N (관심 등록)

---

### 3. property_rights (권리 정보)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 권리 고유 ID |
| `property_id` | UUID | FK → properties.id, NOT NULL | 매물 ID |
| `right_type` | ENUM | NOT NULL | 권리 유형 |
| `registration_date` | TIMESTAMP | NOT NULL | 등기일자 |
| `holder` | VARCHAR(200) | NOT NULL | 권리자 |
| `amount` | INTEGER | NULL | 채권액 (원) |
| `is_baseline_right` | BOOLEAN | DEFAULT FALSE | 말소기준권리 여부 |
| `will_be_deleted` | BOOLEAN | DEFAULT TRUE | 낙찰 시 소멸 여부 |
| `section` | VARCHAR(10) | NOT NULL | 구분 ('gap'=갑구, 'eul'=을구) |
| `rank` | INTEGER | NOT NULL | 순위번호 |
| `note` | TEXT | NULL | 비고 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**ENUM: RightType**
- `저당권`, `전세권`, `가압류`, `가등기`, `지상권`, `임차권`, `근저당권`

---

### 4. tenants (임차인 정보)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 임차인 고유 ID |
| `property_id` | UUID | FK → properties.id, NOT NULL | 매물 ID |
| `move_in_date` | TIMESTAMP | NOT NULL | 전입일자 |
| `deposit` | INTEGER | NOT NULL | 보증금 (원) |
| `monthly_rent` | INTEGER | NULL | 월세 (원) |
| `has_opposition_right` | BOOLEAN | DEFAULT FALSE | 대항력 여부 |
| `will_be_assumed` | BOOLEAN | DEFAULT FALSE | 인수 여부 |
| `priority` | VARCHAR(20) | NOT NULL | 순위 ('SENIOR'=선순위, 'JUNIOR'=후순위) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

---

### 5. price_history (입찰 이력)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 이력 고유 ID |
| `property_id` | UUID | FK → properties.id, NOT NULL | 매물 ID |
| `auction_date` | TIMESTAMP | NOT NULL | 경매일시 |
| `round` | INTEGER | NOT NULL | 회차 |
| `minimum_bid_price` | INTEGER | NOT NULL | 최저입찰가 (원) |
| `bid_count` | INTEGER | DEFAULT 0 | 입찰자 수 |
| `highest_bid` | INTEGER | NULL | 최고 입찰가 (원) |
| `result` | VARCHAR(20) | NOT NULL | 결과 ('FAILED', 'SOLD', 'CANCELLED') |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

---

### 6. favorites (관심목록)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 관심 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 사용자 ID |
| `property_id` | UUID | FK → properties.id, NOT NULL | 매물 ID |
| `memo` | TEXT | NULL | 메모 |
| `alert_enabled` | BOOLEAN | DEFAULT TRUE | 알림 활성화 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**인덱스**: `(user_id, property_id)` UNIQUE

---

### 7. notifications (알림)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 알림 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 사용자 ID |
| `type` | ENUM | NOT NULL | 알림 유형 |
| `title` | VARCHAR(200) | NOT NULL | 제목 |
| `message` | TEXT | NOT NULL | 내용 |
| `property_id` | UUID | NULL | 관련 매물 ID |
| `read` | BOOLEAN | DEFAULT FALSE | 읽음 여부 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**ENUM: NotificationType**
- `AUCTION_REMINDER`: 경매 알림
- `PRICE_CHANGE`: 가격 변동
- `NEW_MATCH`: 신규 매칭
- `SYSTEM`: 시스템 알림
- `ANALYSIS_COMPLETE`: 분석 완료

---

### 8. chat_sessions (채팅 세션)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 세션 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 사용자 ID |
| `title` | VARCHAR(200) | NULL | 세션 제목 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일시 |

**관계**
- `messages`: 1:N (채팅 메시지)

---

### 9. chat_messages (채팅 메시지)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 메시지 고유 ID |
| `session_id` | UUID | FK → chat_sessions.id, NOT NULL | 세션 ID |
| `role` | ENUM | NOT NULL | 역할 |
| `content` | TEXT | NOT NULL | 메시지 내용 |
| `attachments` | JSON | NULL | 첨부파일 정보 |
| `cards` | JSON | NULL | 매물 카드 정보 |
| `suggestions` | JSON | NULL | 추천 질문 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |

**ENUM: MessageRole**
- `user`: 사용자
- `assistant`: AI 어시스턴트
- `system`: 시스템

---

### 10. registry_documents (등기부등본)

| 컬럼 | 타입 | 제약조건 | 설명 |
|------|------|----------|------|
| `id` | UUID | PK | 문서 고유 ID |
| `user_id` | UUID | FK → users.id, NOT NULL | 사용자 ID |
| `file_name` | VARCHAR(255) | NOT NULL | 파일명 |
| `file_url` | VARCHAR(500) | NOT NULL | S3 URL |
| `file_type` | VARCHAR(50) | NOT NULL | 파일 유형 ('pdf', 'image') |
| `file_size` | INTEGER | NULL | 파일 크기 (bytes) |
| `status` | ENUM | DEFAULT 'PENDING' | 분석 상태 |
| `property_address` | VARCHAR(500) | NULL | 부동산 주소 |
| `analysis_result` | JSON | NULL | AI 분석 결과 |
| `raw_text` | TEXT | NULL | OCR 추출 텍스트 |
| `error_message` | TEXT | NULL | 오류 메시지 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | 생성일시 |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | 수정일시 |
| `analyzed_at` | TIMESTAMP | NULL | 분석 완료일시 |

**ENUM: RegistryStatus**
- `PENDING`: 대기중
- `ANALYZING`: 분석중
- `COMPLETED`: 완료
- `FAILED`: 실패

---

## 인덱스

### 필수 인덱스

```sql
-- users
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- properties
CREATE UNIQUE INDEX idx_properties_case_number ON properties(case_number);
CREATE INDEX idx_properties_location ON properties(location);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_auction_date ON properties(auction_date);
CREATE INDEX idx_properties_status ON properties(status);

-- favorites
CREATE UNIQUE INDEX idx_favorites_user_property ON favorites(user_id, property_id);

-- notifications
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- chat_messages
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at);

-- registry_documents
CREATE INDEX idx_registry_user_status ON registry_documents(user_id, status);
```

---

## JSON 스키마

### properties.ai_analysis

```json
{
  "safety_score": 85,
  "risk_factors": [
    {
      "type": "LEASE_BURDEN",
      "severity": "HIGH",
      "description": "선순위 임차인 보증금 인수 필요"
    }
  ],
  "recommendations": [
    "권리분석 확인 필요",
    "임차인 현황 파악 권장"
  ],
  "estimated_profit_rate": 15.5,
  "analyzed_at": "2024-01-15T10:30:00Z"
}
```

### registry_documents.analysis_result

```json
{
  "property_info": {
    "address": "서울시 강남구 역삼동 123-45",
    "area": "84.5㎡",
    "building_type": "아파트"
  },
  "owners": [
    {
      "name": "홍길동",
      "share": "1/1",
      "registration_date": "2020-01-15"
    }
  ],
  "rights": [
    {
      "section": "을구",
      "rank": 1,
      "type": "근저당권",
      "holder": "○○은행",
      "amount": 300000000,
      "date": "2020-03-20"
    }
  ],
  "baseline_right": {
    "type": "근저당권",
    "date": "2020-03-20",
    "rank": 1
  },
  "risk_assessment": {
    "score": 75,
    "level": "MEDIUM",
    "summary": "말소기준권리 이후 설정된 권리 없음"
  }
}
```

### chat_messages.cards

```json
[
  {
    "type": "property",
    "property_id": "uuid-here",
    "title": "강남구 역삼동 아파트",
    "price": 500000000,
    "image": "https://..."
  }
]
```

---

## 마이그레이션 명령어

```bash
# Alembic 초기화
alembic init alembic

# 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 적용
alembic upgrade head

# 롤백
alembic downgrade -1
```

---

*마지막 업데이트: 2025-01*
