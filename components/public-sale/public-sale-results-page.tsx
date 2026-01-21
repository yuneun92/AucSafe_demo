"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Trophy,
  XCircle,
  Search,
  MapPin,
  Banknote,
  TrendingUp,
  TrendingDown,
  Calendar,
  Building2,
  Filter,
} from "lucide-react"

interface PublicSaleResultsPageProps {
  onNavigate?: (page: string) => void
  onSelectProperty?: (id: string) => void
}

// 목업 공매 결과 데이터
const mockPublicSaleResults = [
  {
    id: "psr1",
    title: "서울 강남구 역삼동 상가",
    location: "서울 강남구 역삼동 123-45",
    propertyType: "상가",
    source: "온비드",
    bidDate: "2026-01-15",
    appraisalPrice: 850000000,
    minimumBid: 680000000,
    winningBid: 756000000,
    status: "낙찰",
    bidCount: 8,
    bidRate: 88.9,
  },
  {
    id: "psr2",
    title: "경기 수원시 팔달구 토지",
    location: "경기 수원시 팔달구 456-78",
    propertyType: "토지",
    source: "캠코",
    bidDate: "2026-01-14",
    appraisalPrice: 320000000,
    minimumBid: 256000000,
    winningBid: null,
    status: "유찰",
    bidCount: 0,
    bidRate: null,
  },
  {
    id: "psr3",
    title: "부산 해운대구 아파트",
    location: "부산 해운대구 우동 789-12",
    propertyType: "아파트",
    source: "온비드",
    bidDate: "2026-01-13",
    appraisalPrice: 520000000,
    minimumBid: 416000000,
    winningBid: 498000000,
    status: "낙찰",
    bidCount: 12,
    bidRate: 95.8,
  },
  {
    id: "psr4",
    title: "대전 유성구 공장",
    location: "대전 유성구 봉명동 234-56",
    propertyType: "공장",
    source: "국세청",
    bidDate: "2026-01-12",
    appraisalPrice: 1200000000,
    minimumBid: 840000000,
    winningBid: 924000000,
    status: "낙찰",
    bidCount: 5,
    bidRate: 77.0,
  },
  {
    id: "psr5",
    title: "인천 연수구 오피스텔",
    location: "인천 연수구 송도동 567-89",
    propertyType: "오피스텔",
    source: "지자체",
    bidDate: "2026-01-10",
    appraisalPrice: 280000000,
    minimumBid: 224000000,
    winningBid: null,
    status: "유찰",
    bidCount: 0,
    bidRate: null,
  },
  {
    id: "psr6",
    title: "서울 마포구 빌라",
    location: "서울 마포구 합정동 321-54",
    propertyType: "빌라",
    source: "온비드",
    bidDate: "2026-01-08",
    appraisalPrice: 380000000,
    minimumBid: 304000000,
    winningBid: 350000000,
    status: "낙찰",
    bidCount: 6,
    bidRate: 92.1,
  },
]

const sourceColors: Record<string, string> = {
  "온비드": "bg-blue-500",
  "캠코": "bg-green-500",
  "국세청": "bg-orange-500",
  "지자체": "bg-purple-500",
}

export function PublicSaleResultsPage({ onNavigate, onSelectProperty }: PublicSaleResultsPageProps) {
  const [filter, setFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredResults = mockPublicSaleResults.filter((result) => {
    if (filter !== "all" && result.status !== (filter === "won" ? "낙찰" : "유찰")) return false
    if (sourceFilter !== "all" && result.source !== sourceFilter) return false
    if (searchQuery && !result.title.includes(searchQuery) && !result.location.includes(searchQuery)) return false
    return true
  })

  // 통계
  const totalCount = mockPublicSaleResults.length
  const wonCount = mockPublicSaleResults.filter((r) => r.status === "낙찰").length
  const failedCount = mockPublicSaleResults.filter((r) => r.status === "유찰").length
  const avgBidRate = mockPublicSaleResults
    .filter((r) => r.bidRate !== null)
    .reduce((acc, r) => acc + (r.bidRate || 0), 0) / wonCount

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          공매 입찰 결과
        </h1>
        <p className="text-muted-foreground mt-1">
          최근 공매 낙찰 및 유찰 결과를 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">전체 공매</p>
            <p className="text-2xl font-bold">{totalCount}건</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-green-600">낙찰</p>
            <p className="text-2xl font-bold text-green-600">{wonCount}건</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-red-600">유찰</p>
            <p className="text-2xl font-bold text-red-600">{failedCount}건</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-primary">평균 낙찰가율</p>
            <p className="text-2xl font-bold text-primary">{avgBidRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="물건명, 소재지 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="won">낙찰</TabsTrigger>
                <TabsTrigger value="failed">유찰</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="출처 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 출처</SelectItem>
                <SelectItem value="온비드">온비드</SelectItem>
                <SelectItem value="캠코">캠코</SelectItem>
                <SelectItem value="국세청">국세청</SelectItem>
                <SelectItem value="지자체">지자체</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 결과 목록 */}
      <div className="space-y-3">
        {filteredResults.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        ) : (
          filteredResults.map((result) => (
            <Card
              key={result.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty?.(result.id)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* 상태 배지 */}
                  <div className="flex items-center gap-2 md:w-24">
                    {result.status === "낙찰" ? (
                      <Badge className="bg-green-500 gap-1">
                        <Trophy className="h-3 w-3" />
                        낙찰
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        유찰
                      </Badge>
                    )}
                  </div>

                  {/* 물건 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={sourceColors[result.source]} variant="secondary">
                        {result.source}
                      </Badge>
                      <Badge variant="outline">{result.propertyType}</Badge>
                    </div>
                    <h3 className="font-semibold truncate">{result.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{result.location}</span>
                    </div>
                  </div>

                  {/* 가격 정보 */}
                  <div className="grid grid-cols-3 gap-4 md:w-auto md:min-w-[400px]">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">감정가</p>
                      <p className="font-medium">{formatPrice(result.appraisalPrice)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">최저가</p>
                      <p className="font-medium">{formatPrice(result.minimumBid)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">낙찰가</p>
                      {result.winningBid ? (
                        <p className="font-bold text-green-600">{formatPrice(result.winningBid)}</p>
                      ) : (
                        <p className="text-muted-foreground">-</p>
                      )}
                    </div>
                  </div>

                  {/* 추가 정보 */}
                  <div className="flex items-center gap-4 text-sm md:w-32">
                    {result.bidRate !== null && (
                      <div className="flex items-center gap-1">
                        {result.bidRate >= 90 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="font-medium">{result.bidRate}%</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{result.bidDate.slice(5)}</span>
                    </div>
                  </div>
                </div>

                {/* 입찰 정보 (낙찰 시) */}
                {result.status === "낙찰" && (
                  <div className="mt-3 pt-3 border-t flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      입찰자 수: <strong className="text-foreground">{result.bidCount}명</strong>
                    </span>
                    <span className="text-muted-foreground">
                      낙찰가율: <strong className="text-foreground">{result.bidRate}%</strong>
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4 inline mr-2" />
          공매 결과는 각 기관(온비드, 캠코, 국세청, 지자체)의 공식 발표를 기준으로 합니다.
          실제 결과와 차이가 있을 수 있으니 해당 기관에서 최종 확인하세요.
        </CardContent>
      </Card>
    </div>
  )
}
