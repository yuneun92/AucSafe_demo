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
  TrendingUp,
  TrendingDown,
  Award,
  XCircle,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react"

interface AuctionResultsPageProps {
  onSelectProperty?: (propertyId: string) => void
}

// 목업 입찰 결과 데이터
const mockResults = [
  {
    id: "1",
    caseNumber: "2025타경12345",
    propertyType: "아파트",
    address: "서울특별시 강남구 역삼동 123-45",
    location: "서울 강남구",
    auctionDate: "2026-01-20",
    appraisalPrice: 850000000,
    minimumBidPrice: 680000000,
    winningBid: 720000000,
    bidCount: 8,
    result: "낙찰",
    bidRate: 84.7,
  },
  {
    id: "2",
    caseNumber: "2025타경12346",
    propertyType: "오피스텔",
    address: "서울특별시 서초구 서초동 234-56",
    location: "서울 서초구",
    auctionDate: "2026-01-20",
    appraisalPrice: 450000000,
    minimumBidPrice: 360000000,
    winningBid: null,
    bidCount: 0,
    result: "유찰",
    bidRate: 0,
  },
  {
    id: "3",
    caseNumber: "2025타경12347",
    propertyType: "빌라",
    address: "경기도 성남시 분당구 정자동 345-67",
    location: "경기 성남시",
    auctionDate: "2026-01-19",
    appraisalPrice: 380000000,
    minimumBidPrice: 304000000,
    winningBid: 350000000,
    bidCount: 5,
    result: "낙찰",
    bidRate: 92.1,
  },
  {
    id: "4",
    caseNumber: "2025타경12348",
    propertyType: "상가",
    address: "서울특별시 송파구 잠실동 456-78",
    location: "서울 송파구",
    auctionDate: "2026-01-19",
    appraisalPrice: 1200000000,
    minimumBidPrice: 960000000,
    winningBid: 1050000000,
    bidCount: 12,
    result: "낙찰",
    bidRate: 87.5,
  },
  {
    id: "5",
    caseNumber: "2025타경12349",
    propertyType: "아파트",
    address: "인천광역시 남동구 구월동 567-89",
    location: "인천 남동구",
    auctionDate: "2026-01-18",
    appraisalPrice: 520000000,
    minimumBidPrice: 416000000,
    winningBid: null,
    bidCount: 0,
    result: "유찰",
    bidRate: 0,
  },
  {
    id: "6",
    caseNumber: "2025타경12350",
    propertyType: "오피스텔",
    address: "서울특별시 마포구 합정동 678-90",
    location: "서울 마포구",
    auctionDate: "2026-01-18",
    appraisalPrice: 380000000,
    minimumBidPrice: 304000000,
    winningBid: 330000000,
    bidCount: 6,
    result: "낙찰",
    bidRate: 86.8,
  },
]

export function AuctionResultsPage({ onSelectProperty }: AuctionResultsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [resultType, setResultType] = useState("all")
  const [propertyType, setPropertyType] = useState("all")

  const filteredResults = mockResults.filter((result) => {
    const matchesSearch = result.address.includes(searchQuery) || result.caseNumber.includes(searchQuery)
    const matchesRegion = region === "all" || result.location.includes(region)
    const matchesResult = resultType === "all" || result.result === (resultType === "won" ? "낙찰" : "유찰")
    const matchesType = propertyType === "all" || result.propertyType === propertyType
    return matchesSearch && matchesRegion && matchesResult && matchesType
  })

  // 통계
  const totalCount = mockResults.length
  const wonCount = mockResults.filter((r) => r.result === "낙찰").length
  const failedCount = mockResults.filter((r) => r.result === "유찰").length
  const avgBidRate = mockResults.filter((r) => r.bidRate > 0).reduce((acc, r) => acc + r.bidRate, 0) / wonCount

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          입찰 결과
        </h1>
        <p className="text-muted-foreground mt-1">
          최근 경매 입찰 결과를 확인하세요
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{totalCount}</p>
            <p className="text-sm text-muted-foreground">전체 건수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{wonCount}</p>
            <p className="text-sm text-muted-foreground">낙찰</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{failedCount}</p>
            <p className="text-sm text-muted-foreground">유찰</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{avgBidRate.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">평균 낙찰가율</p>
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
                placeholder="주소, 사건번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={resultType} onValueChange={setResultType}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="won">낙찰</TabsTrigger>
                <TabsTrigger value="failed">유찰</TabsTrigger>
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
                <SelectItem value="인천">인천</SelectItem>
                <SelectItem value="부산">부산</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="물건종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="아파트">아파트</SelectItem>
                <SelectItem value="오피스텔">오피스텔</SelectItem>
                <SelectItem value="빌라">빌라</SelectItem>
                <SelectItem value="상가">상가</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 결과 목록 */}
      <Card>
        <CardContent className="p-0 divide-y">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredResults.map((result) => (
              <button
                key={result.id}
                onClick={() => onSelectProperty?.(result.id)}
                className="w-full text-left p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                    result.result === "낙찰"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}>
                    {result.result === "낙찰" ? (
                      <Award className="h-6 w-6" />
                    ) : (
                      <XCircle className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {result.propertyType}
                      </Badge>
                      <Badge
                        variant={result.result === "낙찰" ? "default" : "outline"}
                        className={result.result === "낙찰" ? "bg-green-500" : "text-orange-500 border-orange-500"}
                      >
                        {result.result}
                      </Badge>
                    </div>
                    <p className="font-medium truncate">{result.address}</p>
                    <p className="text-sm text-muted-foreground">{result.caseNumber}</p>

                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">감정가</p>
                        <p className="font-medium">{(result.appraisalPrice / 100000000).toFixed(1)}억</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">최저가</p>
                        <p className="font-medium">{(result.minimumBidPrice / 100000000).toFixed(1)}억</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">낙찰가</p>
                        <p className="font-medium text-primary">
                          {result.winningBid
                            ? `${(result.winningBid / 100000000).toFixed(1)}억`
                            : "-"
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">낙찰가율</p>
                        <p className={`font-medium ${result.bidRate > 0 ? "text-green-500" : ""}`}>
                          {result.bidRate > 0 ? `${result.bidRate}%` : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {result.auctionDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {result.location}
                      </span>
                      <span>입찰 {result.bidCount}명</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

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
