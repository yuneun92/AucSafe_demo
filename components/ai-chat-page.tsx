"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sparkles,
  Send,
  Building2,
  TrendingUp,
  Shield,
  MapPin,
  Calendar,
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Copy,
  MoreHorizontal,
  Search,
  FileText,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  cards?: MessageCard[]
  suggestions?: string[]
}

interface MessageCard {
  type: "property" | "analysis" | "tip" | "warning"
  data: any
}

interface AIChatPageProps {
  initialMessage?: string
  onSelectProperty: (property: AuctionProperty) => void
  onNavigate: (tab: string) => void
}

const quickPrompts = [
  { icon: Search, label: "5억 이하 서울 아파트", prompt: "5억 이하 서울 아파트 추천해줘" },
  { icon: Shield, label: "안전한 매물 추천", prompt: "초보자도 안전하게 투자할 수 있는 매물 추천해줘" },
  { icon: TrendingUp, label: "수익률 좋은 매물", prompt: "수익률이 좋은 오피스텔 찾아줘" },
  { icon: HelpCircle, label: "경매 기초 상담", prompt: "경매 처음인데 어떻게 시작해야 해?" },
]

export function AIChatPage({ initialMessage, onSelectProperty, onNavigate }: AIChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "안녕하세요! AucSafe AI 상담사입니다. 경매 매물 검색, 권리분석, 투자 상담 등 무엇이든 물어보세요.",
      timestamp: new Date(),
      suggestions: ["5억 이하 강남 아파트 찾아줘", "초보자가 피해야 할 매물은?", "권리분석이 뭐야?"],
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 초기 메시지가 있으면 자동 전송
  useEffect(() => {
    if (initialMessage) {
      handleSend(initialMessage)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const response = generateAIResponse(messageText)
      setMessages((prev) => [...prev, response])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const generateAIResponse = (input: string): Message => {
    const lowerInput = input.toLowerCase()
    let content = ""
    let cards: MessageCard[] = []
    let suggestions: string[] = []

    // 매물 검색 관련
    if (lowerInput.includes("아파트") || lowerInput.includes("찾아") || lowerInput.includes("추천") || lowerInput.includes("검색")) {
      const filteredProperties = auctionProperties.filter((p) => {
        if (lowerInput.includes("강남") && !p.location.includes("강남")) return false
        if (lowerInput.includes("서울") && !p.location.includes("서울")) return false
        if (lowerInput.includes("5억") && p.minimumBidPrice > 500000000) return false
        if (lowerInput.includes("안전") && p.riskScore < 80) return false
        if (lowerInput.includes("오피스텔") && p.propertyType !== "오피스텔") return false
        return true
      }).slice(0, 3)

      if (filteredProperties.length > 0) {
        content = `조건에 맞는 매물 ${filteredProperties.length}건을 찾았어요! 각 매물의 특징을 정리해드릴게요.`
        cards = filteredProperties.map((p) => ({
          type: "property" as const,
          data: p,
        }))
        suggestions = ["이 중에 가장 안전한 매물은?", "더 저렴한 매물 있어?", "권리분석 자세히 알려줘"]
      } else {
        content = "조건에 맞는 매물을 찾지 못했어요. 조건을 조금 완화해볼까요?"
        suggestions = ["전체 서울 지역으로 검색", "가격 범위 늘려서 검색", "다른 유형 매물 보기"]
      }
    }
    // 권리분석 관련
    else if (lowerInput.includes("권리") || lowerInput.includes("등기") || lowerInput.includes("말소")) {
      content = `권리분석은 경매에서 가장 중요한 부분이에요! 핵심 개념을 설명해드릴게요.`
      cards = [
        {
          type: "tip" as const,
          data: {
            title: "말소기준권리란?",
            content: "경매로 낙찰받으면 이 권리 이후에 설정된 모든 권리가 자동으로 사라져요. 보통 첫 번째 (근)저당권이 말소기준권리가 됩니다.",
            icon: "info",
          },
        },
        {
          type: "warning" as const,
          data: {
            title: "주의해야 할 권리",
            items: ["선순위 임차인 (보증금 인수해야 함)", "유치권 (현장 확인 필수)", "법정지상권 (토지와 건물 분리 시)"],
          },
        },
      ]
      suggestions = ["등기부등본 분석해줘", "임차인 대항력이 뭐야?", "안전한 매물 추천해줘"]
    }
    // 초보자 가이드
    else if (lowerInput.includes("처음") || lowerInput.includes("초보") || lowerInput.includes("시작")) {
      content = `경매 투자 처음이시군요! 단계별로 안내해드릴게요.`
      cards = [
        {
          type: "tip" as const,
          data: {
            title: "경매 투자 5단계",
            steps: [
              "1. 투자 목적과 예산 정하기",
              "2. 관심 지역 매물 검색하기",
              "3. 등기부등본으로 권리분석하기",
              "4. 현장 답사 및 시세 조사",
              "5. 입찰가 결정 후 입찰 참여",
            ],
          },
        },
      ]
      suggestions = ["안전한 매물 추천해줘", "권리분석이 뭐야?", "피해야 할 매물 특징"]
    }
    // 피해야 할 매물
    else if (lowerInput.includes("피해") || lowerInput.includes("위험") || lowerInput.includes("주의")) {
      content = `초보자가 피해야 할 매물 유형을 알려드릴게요.`
      cards = [
        {
          type: "warning" as const,
          data: {
            title: "피해야 할 매물 특징",
            items: [
              "유치권 신고된 물건 - 금액 분쟁 위험",
              "선순위 임차보증금이 높은 물건 - 실제 비용 증가",
              "법정지상권 관련 물건 - 복잡한 권리관계",
              "점유자가 많은 상가 - 명도 어려움",
              "재개발/재건축 구역 - 권리관계 불명확",
            ],
          },
        },
      ]
      suggestions = ["안전한 매물만 보여줘", "안전점수 80점 이상 매물", "권리관계 깨끗한 매물"]
    }
    // 기본 응답
    else {
      content = "네, 말씀하신 내용 이해했어요! 좀 더 구체적으로 알려주시면 맞춤 정보를 드릴 수 있어요."
      suggestions = ["매물 검색하기", "권리분석 알아보기", "투자 상담받기"]
    }

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
      cards,
      suggestions,
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion)
  }

  const handlePropertyClick = (property: AuctionProperty) => {
    onSelectProperty(property)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Chat Header */}
      <div className="border-b bg-card/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold">AucSafe AI 상담</h1>
              <p className="text-xs text-muted-foreground">매물 검색 · 권리분석 · 투자 상담</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate("search")}>
            <Search className="w-4 h-4 mr-2" />
            매물 검색
          </Button>
        </div>
      </div>

      {/* Quick Prompts - 처음에만 표시 */}
      {messages.length <= 1 && (
        <div className="border-b bg-secondary/30 px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground mb-3">이런 것들을 물어볼 수 있어요</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt.prompt)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-card border hover:border-primary/50 hover:bg-primary/5 transition-colors text-left"
                >
                  <prompt.icon className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] ${message.role === "user" ? "" : "space-y-4"}`}>
                {/* 메시지 버블 */}
                <div
                  className={`${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-3"
                      : "flex gap-3"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div className={message.role === "assistant" ? "flex-1 space-y-4" : ""}>
                    {message.role === "assistant" ? (
                      <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                      </div>
                    ) : (
                      <p className="text-sm">{message.content}</p>
                    )}

                    {/* 카드들 */}
                    {message.cards && message.cards.length > 0 && (
                      <div className="space-y-3">
                        {message.cards.map((card, i) => (
                          <div key={i}>
                            {card.type === "property" && (
                              <Card
                                className="cursor-pointer hover:border-primary/50 transition-colors"
                                onClick={() => handlePropertyClick(card.data)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <img
                                      src={card.data.image}
                                      alt={card.data.title}
                                      className="w-24 h-24 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <p className="font-semibold">{card.data.title}</p>
                                          <p className="text-sm text-muted-foreground">{card.data.location}</p>
                                        </div>
                                        <Badge
                                          className={
                                            card.data.riskScore >= 80
                                              ? "bg-green-500"
                                              : card.data.riskScore >= 60
                                                ? "bg-yellow-500"
                                                : "bg-red-500"
                                          }
                                        >
                                          {card.data.riskScore}점
                                        </Badge>
                                      </div>
                                      <div className="flex items-center gap-4 mt-2">
                                        <div>
                                          <p className="text-xs text-muted-foreground">최저가</p>
                                          <p className="font-bold text-primary">
                                            {(card.data.minimumBidPrice / 100000000).toFixed(1)}억
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">감정가</p>
                                          <p className="font-medium">
                                            {(card.data.appraisalPrice / 100000000).toFixed(1)}억
                                          </p>
                                        </div>
                                        <div>
                                          <p className="text-xs text-muted-foreground">입찰일</p>
                                          <p className="font-medium">{card.data.auctionDate}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          {card.data.propertyType}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                          유찰 {card.data.failedCount}회
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {card.type === "tip" && (
                              <Card className="border-primary/30 bg-primary/5">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-primary/20">
                                      <Lightbulb className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">{card.data.title}</p>
                                      {card.data.content && (
                                        <p className="text-sm text-muted-foreground mt-1">{card.data.content}</p>
                                      )}
                                      {card.data.steps && (
                                        <ul className="mt-2 space-y-1">
                                          {card.data.steps.map((step: string, j: number) => (
                                            <li key={j} className="text-sm text-muted-foreground">
                                              {step}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}

                            {card.type === "warning" && (
                              <Card className="border-yellow-500/30 bg-yellow-500/5">
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-full bg-yellow-500/20">
                                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div>
                                      <p className="font-semibold">{card.data.title}</p>
                                      {card.data.items && (
                                        <ul className="mt-2 space-y-1">
                                          {card.data.items.map((item: string, j: number) => (
                                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                                              <span className="text-yellow-600">•</span>
                                              {item}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 추천 질문 */}
                    {message.suggestions && message.suggestions.length > 0 && message.role === "assistant" && (
                      <div className="flex flex-wrap gap-2">
                        {message.suggestions.map((suggestion, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 타이핑 인디케이터 */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t bg-card/50 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="경매에 대해 무엇이든 물어보세요..."
              className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 flex-1"
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-lg shrink-0"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            AI가 제공하는 정보는 참고용이며, 실제 투자 결정 시 전문가 상담을 권장합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
