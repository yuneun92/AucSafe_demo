"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Building2,
  MapPin,
  Calendar,
  Heart,
  TrendingUp,
  ExternalLink,
  Landmark,
  List,
  Grid3X3,
  Map,
} from "lucide-react"

type ViewMode = "list" | "grid" | "map"

interface PublicSaleSearchPageProps {
  onSelectProperty?: (propertyId: string) => void
}

// 목업 공매 데이터
const mockPublicSales = [
  {
    id: "1",
    caseNumber: "2026-공-0001",
    propertyType: "아파트",
    address: "서울특별시 강남구 역삼동 123-45 역삼아파트 101동 1201호",
    location: "서울 강남구",
    saleDate: "2026-02-05",
    appraisalPrice: 750000000,
    minimumBidPrice: 600000000,
    organization: "한국자산관리공사",
    source: "온비드",
    status: "입찰진행중",
    bidCount: 5,
    daysLeft: 14,
  },
  {
    id: "2",
    caseNumber: "2026-공-0002",
    propertyType: "오피스텔",
    address: "서울특별시 마포구 합정동 234-56 마포오피스텔 501호",
    location: "서울 마포구",
    saleDate: "2026-02-03",
    appraisalPrice: 350000000,
    minimumBidPrice: 280000000,
    organization: "국세청",
    source: "공매",
    status: "입찰진행중",
    bidCount: 3,
    daysLeft: 12,
  },
  {
    id: "3",
    caseNumber: "2026-공-0003",
    propertyType: "토지",
    address: "경기도 용인시 처인구 백암면 345-67",
    location: "경기 용인시",
    saleDate: "2026-02-10",
    appraisalPrice: 280000000,
    minimumBidPrice: 224000000,
    organization: "지방자치단체",
    source: "이카운티",
    status: "입찰예정",
    bidCount: 0,
    daysLeft: 19,
  },
  {
    id: "4",
    caseNumber: "2026-공-0004",
    propertyType: "상가",
    address: "부산광역시 해운대구 우동 456-78 마린시티상가 B1층",
    location: "부산 해운대구",
    saleDate: "2026-02-08",
    appraisalPrice: 520000000,
    minimumBidPrice: 416000000,
    organization: "한국자산관리공사",
    source: "온비드",
    status: "입찰진행중",
    bidCount: 8,
    daysLeft: 17,
  },
  {
    id: "5",
    caseNumber: "2026-공-0005",
    propertyType: "단독주택",
    address: "대구광역시 수성구 범어동 567-89",
    location: "대구 수성구",
    saleDate: "2026-02-12",
    appraisalPrice: 680000000,
    minimumBidPrice: 544000000,
    organization: "국민건강보험공단",
    source: "공매",
    status: "입찰예정",
    bidCount: 0,
    daysLeft: 21,
  },
]

export function PublicSaleSearchPage({ onSelectProperty }: PublicSaleSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [source, setSource] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  const filteredSales = mockPublicSales.filter((sale) => {
    const matchesSearch = sale.address.includes(searchQuery) || sale.caseNumber.includes(searchQuery)
    const matchesRegion = region === "all" || sale.location.includes(region)
    const matchesType = propertyType === "all" || sale.propertyType === propertyType
    const matchesSource = source === "all" || sale.source === source
    return matchesSearch && matchesRegion && matchesType && matchesSource
  })

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Landmark className="h-6 w-6 text-primary" />
            공매 종합 검색
          </h1>
          <p className="text-muted-foreground mt-1">
            캠코, 국세청, 지자체 등 공매 물건을 통합 검색하세요
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          총 {filteredSales.length}건
        </Badge>
      </div>

      {/* 공매 출처 안내 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { name: "온비드(캠코)", count: 234, color: "bg-blue-500" },
          { name: "국세청", count: 89, color: "bg-green-500" },
          { name: "지자체", count: 156, color: "bg-orange-500" },
          { name: "기타", count: 45, color: "bg-purple-500" },
        ].map((src) => (
          <Card key={src.name}>
            <CardContent className="p-4 text-center">
              <div className={`w-3 h-3 rounded-full ${src.color} mx-auto mb-2`} />
              <p className="font-medium text-sm">{src.name}</p>
              <p className="text-lg font-bold text-primary">{src.count}건</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* 상단: 뷰모드 + 검색 */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* 뷰 모드 토글 */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4 mr-1.5" />
                  리스트
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="w-4 h-4 mr-1.5" />
                  카드
                </Button>
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="w-4 h-4 mr-1.5" />
                  지도
                </Button>
              </div>

              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="주소, 공매번호로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* 하단: 필터들 */}
            <div className="flex flex-col md:flex-row gap-4">
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="출처" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="온비드">온비드</SelectItem>
                  <SelectItem value="공매">국세청</SelectItem>
                  <SelectItem value="이카운티">지자체</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="대구">대구</SelectItem>
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
                  <SelectItem value="토지">토지</SelectItem>
                  <SelectItem value="상가">상가</SelectItem>
                  <SelectItem value="단독주택">단독주택</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="deadline">마감임박순</SelectItem>
                  <SelectItem value="price-low">가격 낮은순</SelectItem>
                  <SelectItem value="price-high">가격 높은순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 물건 목록 */}
      {viewMode === "map" ? (
        <Card className="h-[500px] flex items-center justify-center bg-secondary/30">
          <div className="text-center text-muted-foreground">
            <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">지도 뷰</p>
            <p className="text-sm mt-1">공매 물건 {filteredSales.length}건이 지도에 표시됩니다</p>
          </div>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredSales.map((sale) => (
            <Card
              key={sale.id}
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty?.(sale.id)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* 썸네일 */}
                  <div className="relative w-28 h-28 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Building2 className="h-10 w-10 text-primary/30" />
                    <div className="absolute top-1.5 left-1.5">
                      <Badge className="text-xs">{sale.propertyType}</Badge>
                    </div>
                  </div>

                  {/* 콘텐츠 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold truncate">{sale.address}</p>
                        <p className="text-sm text-muted-foreground">{sale.caseNumber} · {sale.source}</p>
                      </div>
                      <button
                        className={`p-2 rounded-full transition-colors shrink-0 ${
                          favorites.includes(sale.id)
                            ? "bg-red-500 text-white"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                        onClick={(e) => toggleFavorite(sale.id, e)}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(sale.id) ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div>
                        <p className="text-xs text-muted-foreground">최저입찰가</p>
                        <p className="font-bold text-primary">{(sale.minimumBidPrice / 100000000).toFixed(1)}억</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">감정가</p>
                        <p className="font-semibold">{(sale.appraisalPrice / 100000000).toFixed(1)}억</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">매각일</p>
                        <p className="font-medium text-sm">{sale.saleDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant={sale.status === "입찰진행중" ? "default" : "secondary"} className={sale.status === "입찰진행중" ? "bg-green-500" : ""}>
                        {sale.status}
                      </Badge>
                      {sale.daysLeft <= 7 && <Badge variant="destructive">D-{sale.daysLeft}</Badge>}
                      <Badge variant="outline">{sale.organization}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSales.map((sale) => (
            <Card
              key={sale.id}
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty?.(sale.id)}
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Building2 className="h-16 w-16 text-primary/30" />
                <button
                  className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                    favorites.includes(sale.id)
                      ? "bg-red-500 text-white"
                      : "bg-background/80 text-foreground hover:bg-background"
                  }`}
                  onClick={(e) => toggleFavorite(sale.id, e)}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(sale.id) ? "fill-current" : ""}`} />
                </button>
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge>{sale.propertyType}</Badge>
                  <Badge variant="secondary">{sale.source}</Badge>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Badge
                    variant={sale.status === "입찰진행중" ? "default" : "secondary"}
                    className={sale.status === "입찰진행중" ? "bg-green-500" : ""}
                  >
                    {sale.status}
                  </Badge>
                  {sale.daysLeft <= 7 && (
                    <Badge variant="destructive">D-{sale.daysLeft}</Badge>
                  )}
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{sale.address}</p>
                    <p className="text-xs text-muted-foreground">{sale.caseNumber}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">감정가</span>
                    <span>{(sale.appraisalPrice / 100000000).toFixed(1)}억</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">최저가</span>
                    <span className="font-bold text-primary">
                      {(sale.minimumBidPrice / 100000000).toFixed(1)}억
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주관기관</span>
                    <span className="text-xs">{sale.organization}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {sale.saleDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {sale.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredSales.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
            <p className="text-sm mt-2">다른 검색 조건을 시도해보세요</p>
          </CardContent>
        </Card>
      )}

      {/* 외부 링크 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1">
              <p className="font-medium">공매 공식 사이트 바로가기</p>
              <p className="text-sm text-muted-foreground">
                더 자세한 정보는 각 기관 공식 사이트에서 확인하세요
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                온비드
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <ExternalLink className="h-4 w-4" />
                이카운티
              </Button>
            </div>
          </div>
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
