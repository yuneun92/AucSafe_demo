"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Banknote,
  Building2,
  MapPin,
  Calendar,
  Heart,
  TrendingDown,
  Percent,
  AlertCircle,
  Info,
  ChevronRight,
} from "lucide-react"

interface NplSearchPageProps {
  onSelectNpl?: (nplId: string) => void
}

// 목업 NPL 데이터
const mockNpls = [
  {
    id: "1",
    loanNumber: "NPL-2026-0001",
    collateralType: "아파트",
    collateralAddress: "서울특별시 강남구 역삼동 123-45 역삼아파트 101동 1201호",
    location: "서울 강남구",
    loanAmount: 500000000,
    collateralValue: 750000000,
    askingPrice: 400000000,
    discountRate: 20,
    debtor: "홍*동",
    creditor: "국민은행",
    status: "매각진행중",
    dueDate: "2026-06-30",
    ltv: 66.7,
  },
  {
    id: "2",
    loanNumber: "NPL-2026-0002",
    collateralType: "오피스텔",
    collateralAddress: "서울특별시 마포구 합정동 234-56 마포오피스텔 501호",
    location: "서울 마포구",
    loanAmount: 280000000,
    collateralValue: 350000000,
    askingPrice: 210000000,
    discountRate: 25,
    debtor: "김*철",
    creditor: "신한은행",
    status: "매각진행중",
    dueDate: "2026-05-15",
    ltv: 80,
  },
  {
    id: "3",
    loanNumber: "NPL-2026-0003",
    collateralType: "상가",
    collateralAddress: "부산광역시 해운대구 우동 456-78 마린시티상가 1층",
    location: "부산 해운대구",
    loanAmount: 620000000,
    collateralValue: 800000000,
    askingPrice: 500000000,
    discountRate: 19.4,
    debtor: "이*수",
    creditor: "하나은행",
    status: "협의진행중",
    dueDate: "2026-07-20",
    ltv: 77.5,
  },
  {
    id: "4",
    loanNumber: "NPL-2026-0004",
    collateralType: "토지",
    collateralAddress: "경기도 용인시 처인구 백암면 345-67",
    location: "경기 용인시",
    loanAmount: 180000000,
    collateralValue: 280000000,
    askingPrice: 140000000,
    discountRate: 22.2,
    debtor: "박*영",
    creditor: "우리은행",
    status: "매각진행중",
    dueDate: "2026-04-30",
    ltv: 64.3,
  },
  {
    id: "5",
    loanNumber: "NPL-2026-0005",
    collateralType: "단독주택",
    collateralAddress: "대구광역시 수성구 범어동 567-89",
    location: "대구 수성구",
    loanAmount: 380000000,
    collateralValue: 520000000,
    askingPrice: 300000000,
    discountRate: 21.1,
    debtor: "최*민",
    creditor: "기업은행",
    status: "신규등록",
    dueDate: "2026-08-15",
    ltv: 73.1,
  },
]

export function NplSearchPage({ onSelectNpl }: NplSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [collateralType, setCollateralType] = useState("all")
  const [status, setStatus] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [favorites, setFavorites] = useState<string[]>([])

  const filteredNpls = mockNpls.filter((npl) => {
    const matchesSearch = npl.collateralAddress.includes(searchQuery) || npl.loanNumber.includes(searchQuery)
    const matchesRegion = region === "all" || npl.location.includes(region)
    const matchesType = collateralType === "all" || npl.collateralType === collateralType
    const matchesStatus = status === "all" || npl.status === status
    return matchesSearch && matchesRegion && matchesType && matchesStatus
  })

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }

  // 통계
  const totalLoanAmount = mockNpls.reduce((acc, n) => acc + n.loanAmount, 0)
  const avgDiscount = mockNpls.reduce((acc, n) => acc + n.discountRate, 0) / mockNpls.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Banknote className="h-6 w-6 text-primary" />
            NPL 검색
          </h1>
          <p className="text-muted-foreground mt-1">
            부실채권(Non-Performing Loan) 매물을 검색하세요
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          총 {filteredNpls.length}건
        </Badge>
      </div>

      {/* NPL 안내 */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-600 dark:text-blue-400">NPL이란?</p>
            <p className="text-sm text-muted-foreground mt-1">
              NPL(부실채권)은 은행 등 금융기관이 보유한 연체채권을 말합니다.
              담보물건을 시세보다 저렴하게 취득할 수 있는 기회가 될 수 있으나,
              채권 양수도 절차와 권리분석에 대한 전문 지식이 필요합니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{mockNpls.length}</p>
            <p className="text-sm text-muted-foreground">매물 수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{(totalLoanAmount / 100000000).toFixed(0)}억</p>
            <p className="text-sm text-muted-foreground">총 채권액</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{avgDiscount.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">평균 할인율</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">
              {mockNpls.filter((n) => n.status === "신규등록").length}
            </p>
            <p className="text-sm text-muted-foreground">신규 등록</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주소, 채권번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={status} onValueChange={setStatus}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="신규등록">신규</TabsTrigger>
                <TabsTrigger value="매각진행중">진행중</TabsTrigger>
                <TabsTrigger value="협의진행중">협의중</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="지역" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                <SelectItem value="서울">서울</SelectItem>
                <SelectItem value="경기">경기</SelectItem>
                <SelectItem value="부산">부산</SelectItem>
                <SelectItem value="대구">대구</SelectItem>
              </SelectContent>
            </Select>
            <Select value={collateralType} onValueChange={setCollateralType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="담보종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="아파트">아파트</SelectItem>
                <SelectItem value="오피스텔">오피스텔</SelectItem>
                <SelectItem value="상가">상가</SelectItem>
                <SelectItem value="토지">토지</SelectItem>
                <SelectItem value="단독주택">단독주택</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* NPL 목록 */}
      <div className="space-y-4">
        {filteredNpls.map((npl) => (
          <Card
            key={npl.id}
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onSelectNpl?.(npl.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {npl.collateralType}
                    </Badge>
                    <Badge
                      variant={npl.status === "신규등록" ? "default" : "secondary"}
                      className={npl.status === "신규등록" ? "bg-green-500" : ""}
                    >
                      {npl.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{npl.loanNumber}</span>
                  </div>
                  <p className="font-medium truncate">{npl.collateralAddress}</p>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">채권액</p>
                      <p className="font-medium">{(npl.loanAmount / 100000000).toFixed(1)}억</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">담보가치</p>
                      <p className="font-medium">{(npl.collateralValue / 100000000).toFixed(1)}억</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">매각희망가</p>
                      <p className="font-bold text-primary">{(npl.askingPrice / 100000000).toFixed(1)}억</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">할인율</p>
                      <p className="font-medium text-green-500">{npl.discountRate}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">LTV</p>
                      <p className="font-medium">{npl.ltv}%</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span>채권자: {npl.creditor}</span>
                    <span>채무자: {npl.debtor}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {npl.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      만기: {npl.dueDate}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      favorites.includes(npl.id)
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                    onClick={(e) => toggleFavorite(npl.id, e)}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(npl.id) ? "fill-current" : ""}`} />
                  </button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNpls.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
            <p className="text-sm mt-2">다른 검색 조건을 시도해보세요</p>
          </CardContent>
        </Card>
      )}

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-1">
        <Button variant="outline" size="sm" disabled>이전</Button>
        <Button variant="default" size="sm">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">다음</Button>
      </div>
    </div>
  )
}
