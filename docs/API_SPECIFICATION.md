# AucSafe API 명세서

> AI 기반 부동산 경매 분석 플랫폼 백엔드 API

## 목차

1. [개요](#개요)
2. [인증](#인증)
3. [등기부등본 분석 API](#등기부등본-분석-api)
4. [매물 API](#매물-api)
5. [권리분석 API](#권리분석-api)
6. [입찰 계산 API](#입찰-계산-api)
7. [관심매물 API](#관심매물-api)
8. [알림 API](#알림-api)
9. [사용자 API](#사용자-api)
10. [AI 챗봇 API](#ai-챗봇-api)

---

## 개요

### Base URL
```
Production: https://api.aucsafe.com/v1
Development: http://localhost:8000/v1
```

### 응답 형식
모든 응답은 JSON 형식이며, 다음 구조를 따릅니다:

```json
{
  "success": true,
  "data": { ... },
  "message": "성공",
  "timestamp": "2025-01-17T10:30:00Z"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "잘못된 요청입니다",
    "details": { ... }
  },
  "timestamp": "2025-01-17T10:30:00Z"
}
```

### 에러 코드
| 코드 | HTTP Status | 설명 |
|------|-------------|------|
| `UNAUTHORIZED` | 401 | 인증 필요 |
| `FORBIDDEN` | 403 | 권한 없음 |
| `NOT_FOUND` | 404 | 리소스 없음 |
| `INVALID_REQUEST` | 400 | 잘못된 요청 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 제한 초과 |
| `INTERNAL_ERROR` | 500 | 서버 오류 |

---

## 인증

### POST /auth/login
사용자 로그인

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "김투자",
      "membershipType": "premium"
    }
  }
}
```

### POST /auth/refresh
토큰 갱신

### POST /auth/logout
로그아웃

---

## 등기부등본 분석 API

### POST /registry/upload
등기부등본 파일 업로드 및 분석 요청

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}
```

**Request Body (form-data):**
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| file | File | O | PDF 또는 이미지 파일 (최대 10MB) |
| propertyId | string | X | 연결할 매물 ID (선택) |

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis_abc123",
    "status": "processing",
    "estimatedTime": 30,
    "message": "분석이 시작되었습니다"
  }
}
```

### GET /registry/analysis/{analysisId}
등기부등본 분석 결과 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "analysisId": "analysis_abc123",
    "status": "completed",
    "fileName": "등기부등본_강남구.pdf",
    "createdAt": "2025-01-17T10:30:00Z",

    "summary": {
      "propertyType": "아파트",
      "address": "서울시 강남구 역삼동 123-45 OO아파트 102동 1502호",
      "area": "84.52㎡",
      "owner": "김OO",
      "ownershipDate": "2018-03-15"
    },

    "safetyScore": 72,
    "riskLevel": "주의",

    "baselineRight": {
      "date": "2019-05-20",
      "type": "근저당권",
      "holder": "KB국민은행",
      "amount": 360000000,
      "explanation": "이 권리를 기준으로 그 이후에 설정된 권리들은 낙찰 시 모두 말소됩니다."
    },

    "gapSection": [
      {
        "seq": 1,
        "date": "2018-03-15",
        "type": "소유권이전",
        "holder": "김OO",
        "detail": "매매",
        "status": "유효",
        "willBeCancelled": false,
        "riskLevel": "safe"
      },
      {
        "seq": 2,
        "date": "2023-11-05",
        "type": "가압류",
        "holder": "서울중앙지방법원",
        "detail": "청구금액 50,000,000원",
        "status": "유효",
        "willBeCancelled": true,
        "riskLevel": "warning"
      }
    ],

    "eulSection": [
      {
        "seq": 1,
        "date": "2019-05-20",
        "type": "근저당권설정",
        "holder": "KB국민은행",
        "detail": "채권최고액 360,000,000원",
        "isBaseline": true,
        "willBeCancelled": true,
        "riskLevel": "baseline"
      }
    ],

    "tenants": [
      {
        "name": "박OO",
        "moveInDate": "2019-03-10",
        "deposit": 120000000,
        "hasConfirmDate": true,
        "confirmDate": "2019-03-12",
        "hasCounterforce": true,
        "willBeAssumed": true,
        "explanation": "말소기준권리보다 전입일이 빠르므로 대항력이 있습니다. 낙찰자가 보증금을 인수해야 합니다."
      }
    ],

    "risks": [
      {
        "level": "high",
        "title": "선순위 임차인 존재",
        "description": "보증금 1.2억원을 인수해야 합니다",
        "solution": "낙찰가에 인수금액을 더해 실제 투자비용을 계산하세요"
      }
    ],

    "safePoints": [
      "소유자 단독 명의로 권리관계 단순",
      "유치권 신고 없음",
      "법정지상권 해당 없음"
    ],

    "aiSummary": "이 물건은 선순위 임차인(보증금 1.2억)이 있어 실제 투자비용이 입찰가보다 높습니다. 하지만 권리관계가 비교적 단순하고, 시세 대비 저렴한 가격으로 낙찰받을 수 있다면 투자 가치가 있습니다.",

    "recommendedBidRange": {
      "min": 595000000,
      "max": 637500000,
      "explanation": "감정가의 70~75%, 인수비용 고려 시 적정 수익률 확보"
    }
  }
}
```

### GET /registry/history
분석 이력 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | X | 페이지 번호 (기본: 1) |
| limit | number | X | 페이지당 개수 (기본: 10) |

---

## 매물 API

### GET /properties
매물 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | X | 페이지 번호 |
| limit | number | X | 페이지당 개수 |
| location | string | X | 지역 필터 (예: "서울 강남구") |
| propertyType | string | X | 매물 유형 (아파트, 오피스텔, 빌라, 상가) |
| minPrice | number | X | 최소 입찰가 |
| maxPrice | number | X | 최대 입찰가 |
| minSafetyScore | number | X | 최소 안전점수 |
| auctionDateFrom | string | X | 입찰일 시작 (YYYY-MM-DD) |
| auctionDateTo | string | X | 입찰일 종료 |
| sortBy | string | X | 정렬 기준 (recommended, safetyScore, price, auctionDate) |
| sortOrder | string | X | 정렬 순서 (asc, desc) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prop_123",
        "caseNumber": "2024타경12345",
        "title": "역삼동 OO아파트 102동",
        "address": "서울시 강남구 역삼동 123-45",
        "propertyType": "아파트",
        "area": "84.5㎡",
        "appraisalPrice": 1250000000,
        "minimumBidPrice": 875000000,
        "marketPrice": 1400000000,
        "auctionDate": "2025-02-15",
        "court": "서울중앙지방법원",
        "failedCount": 2,
        "safetyScore": 85,
        "recommendScore": 92,
        "location": "서울 강남구",
        "coordinates": {
          "lat": 37.5012,
          "lng": 127.0396
        },
        "image": "https://cdn.aucsafe.com/properties/prop_123/main.jpg",
        "tags": ["역세권", "학군우수", "신축"],
        "quickSummary": "권리 깨끗 · 시세대비 30% 저렴 · 유찰 2회"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### GET /properties/{propertyId}
매물 상세 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prop_123",
    "caseNumber": "2024타경12345",
    "title": "역삼동 OO아파트 102동",
    "address": "서울시 강남구 역삼동 123-45 OO아파트 102동 1502호",
    "propertyType": "아파트",
    "area": "84.5㎡",
    "floor": "15층/20층",
    "buildYear": 2015,
    "totalUnits": 500,
    "parkingSpaces": 1.2,

    "pricing": {
      "appraisalPrice": 1250000000,
      "minimumBidPrice": 875000000,
      "marketPrice": 1400000000,
      "pricePerPyeong": 28500000,
      "priceDropRate": 30
    },

    "auction": {
      "court": "서울중앙지방법원",
      "auctionDate": "2025-02-15",
      "auctionTime": "10:00",
      "failedCount": 2,
      "bidCount": 3,
      "priceHistory": [
        { "round": 1, "date": "2025-01-10", "price": 1250000000, "result": "유찰" },
        { "round": 2, "date": "2025-02-01", "price": 1000000000, "result": "유찰" },
        { "round": 3, "date": "2025-02-15", "price": 875000000, "result": "진행중" }
      ]
    },

    "analysis": {
      "safetyScore": 85,
      "recommendScore": 92,
      "occupancyStatus": "공실",
      "rights": ["근저당권", "전세권"],
      "registryIssues": ["말소기준권리 이후 전입 세입자 없음"],
      "riskSummary": {
        "level": "low",
        "mainRisks": [],
        "safePoints": ["권리관계 단순", "공실 상태"]
      }
    },

    "location": {
      "address": "서울시 강남구 역삼동 123-45",
      "coordinates": { "lat": 37.5012, "lng": 127.0396 },
      "nearbyFacilities": [
        { "type": "subway", "name": "역삼역", "distance": "500m" },
        { "type": "school", "name": "역삼초등학교", "distance": "300m" },
        { "type": "mart", "name": "이마트", "distance": "800m" }
      ]
    },

    "images": [
      { "url": "https://cdn.aucsafe.com/...", "type": "exterior" },
      { "url": "https://cdn.aucsafe.com/...", "type": "interior" }
    ],

    "description": "역삼역 도보 5분 거리 프리미엄 아파트. 남향 배치로 채광 우수.",

    "aiRecommendation": {
      "summary": "해당 물건은 권리관계가 단순하고 시세 대비 저렴합니다.",
      "recommendedBidPrice": {
        "min": 910000000,
        "max": 962500000
      },
      "expectedROI": 15.2,
      "pros": ["강남권 역세권 입지", "시세 대비 저렴한 감정가"],
      "cons": ["경쟁률 높을 것으로 예상"]
    }
  }
}
```

### GET /properties/{propertyId}/similar
유사 매물 추천

### GET /properties/recommended
AI 추천 매물 목록

---

## 권리분석 API

### GET /properties/{propertyId}/rights-analysis
매물 권리분석 상세 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "safetyScore": 85,

    "baselineRight": {
      "date": "2019-05-20",
      "type": "근저당권",
      "holder": "KB국민은행",
      "amount": 360000000
    },

    "rightsTimeline": [
      {
        "date": "2018-03-15",
        "type": "transfer",
        "title": "소유권 이전",
        "holder": "김OO",
        "isBaseline": false,
        "willBeCancelled": false,
        "description": "현재 소유자가 매매로 취득"
      },
      {
        "date": "2019-05-20",
        "type": "mortgage",
        "title": "근저당권 설정",
        "holder": "KB국민은행",
        "amount": 360000000,
        "isBaseline": true,
        "willBeCancelled": true,
        "description": "말소기준권리"
      }
    ],

    "assumedRights": [
      {
        "type": "임차보증금",
        "holder": "박OO",
        "amount": 120000000,
        "reason": "말소기준권리보다 선순위 대항력"
      }
    ],

    "totalAssumedAmount": 120000000,

    "checklist": [
      { "item": "말소기준권리 확인", "status": "checked", "detail": "2019.05.20 KB국민은행 근저당권" },
      { "item": "인수할 권리 확인", "status": "warning", "detail": "임차보증금 1.2억원" },
      { "item": "유치권 확인", "status": "checked", "detail": "미신고" },
      { "item": "법정지상권 확인", "status": "checked", "detail": "해당없음" }
    ]
  }
}
```

---

## 입찰 계산 API

### POST /properties/{propertyId}/bid-calculation
입찰가 기반 투자 비용 계산

**Request Body:**
```json
{
  "expectedBidPrice": 875000000,
  "loanAmount": 500000000,
  "loanInterestRate": 4.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "prop_123",
    "expectedBidPrice": 875000000,

    "costs": {
      "bidPrice": 875000000,
      "assumedDeposit": 120000000,
      "acquisitionTax": 40250000,
      "registrationTax": 3500000,
      "judicialScrivenerFee": 1500000,
      "otherCosts": 2000000,
      "totalInvestment": 1042250000
    },

    "profitAnalysis": {
      "marketPrice": 1400000000,
      "expectedProfit": 357750000,
      "expectedROI": 34.3,
      "breakEvenPrice": 1042250000
    },

    "rentalAnalysis": {
      "expectedMonthlyRent": 3500000,
      "annualRentalIncome": 42000000,
      "rentalYield": 4.0
    },

    "loanAnalysis": {
      "loanAmount": 500000000,
      "monthlyPayment": 2812500,
      "totalInterest": 135000000,
      "loanToValue": 47.9
    },

    "recommendation": {
      "bidPriceLevel": "적정",
      "message": "현재 입찰가 수준에서 시세 대비 약 34%의 수익이 예상됩니다."
    }
  }
}
```

---

## 관심매물 API

### GET /favorites
관심매물 목록 조회

### POST /favorites/{propertyId}
관심매물 추가

### DELETE /favorites/{propertyId}
관심매물 삭제

### PUT /favorites/{propertyId}/alert
관심매물 알림 설정

**Request Body:**
```json
{
  "priceDropAlert": true,
  "auctionDateAlert": true,
  "auctionDateAlertDays": [7, 3, 1],
  "statusChangeAlert": true
}
```

---

## 알림 API

### GET /notifications
알림 목록 조회

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|----------|------|------|
| unreadOnly | boolean | 읽지 않은 알림만 |
| type | string | 알림 유형 (price, auction, warning, system) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notif_123",
        "type": "price",
        "title": "가격 하락 알림",
        "message": "관심 매물의 최저입찰가가 10% 하락했습니다.",
        "propertyId": "prop_123",
        "propertyTitle": "역삼동 OO아파트 102동",
        "read": false,
        "createdAt": "2025-01-17T09:30:00Z"
      }
    ],
    "unreadCount": 3
  }
}
```

### PUT /notifications/{notificationId}/read
알림 읽음 처리

### PUT /notifications/read-all
전체 알림 읽음 처리

### DELETE /notifications/{notificationId}
알림 삭제

### GET /notifications/settings
알림 설정 조회

### PUT /notifications/settings
알림 설정 변경

**Request Body:**
```json
{
  "priceDropAlert": true,
  "auctionDateAlert": true,
  "rightsChangeAlert": true,
  "auctionResultAlert": true,
  "pushEnabled": true,
  "emailEnabled": false
}
```

---

## 사용자 API

### GET /users/me
내 정보 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "investor@example.com",
    "name": "김투자",
    "phone": "010-1234-5678",
    "membershipType": "premium",
    "membershipExpiry": "2025-02-15",

    "investmentProfile": {
      "experience": "intermediate",
      "investmentGoal": "rental",
      "budgetMin": 300000000,
      "budgetMax": 800000000,
      "preferredAreas": ["서울 강남", "서울 송파"],
      "preferredTypes": ["아파트", "오피스텔"],
      "riskTolerance": "moderate"
    },

    "stats": {
      "analyzedProperties": 127,
      "successfulBids": 3,
      "averageROI": 10.2
    },

    "usage": {
      "aiAnalysisUsed": 87,
      "aiAnalysisLimit": 100
    }
  }
}
```

### PUT /users/me
내 정보 수정

### PUT /users/me/investment-profile
투자 프로필 수정

**Request Body:**
```json
{
  "experience": "intermediate",
  "investmentGoal": "rental",
  "budgetMin": 300000000,
  "budgetMax": 800000000,
  "preferredAreas": ["서울 강남", "서울 송파"],
  "preferredTypes": ["아파트", "오피스텔"],
  "riskTolerance": "moderate"
}
```

### GET /users/me/history
투자 내역 조회

---

## AI 챗봇 API

### POST /chat/message
챗봇 메시지 전송

**Request Body:**
```json
{
  "message": "5억 이하 강남 아파트 추천해줘",
  "sessionId": "session_abc123",
  "context": {
    "currentPropertyId": "prop_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_abc123",
    "response": {
      "message": "조건에 맞는 매물을 찾아볼게요! 현재 강남 지역 5억 이하 아파트 경매 매물 3건이 있습니다.",
      "actions": [
        {
          "type": "filter",
          "label": "검색 결과 보기",
          "payload": {
            "location": "서울 강남구",
            "maxPrice": 500000000,
            "propertyType": "아파트"
          }
        }
      ],
      "suggestedQuestions": [
        "안전 매물만 보여줘",
        "이 중에 가장 추천하는 매물은?",
        "권리분석 자세히 알려줘"
      ],
      "relatedProperties": ["prop_456", "prop_789"]
    }
  }
}
```

### POST /chat/analyze-property
특정 매물에 대한 AI 분석 요청

**Request Body:**
```json
{
  "propertyId": "prop_123",
  "question": "이 매물의 위험 요소가 뭐야?"
}
```

### GET /chat/sessions
채팅 세션 목록

### GET /chat/sessions/{sessionId}
채팅 기록 조회

---

## 기타 API

### GET /courts
법원 목록 조회

### GET /regions
지역 목록 조회

### GET /statistics/market
시장 통계 조회

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActiveAuctions": 1523,
    "newRegistrations": 48,
    "averageBidRate": 78.5,
    "regionTrends": [
      { "region": "서울 강남", "change": 2.3, "trend": "up" },
      { "region": "서울 마포", "change": 1.8, "trend": "up" }
    ],
    "upcomingAuctions": [
      { "date": "2025-01-20", "count": 23, "court": "서울중앙지방법원" }
    ]
  }
}
```

---

## Webhook (선택사항)

### 알림 Webhook
관심 매물에 변동이 있을 때 등록된 URL로 알림 전송

**Webhook Payload:**
```json
{
  "event": "property.price_changed",
  "timestamp": "2025-01-17T10:30:00Z",
  "data": {
    "propertyId": "prop_123",
    "previousPrice": 1000000000,
    "newPrice": 875000000,
    "changeRate": -12.5
  }
}
```

---

## Rate Limiting

| 플랜 | 요청 제한 |
|------|----------|
| Free | 100 requests/hour |
| Premium | 1000 requests/hour |
| Enterprise | Unlimited |

---

## 버전 이력

| 버전 | 날짜 | 변경 사항 |
|------|------|----------|
| v1.0.0 | 2025-01-17 | 초기 버전 |

---

## 문의

API 관련 문의: api@aucsafe.com
