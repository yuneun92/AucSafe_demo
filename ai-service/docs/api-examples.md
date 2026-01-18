# API 사용 예제

이 문서는 AucSafe AI Service API의 실제 사용 예제를 제공합니다.

## 목차

1. [기본 채팅](#기본-채팅)
2. [검색 모드별 사용](#검색-모드별-사용)
3. [대화 히스토리 활용](#대화-히스토리-활용)
4. [스트리밍 응답](#스트리밍-응답)
5. [등기부등본 분석](#등기부등본-분석)
6. [문서 관리](#문서-관리)
7. [Python 클라이언트 예제](#python-클라이언트-예제)
8. [JavaScript 클라이언트 예제](#javascript-클라이언트-예제)

---

## 기본 채팅

### 간단한 질문

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "근저당권이란 무엇인가요?"
  }'
```

**응답:**
```json
{
  "content": "근저당권은 채권자가 채무자의 부동산에 설정하는 담보권의 일종입니다...",
  "suggestions": [
    "근저당권과 저당권의 차이점은?",
    "채권최고액이란?",
    "근저당권 말소 조건은?"
  ],
  "sources": [
    {
      "type": "graph_node",
      "id": "node-123",
      "name": "근저당권",
      "node_type": "right"
    }
  ]
}
```

### 세션 ID 지정

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "경매 입찰 방법을 알려주세요",
    "session_id": "user-session-12345"
  }'
```

---

## 검색 모드별 사용

### RAG 모드 (문서 기반 검색)

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "말소기준권리에 대해 설명해주세요",
    "retrieval_mode": "rag"
  }'
```

### Graph 모드 (지식 그래프 기반 검색)

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "전세권과 관련된 권리들을 알려주세요",
    "retrieval_mode": "graph"
  }'
```

### Hybrid 모드 (통합 검색 - 기본값)

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "경매 물건의 권리분석 방법은?",
    "retrieval_mode": "hybrid"
  }'
```

---

## 대화 히스토리 활용

여러 턴의 대화를 이어가는 경우:

```bash
curl -X POST http://localhost:8001/api/v1/chat/complete \
  -H "Content-Type: application/json" \
  -d '{
    "message": "그렇다면 이 경우 어떻게 해야 하나요?",
    "session_id": "session-abc",
    "history": [
      {
        "role": "user",
        "content": "근저당권이 설정된 물건을 경매로 낙찰받으려고 합니다"
      },
      {
        "role": "assistant",
        "content": "근저당권이 설정된 물건의 경매 시 다음 사항을 확인해야 합니다..."
      },
      {
        "role": "user",
        "content": "채권최고액이 시세보다 높으면 어떻게 되나요?"
      },
      {
        "role": "assistant",
        "content": "채권최고액이 시세보다 높은 경우, 낙찰 후 배당 과정에서..."
      }
    ]
  }'
```

---

## 스트리밍 응답

실시간으로 응답을 받는 경우:

```bash
curl -X POST http://localhost:8001/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "등기부등본 보는 방법을 자세히 알려주세요",
    "stream": true
  }'
```

**응답 (Server-Sent Events):**
```
data: {"content": "등기부"}
data: {"content": "등본은"}
data: {"content": " 부동산에"}
data: {"content": " 관한"}
...
data: {"content": "확인할"}
data: {"content": " 수"}
data: {"content": " 있습니다."}
data: [DONE]
```

---

## 등기부등본 분석

### 전체 분석

```bash
curl -X POST http://localhost:8001/api/v1/chat/analyze-registry \
  -H "Content-Type: application/json" \
  -d '{
    "registry_text": "【 표  제  부 】 (부동산의 표시)\n\n표시번호 | 접수 | 소재지번 및 건물번호 | 건물내역 | 등기원인 및 기타사항\n1 | 2020년5월15일 | 서울특별시 강남구 테헤란로 123 | 철근콘크리트조 | \n\n【 갑    구 】 (소유권에 관한 사항)\n\n순위번호 | 등기목적 | 접수 | 등기원인 | 권리자 및 기타사항\n1 | 소유권이전 | 2020년5월15일 | 매매 | 소유자 홍길동\n2 | 근저당권설정 | 2021년3월10일 | 설정계약 | 채권최고액 300,000,000원 채무자 홍길동 근저당권자 KB국민은행\n\n【 을    구 】 (소유권 이외의 권리에 관한 사항)\n\n순위번호 | 등기목적 | 접수 | 등기원인 | 권리자 및 기타사항\n1 | 전세권설정 | 2021년6월20일 | 설정계약 | 전세금 200,000,000원 전세권자 김철수",
    "analysis_type": "full"
  }'
```

### 권리관계 분석

```bash
curl -X POST http://localhost:8001/api/v1/chat/analyze-registry \
  -H "Content-Type: application/json" \
  -d '{
    "registry_text": "...(등기부등본 내용)...",
    "analysis_type": "rights"
  }'
```

### 위험요소 분석

```bash
curl -X POST http://localhost:8001/api/v1/chat/analyze-registry \
  -H "Content-Type: application/json" \
  -d '{
    "registry_text": "...(등기부등본 내용)...",
    "analysis_type": "risks"
  }'
```

### 요약

```bash
curl -X POST http://localhost:8001/api/v1/chat/analyze-registry \
  -H "Content-Type: application/json" \
  -d '{
    "registry_text": "...(등기부등본 내용)...",
    "analysis_type": "summary"
  }'
```

---

## 문서 관리

### 문서 추가 (RAG)

```bash
curl -X POST http://localhost:8001/api/v1/chat/documents/add \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "id": "guide-001",
        "content": "말소기준권리란 경매로 인해 소멸되는 권리와 인수되는 권리를 구분하는 기준이 되는 권리입니다. 일반적으로 저당권, 근저당권, 담보가등기, 경매개시결정등기 중 가장 먼저 설정된 권리가 말소기준권리가 됩니다.",
        "metadata": {
          "title": "말소기준권리 설명",
          "source": "경매 가이드북",
          "category": "권리분석",
          "author": "법률팀"
        }
      },
      {
        "id": "guide-002",
        "content": "대항력은 임차인이 제3자에게 자신의 임차권을 주장할 수 있는 권리입니다. 주택임대차보호법상 대항력을 갖추려면 주택의 인도와 주민등록을 마쳐야 합니다.",
        "metadata": {
          "title": "대항력 설명",
          "source": "경매 가이드북",
          "category": "임차인 권리"
        }
      }
    ]
  }'
```

**응답:**
```json
{
  "success": true,
  "ids": ["guide-001", "guide-002"]
}
```

### 문서 삭제

```bash
curl -X POST http://localhost:8001/api/v1/chat/documents/delete \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["guide-001"]
  }'
```

**응답:**
```json
{
  "success": true
}
```

---

## Python 클라이언트 예제

### 기본 사용

```python
import httpx
import asyncio

async def chat_example():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/api/v1/chat/complete",
            json={
                "message": "경매 입찰 시 주의사항은 무엇인가요?",
                "retrieval_mode": "hybrid"
            },
            timeout=30.0
        )

        data = response.json()
        print("답변:", data["content"])
        print("추천 질문:", data["suggestions"])

asyncio.run(chat_example())
```

### 스트리밍 클라이언트

```python
import httpx
import asyncio
import json

async def stream_chat():
    async with httpx.AsyncClient() as client:
        async with client.stream(
            "POST",
            "http://localhost:8001/api/v1/chat/stream",
            json={
                "message": "등기부등본 분석 방법을 알려주세요",
                "stream": True
            },
            timeout=60.0
        ) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        print("\n[완료]")
                        break
                    try:
                        chunk = json.loads(data)
                        print(chunk.get("content", ""), end="", flush=True)
                    except json.JSONDecodeError:
                        pass

asyncio.run(stream_chat())
```

### 대화 관리 클래스

```python
import httpx
from typing import List, Dict, Optional
from dataclasses import dataclass, field

@dataclass
class ChatClient:
    base_url: str = "http://localhost:8001"
    session_id: Optional[str] = None
    history: List[Dict[str, str]] = field(default_factory=list)

    async def send_message(
        self,
        message: str,
        retrieval_mode: str = "hybrid"
    ) -> Dict:
        """메시지 전송 및 응답 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/v1/chat/complete",
                json={
                    "message": message,
                    "session_id": self.session_id,
                    "history": self.history,
                    "retrieval_mode": retrieval_mode
                },
                timeout=30.0
            )

            data = response.json()

            # 히스토리 업데이트
            self.history.append({"role": "user", "content": message})
            self.history.append({"role": "assistant", "content": data["content"]})

            return data

    def clear_history(self):
        """대화 히스토리 초기화"""
        self.history = []

# 사용 예제
async def main():
    chat = ChatClient(session_id="my-session")

    # 첫 번째 질문
    response = await chat.send_message("근저당권이란?")
    print(response["content"])

    # 후속 질문 (컨텍스트 유지)
    response = await chat.send_message("그럼 말소되는 조건은?")
    print(response["content"])

import asyncio
asyncio.run(main())
```

---

## JavaScript 클라이언트 예제

### 기본 사용 (fetch)

```javascript
async function chat(message) {
  const response = await fetch('http://localhost:8001/api/v1/chat/complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      retrieval_mode: 'hybrid'
    }),
  });

  const data = await response.json();
  console.log('답변:', data.content);
  console.log('추천 질문:', data.suggestions);
  return data;
}

// 사용
chat('경매 입찰 방법을 알려주세요');
```

### 스트리밍 클라이언트

```javascript
async function streamChat(message) {
  const response = await fetch('http://localhost:8001/api/v1/chat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      stream: true
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          console.log('\n[완료]');
          return;
        }
        try {
          const parsed = JSON.parse(data);
          process.stdout.write(parsed.content || '');
        } catch (e) {
          // JSON 파싱 실패 무시
        }
      }
    }
  }
}

// 사용
streamChat('등기부등본 분석 방법을 알려주세요');
```

### React Hook 예제

```typescript
import { useState, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResponse {
  content: string;
  suggestions?: string[];
  sources?: Array<{ type: string; id: string; name?: string }>;
}

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);

    // 사용자 메시지 추가
    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/v1/chat/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          session_id: sessionId,
          history: messages,
          retrieval_mode: 'hybrid'
        }),
      });

      const data: ChatResponse = await response.json();

      // AI 응답 추가
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.content };
      setMessages(prev => [...prev, assistantMessage]);
      setSuggestions(data.suggestions || []);

      return data;
    } finally {
      setIsLoading(false);
    }
  }, [messages, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
  }, []);

  return { messages, isLoading, suggestions, sendMessage, clearChat };
}

// 컴포넌트에서 사용
function ChatComponent() {
  const { messages, isLoading, suggestions, sendMessage } = useChat('my-session');

  // ... 컴포넌트 구현
}
```

---

## 에러 처리

### 에러 응답 형식

```json
{
  "detail": "에러 메시지"
}
```

### 일반적인 에러 코드

| 상태 코드 | 설명 |
|----------|------|
| 400 | 잘못된 요청 (RAG 미설정 상태에서 문서 추가 등) |
| 500 | 서버 내부 오류 (LLM API 오류 등) |

### 에러 처리 예제

```python
import httpx

async def safe_chat(message: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "http://localhost:8001/api/v1/chat/complete",
                json={"message": message},
                timeout=30.0
            )

            if response.status_code == 200:
                return response.json()
            else:
                error = response.json()
                print(f"오류 발생: {error.get('detail', '알 수 없는 오류')}")
                return None

    except httpx.TimeoutException:
        print("요청 시간 초과")
        return None
    except httpx.RequestError as e:
        print(f"요청 오류: {e}")
        return None
```
