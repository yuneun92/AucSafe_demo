"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Sparkles,
  ArrowRight,
  Building2,
  MessageSquare,
  TrendingUp,
  Shield,
  Search,
  ChevronRight,
  Zap,
  Target,
  MapPin,
  Loader2,
  Home,
  Flame,
  CalendarPlus,
  Calendar,
  BarChart3,
  Coins,
  PieChart,
  Landmark,
  Lock,
  Clock,
  ShieldCheck,
  RefreshCw,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface LandingPageProps {
  onNavigate: (tab: string) => void
  onSelectProperty: (property: AuctionProperty) => void
  onStartChat: (message: string) => void
  onFileUpload: (fileName: string) => void
}

// 목업 주소 검색 결과
const mockAddressResults = [
  { id: "1", address: "서울특별시 강남구 역삼동 123-45", type: "아파트", detail: "역삼자이 101동 1201호" },
  { id: "2", address: "서울특별시 강남구 역삼동 234-56", type: "오피스텔", detail: "역삼역 센트럴 오피스텔 503호" },
  { id: "3", address: "서울특별시 서초구 서초동 345-67", type: "아파트", detail: "서초래미안 202동 801호" },
  { id: "4", address: "서울특별시 송파구 잠실동 456-78", type: "아파트", detail: "잠실엘스 305동 1502호" },
  { id: "5", address: "경기도 성남시 분당구 정자동 567-89", type: "아파트", detail: "정자역 푸르지오 108동 903호" },
]

export function LandingPage({ onNavigate, onSelectProperty, onStartChat, onFileUpload }: LandingPageProps) {
  const [addressQuery, setAddressQuery] = useState("")
  const [searchResults, setSearchResults] = useState<typeof mockAddressResults>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  const topRecommended = auctionProperties.filter((p) => p.riskScore >= 80).slice(0, 3)

  // 주소 검색 처리
  useEffect(() => {
    if (addressQuery.trim().length >= 2) {
      setIsSearching(true)
      setShowResults(true)
      // 목업: 실제로는 API 호출
      const timer = setTimeout(() => {
        const filtered = mockAddressResults.filter(
          (item) =>
            item.address.includes(addressQuery) ||
            item.detail.includes(addressQuery)
        )
        setSearchResults(filtered.length > 0 ? filtered : mockAddressResults.slice(0, 3))
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
      setShowResults(false)
    }
  }, [addressQuery])

  // 외부 클릭 시 결과 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleAddressSelect = (result: typeof mockAddressResults[0]) => {
    // 선택한 주소로 등기분석 페이지 이동
    onFileUpload(result.address + " " + result.detail)
    setShowResults(false)
    setAddressQuery("")
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      onStartChat(chatInput)
      setChatInput("")
    }
  }

  const quickQuestions = [
    "5억 이하 서울 아파트 추천해줘",
    "초보자가 피해야 할 경매 물건은?",
    "수익률 좋은 오피스텔 찾아줘",
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="px-3 md:px-4 py-8 md:py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* 헤드라인 */}
          <div className="text-center space-y-3 md:space-y-4">
            <Badge variant="secondary" className="px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AI 기반 경매 분석
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              경매, <span className="text-primary">어렵지 않아요</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              복잡한 등기부등본, AI가 쉽게 해석해드려요.
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>
              권리관계부터 적정 입찰가까지 한눈에 파악하세요.
            </p>
          </div>

          {/* 메인 액션 카드들 */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* 주소 검색으로 등기부등본 분석 */}
            <Card className="overflow-hidden">
              <CardContent className="p-5 md:p-8">
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Search className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">등기부등본 분석</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      주소를 검색하면 등기부등본을 자동으로 조회해요
                    </p>
                  </div>

                  {/* 주소 검색 입력 */}
                  <div className="relative" ref={searchRef}>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="주소 또는 건물명 검색 (예: 역삼동, 잠실엘스)"
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        className="pl-10 pr-10"
                        onFocus={() => addressQuery.length >= 2 && setShowResults(true)}
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                      )}
                    </div>

                    {/* 검색 결과 드롭다운 */}
                    {showResults && searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                        {searchResults.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleAddressSelect(result)}
                            className="w-full px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                                <Home className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{result.detail}</p>
                                <p className="text-xs text-muted-foreground">{result.address}</p>
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {result.type}
                                </Badge>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    검색 후 등기부등본이 자동으로 조회됩니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI 챗봇 */}
            <Card>
              <CardContent className="p-5 md:p-8 space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500/20 to-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI에게 물어보기</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    원하는 조건을 말씀하시면 맞춤 매물을 찾아드려요
                  </p>
                </div>
                <form onSubmit={handleChatSubmit} className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="예: 강남 5억 이하 아파트 찾아줘"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:flex-wrap md:overflow-visible">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onStartChat(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" className="md:h-10 md:px-4" onClick={() => onNavigate("search")}>
              <Search className="w-4 h-4 mr-2" />
              매물 검색하기
            </Button>
            <Button variant="outline" size="sm" className="md:h-10 md:px-4" onClick={() => onNavigate("dashboard")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              시장 동향 보기
            </Button>
          </div>
        </div>
      </div>

      {/* 바로가기 섹션 */}
      <div className="border-t bg-secondary/30 px-3 md:px-4 py-6 md:py-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <h2 className="text-base md:text-lg font-semibold text-center">빠른 검색</h2>

          {/* 반값 찬스 - 강조 */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              <span className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">반값경매</span>
            </button>
            <button
              onClick={() => onNavigate("public-sale-search")}
              className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              <span className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">반값공매</span>
            </button>
            <button
              onClick={() => onNavigate("npl-search")}
              className="flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 hover:border-red-500/40 transition-colors"
            >
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              <span className="text-xs md:text-sm font-medium text-red-600 dark:text-red-400">반값NPL</span>
            </button>
          </div>

          {/* 신규/예정 */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <button
              onClick={() => onNavigate("new-auctions")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <CalendarPlus className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">경매신건</span>
            </button>
            <button
              onClick={() => onNavigate("upcoming-auctions")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">예정물건</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">최근2주변동</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium">공시1억이하</span>
            </button>
          </div>

          {/* 특수 물건 */}
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <PieChart className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs">지분경매</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <Landmark className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs">법정지상권</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <Lock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs">유치권</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs">감정1년후</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="flex flex-col items-center gap-1 p-2 md:p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <span className="text-[10px] md:text-xs">HUG</span>
            </button>
          </div>

          {/* 추가 특수 조건 */}
          <div className="flex justify-center">
            <button
              onClick={() => onNavigate("search")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 transition-colors text-xs md:text-sm text-muted-foreground"
            >
              <RefreshCw className="w-3 h-3" />
              인수조건변경 물건 보기
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* AI 추천 매물 섹션 */}
      <div className="border-t bg-card/50 px-3 md:px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                AI 추천 매물
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                권리관계가 안전하고 수익성 높은 매물만 선별했어요
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("search")}>
              전체 보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {topRecommended.map((property) => (
              <Card
                key={property.id}
                className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                onClick={() => onSelectProperty(property)}
              >
                <div className="relative h-32">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    className="absolute top-2 left-2 bg-green-500"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    안전 {property.riskScore}점
                  </Badge>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold">
                      {(property.minimumBidPrice / 100000000).toFixed(1)}억
                    </p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{property.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {property.propertyType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {property.auctionDate}
                    </span>
                  </div>
                  {/* 추천 이유 */}
                  <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      권리 깨끗 · 시세대비 30% 저렴 · 유찰 {property.failedCount}회
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 서비스 특징 */}
      <div className="px-3 md:px-4 py-8 md:py-12 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: FileText,
                title: "등기부 자동 해석",
                description: "복잡한 권리관계를 AI가 쉬운 말로 설명해드려요",
              },
              {
                icon: Zap,
                title: "적정가 추천",
                description: "인수비용까지 고려한 실제 투자비용을 계산해드려요",
              },
              {
                icon: Shield,
                title: "위험 매물 필터링",
                description: "초보자가 피해야 할 위험 요소를 미리 알려드려요",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
