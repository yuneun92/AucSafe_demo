"use client"

import { useState, useRef, useEffect } from "react"
import { Sparkles, Send, X, Minimize2, Maximize2, Mic, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  actions?: { label: string; action: string }[]
}

interface FloatingChatProps {
  onFilterChange?: (filters: any) => void
  onPropertySelect?: (id: string) => void
}

const quickActions = [
  { label: "5억 이하 서울 아파트", action: "filter:price<5억,location:서울,type:아파트" },
  { label: "안전 매물 추천", action: "filter:safety>80" },
  { label: "이번 주 입찰 마감", action: "filter:deadline:thisweek" },
  { label: "권리분석 도움", action: "analyze:rights" },
]

export function FloatingChat({ onFilterChange, onPropertySelect }: FloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "안녕하세요! AucSafe AI입니다. 매물 검색, 권리분석, 투자 조언 등 무엇이든 물어보세요.",
      timestamp: new Date(),
      actions: quickActions,
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const response = generateAIResponse(input)
      setMessages((prev) => [...prev, response])
      setIsTyping(false)

      // 필터 변경 감지
      if (input.includes("서울") || input.includes("아파트") || input.includes("억")) {
        onFilterChange?.({
          location: input.includes("서울") ? "서울" : undefined,
          type: input.includes("아파트") ? "아파트" : undefined,
        })
      }
    }, 1000)
  }

  const handleQuickAction = (action: string) => {
    if (action.startsWith("filter:")) {
      const filterStr = action.replace("filter:", "")
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: `필터 적용: ${filterStr}`,
          timestamp: new Date(),
        },
      ])
      setIsTyping(true)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "필터를 적용했습니다. 조건에 맞는 매물 5건을 찾았어요. 목록에서 확인해보세요!",
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
        onFilterChange?.({ applied: true })
      }, 800)
    } else if (action.startsWith("analyze:")) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: "권리분석 도움이 필요해요",
          timestamp: new Date(),
        },
      ])
      setIsTyping(true)

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content:
              "권리분석 시 주의할 점을 알려드릴게요:\n\n1. **선순위 근저당** - 낙찰가보다 높으면 위험\n2. **임차인 현황** - 대항력 있는 임차인 확인\n3. **가처분/가등기** - 소유권 분쟁 가능성\n4. **유치권** - 현장 확인 필수\n\n특정 매물의 권리분석이 필요하시면 매물을 선택해주세요!",
            timestamp: new Date(),
          },
        ])
        setIsTyping(false)
      }, 1000)
    }
  }

  const generateAIResponse = (input: string): Message => {
    let content = ""
    let actions: { label: string; action: string }[] | undefined

    if (input.includes("아파트") || input.includes("서울")) {
      content =
        "조건에 맞는 매물을 찾아볼게요! 현재 서울 지역 아파트 경매 매물 12건이 있습니다. 가격대나 추가 조건이 있으시면 말씀해주세요."
      actions = [
        { label: "5억 이하만", action: "filter:price<5억" },
        { label: "안전 매물만", action: "filter:safety>80" },
        { label: "지도로 보기", action: "view:map" },
      ]
    } else if (input.includes("위험") || input.includes("리스크") || input.includes("권리")) {
      content =
        "권리분석에 대해 질문하셨군요! 경매 투자 시 가장 중요한 권리분석 포인트를 알려드릴게요:\n\n• 선순위 근저당 확인\n• 임차인 대항력 여부\n• 유치권/법정지상권 존재 여부\n\n특정 매물 분석이 필요하시면 매물 번호를 알려주세요!"
    } else if (input.includes("추천") || input.includes("괜찮")) {
      content =
        "회원님의 투자 성향(안정형)을 고려해서 추천드릴게요:\n\n**강남구 역삼동 아파트**가 좋아보여요!\n• AI 안전점수: 92점\n• 감정가 대비 65%\n• 권리관계 깨끗\n\n자세히 보시겠어요?"
      actions = [
        { label: "상세 보기", action: "property:1" },
        { label: "다른 추천", action: "recommend:more" },
      ]
    } else {
      content =
        "네, 말씀하신 내용 확인했습니다! 더 구체적인 조건을 알려주시면 맞춤 매물을 찾아드릴게요. 예를 들어 '강남 5억 이하 아파트' 처럼 말씀해주세요."
      actions = quickActions
    }

    return {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content,
      timestamp: new Date(),
      actions,
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-medium">AI 상담</span>
      </button>
    )
  }

  return (
    <div
      className={`fixed z-50 bg-card border border-border rounded-xl shadow-2xl flex flex-col transition-all duration-300 ${
        isExpanded ? "bottom-4 right-4 left-4 top-20 md:left-auto md:w-[500px]" : "bottom-6 right-6 w-[380px] h-[520px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AucSafe AI</h3>
            <p className="text-xs text-muted-foreground">투자 상담 & 매물 분석</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2"
                  : "space-y-2"
              }`}
            >
              {msg.role === "assistant" && (
                <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              )}
              {msg.role === "user" && <p className="text-sm">{msg.content}</p>}

              {msg.actions && msg.role === "assistant" && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.actions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickAction(action.action)}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-secondary/80 rounded-full transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Paperclip className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="메시지를 입력하세요..."
            className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button size="icon" className="h-8 w-8 shrink-0 rounded-lg" onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
