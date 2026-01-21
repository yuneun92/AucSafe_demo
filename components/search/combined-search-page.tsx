"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  MapPin,
  Banknote,
  Calendar,
  Building2,
  Filter,
  Heart,
  ChevronDown,
  SlidersHorizontal,
  Gavel,
  Store,
  List,
  Grid3X3,
  Map,
} from "lucide-react"

interface CombinedSearchPageProps {
  onNavigate?: (page: string) => void
  onSelectProperty?: (id: string) => void
}

// 목업 통합 검색 데이터
const mockCombinedProperties = [
  {
    id: "c1",
    type: "경매",
    title: "서울 강남구 역삼동 아파트",
    location: "서울 강남구 역삼동 123-45",
    propertyType: "아파트",
    court: "서울중앙지방법원",
    caseNumber: "2025타경12345",
    appraisalPrice: 850000000,
    minimumBid: 680000000,
    bidDate: "2026-01-25",
    bidCount: 2,
    area: "84.52㎡",
    riskScore: 85,
  },
  {
    id: "c2",
    type: "공매",
    title: "경기 수원시 팔달구 상가",
    location: "경기 수원시 팔달구 456-78",
    propertyType: "상가",
    source: "온비드",
    appraisalPrice: 420000000,
    minimumBid: 336000000,
    bidDate: "2026-01-26",
    bidCount: 0,
    area: "156.78㎡",
    riskScore: 72,
  },
  {
    id: "c3",
    type: "경매",
    title: "부산 해운대구 오피스텔",
    location: "부산 해운대구 우동 789-12",
    propertyType: "오피스텔",
    court: "부산지방법원",
    caseNumber: "2025타경54321",
    appraisalPrice: 320000000,
    minimumBid: 224000000,
    bidDate: "2026-01-27",
    bidCount: 3,
    area: "42.15㎡",
    riskScore: 90,
  },
  {
    id: "c4",
    type: "공매",
    title: "대전 유성구 토지",
    location: "대전 유성구 봉명동 234-56",
    propertyType: "토지",
    source: "캠코",
    appraisalPrice: 580000000,
    minimumBid: 464000000,
    bidDate: "2026-01-28",
    bidCount: 0,
    area: "330㎡",
    riskScore: 68,
  },
  {
    id: "c5",
    type: "경매",
    title: "인천 연수구 빌라",
    location: "인천 연수구 송도동 567-89",
    propertyType: "빌라",
    court: "인천지방법원",
    caseNumber: "2025타경98765",
    appraisalPrice: 280000000,
    minimumBid: 196000000,
    bidDate: "2026-01-29",
    bidCount: 1,
    area: "62.30㎡",
    riskScore: 78,
  },
  {
    id: "c6",
    type: "공매",
    title: "서울 마포구 다세대",
    location: "서울 마포구 합정동 321-54",
    propertyType: "다세대",
    source: "국세청",
    appraisalPrice: 450000000,
    minimumBid: 360000000,
    bidDate: "2026-01-30",
    bidCount: 0,
    area: "78.45㎡",
    riskScore: 82,
  },
]

export function CombinedSearchPage({ onNavigate, onSelectProperty }: CombinedSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all")
  const [priceRange, setPriceRange] = useState([0, 100])
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [showFilters, setShowFilters] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  const filteredProperties = mockCombinedProperties.filter((property) => {
    if (typeFilter !== "all" && property.type !== typeFilter) return false
    if (propertyTypeFilter !== "all" && property.propertyType !== propertyTypeFilter) return false
    if (searchQuery && !property.title.includes(searchQuery) && !property.location.includes(searchQuery)) return false
    const priceInBillion = property.minimumBid / 100000000
    if (priceInBillion < priceRange[0] || priceInBillion > priceRange[1]) return false
    return true
  })

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    )
  }

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">안전 {score}</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500">주의 {score}</Badge>
    return <Badge className="bg-red-500">위험 {score}</Badge>
  }

  // 통계
  const auctionCount = mockCombinedProperties.filter((p) => p.type === "경매").length
  const publicSaleCount = mockCombinedProperties.filter((p) => p.type === "공매").length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6 text-primary" />
          경·공매 통합 검색
        </h1>
        <p className="text-muted-foreground mt-1">
          경매와 공매 물건을 한 번에 검색하세요
        </p>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">전체 물건</p>
            <p className="text-2xl font-bold">{mockCombinedProperties.length}건</p>
          </CardContent>
        </Card>
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gavel className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600">경매</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{auctionCount}건</p>
          </CardContent>
        </Card>
        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Store className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">공매</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{publicSaleCount}건</p>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* 검색바 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주소, 물건명, 사건번호로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              필터
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {/* 타입 필터 */}
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">전체</TabsTrigger>
              <TabsTrigger value="경매" className="flex-1 gap-1">
                <Gavel className="h-4 w-4" />
                경매
              </TabsTrigger>
              <TabsTrigger value="공매" className="flex-1 gap-1">
                <Store className="h-4 w-4" />
                공매
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* 상세 필터 */}
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>물건 종류</Label>
                <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="아파트">아파트</SelectItem>
                    <SelectItem value="오피스텔">오피스텔</SelectItem>
                    <SelectItem value="빌라">빌라/다세대</SelectItem>
                    <SelectItem value="상가">상가</SelectItem>
                    <SelectItem value="토지">토지</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>최저가 범위: {priceRange[0]}억 ~ {priceRange[1]}억</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 결과 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          검색 결과 <strong className="text-foreground">{filteredProperties.length}</strong>건
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => onNavigate?.("combined-map")}>
            <Map className="h-4 w-4 mr-1" />
            지도 보기
          </Button>
        </div>
      </div>

      {/* 검색 결과 */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-1">다른 조건으로 검색해보세요</p>
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty?.(property.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* 썸네일 */}
                  <div className="w-24 h-24 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={property.type === "경매" ? "bg-blue-500" : "bg-green-500"}>
                        {property.type === "경매" ? <Gavel className="h-3 w-3 mr-1" /> : <Store className="h-3 w-3 mr-1" />}
                        {property.type}
                      </Badge>
                      <Badge variant="outline">{property.propertyType}</Badge>
                      {getRiskBadge(property.riskScore)}
                    </div>
                    <h3 className="font-semibold truncate">{property.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{property.location}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        {property.type === "경매" ? property.caseNumber : property.source}
                      </span>
                      <span className="text-muted-foreground">{property.area}</span>
                    </div>
                  </div>

                  {/* 가격 & 액션 */}
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">최저가</p>
                    <p className="text-lg font-bold text-primary">{formatPrice(property.minimumBid)}</p>
                    <p className="text-xs text-muted-foreground mt-1">감정가 {formatPrice(property.appraisalPrice)}</p>
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {property.bidDate.slice(5)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(property.id)
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.includes(property.id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty?.(property.id)}
            >
              <CardContent className="p-0">
                {/* 썸네일 */}
                <div className="h-40 bg-secondary flex items-center justify-center relative">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                  <Badge className={`absolute top-2 left-2 ${property.type === "경매" ? "bg-blue-500" : "bg-green-500"}`}>
                    {property.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 bg-background/80"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(property.id)
                    }}
                  >
                    <Heart
                      className={`h-4 w-4 ${favorites.includes(property.id) ? "fill-red-500 text-red-500" : ""}`}
                    />
                  </Button>
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{property.propertyType}</Badge>
                    {getRiskBadge(property.riskScore)}
                  </div>
                  <h3 className="font-semibold truncate">{property.title}</h3>
                  <p className="text-sm text-muted-foreground truncate mt-1">{property.location}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">최저가</p>
                      <p className="font-bold text-primary">{formatPrice(property.minimumBid)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">입찰일</p>
                      <p className="text-sm font-medium">{property.bidDate.slice(5)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
