"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, Sparkles, Lightbulb, Maximize2, Minimize2 } from "lucide-react"
import { type ChatMessage, sampleChatHistory } from "@/lib/mock-data"

interface ChatbotProps {
  onFilterChange?: (filters: Record<string, unknown>) => void
  isExpanded?: boolean
  onToggleExpand?: () => void
}

const quickQuestions = [
  "5억 이하 강남 아파트 보여줘",
  "초보자에게 적합한 매물 추천",
  "권리분석 결과 깨끗한 물건만",
  "수익률 7% 이상 오피스텔",
  "다음 주 경매 예정 물건",
]

const aiResponses: Record<string, string> = {
  "5억 이하 강남 아파트": `강남구에서 5억 원 이하 아파트를 찾기는 어렵지만, 현재 경매 시장에서 몇 가지 옵션이 있습니다.

**추천 매물:**
• 역삼동 OO아파트 - 최저가 8.75억 (감정가 대비 30% 할인)
  - 역삼역 도보 5분, 공실 상태로 명도 걱정 없음
  - 추천 점수: 92점 / 리스크: 25점

인근 마포구나 성동구로 범위를 넓히면 더 많은 선택지가 있습니다. 지역을 변경해볼까요?`,
  초보자: `경매 초보자라면 다음 조건의 물건을 추천드립니다:

**초보자 추천 조건:**
1. ✅ 공실 물건 (명도 문제 없음)
2. ✅ 권리관계 깨끗 (말소기준권리 이후 전입자 없음)
3. ✅ 감정가 대비 30% 이상 할인
4. ✅ 입찰 횟수 2회 이상 (경쟁률 파악 가능)

현재 이 조건에 맞는 **3개 매물**을 찾았습니다. 목록을 확인하시겠습니까?`,
  권리분석: `권리관계가 깨끗한 물건을 필터링했습니다.

**권리분석 결과 안전 물건:**
• 수원 영통구 빌라 - 근저당권만 설정, 전입세입자 없음
• 송파구 잠실 아파트 - 권리관계 매우 깨끗

총 **2개 물건**이 "권리관계 깨끗" 조건을 만족합니다. 상세 분석을 원하시면 물건을 선택해주세요.`,
  수익률: `임대 수익률 7% 이상 오피스텔을 검색했습니다.

**높은 수익률 예상 물건:**
• 마포구 상암동 오피스텔
  - 최저가: 2.66억
  - 예상 월세: 150만원
  - 예상 수익률: **6.8%**
  - DMC 역세권으로 임대 수요 높음

현재 7% 이상은 없지만, 6% 이상 물건 **2개**가 있습니다.`,
  "다음 주": `다음 주(2월 15일 ~ 2월 22일) 경매 예정 물건입니다.

**2월 15일:**
• 강남구 역삼동 아파트 (2024타경12345)

**2월 20일:**
• 마포구 상암동 오피스텔 (2024타경23456)

입찰 준비를 위해 상세 분석이 필요하시면 물건을 선택해주세요.`,
}

export function Chatbot({ onFilterChange, isExpanded = false, onToggleExpand }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatHistory)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      let responseContent = "죄송합니다, 해당 질문에 대한 답변을 준비 중입니다. 다른 질문이 있으시면 말씀해주세요."
      let suggestions: string[] = []

      // Match keywords for demo responses
      for (const [keyword, response] of Object.entries(aiResponses)) {
        if (input.includes(keyword) || input.toLowerCase().includes(keyword.toLowerCase())) {
          responseContent = response
          break
        }
      }

      // Add suggestions based on context
      if (input.includes("강남") || input.includes("아파트")) {
        suggestions = ["마포구로 지역 변경", "예산 늘려서 다시 검색", "오피스텔로 변경"]
      } else if (input.includes("초보")) {
        suggestions = ["추천 물건 보기", "경매 기초 가이드", "위험 물건 피하는 법"]
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date(),
        suggestions,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
    handleSend()
  }

  return (
    <Card className={`bg-card border-border flex flex-col ${isExpanded ? "h-[600px]" : "h-[500px]"}`}>
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">AI 경매 어시스턴트</CardTitle>
              <p className="text-xs text-muted-foreground">자연어로 조건을 변경하세요</p>
            </div>
          </div>
          {onToggleExpand && (
            <Button variant="ghost" size="icon" onClick={onToggleExpand}>
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className={`flex-1 space-y-2 ${message.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`inline-block rounded-lg px-4 py-2 text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-left">{message.content}</div>
                  </div>
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-start">
                      {message.suggestions.map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </div>
                <div className="bg-secondary rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        <div className="px-4 py-2 border-t border-border">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-3 w-3 text-accent" />
            <span className="text-xs text-muted-foreground">빠른 질문</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 3).map((question, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer hover:bg-secondary text-xs"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </Badge>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 5억 이하 강남 아파트 보여줘"
              className="flex-1 bg-secondary border-border"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
