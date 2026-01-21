"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Map,
  Search,
  MapPin,
  Building2,
  List,
  X,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Gavel,
  Store,
  Filter,
  ChevronDown,
} from "lucide-react"

interface CombinedMapPageProps {
  onNavigate?: (page: string) => void
  onSelectProperty?: (id: string) => void
}

// 목업 통합 지도 데이터
const mockCombinedMapData = [
  {
    id: "cm1",
    type: "경매",
    title: "서울 강남구 역삼동 아파트",
    location: "서울 강남구 역삼동 123-45",
    lat: 37.5012,
    lng: 127.0396,
    propertyType: "아파트",
    source: "서울중앙지방법원",
    minimumBid: 680000000,
    bidDate: "2026-01-25",
    riskScore: 85,
  },
  {
    id: "cm2",
    type: "공매",
    title: "서울 서초구 서초동 상가",
    location: "서울 서초구 서초동 456-78",
    lat: 37.4837,
    lng: 127.0324,
    propertyType: "상가",
    source: "온비드",
    minimumBid: 336000000,
    bidDate: "2026-01-26",
    riskScore: 72,
  },
  {
    id: "cm3",
    type: "경매",
    title: "서울 송파구 잠실동 오피스텔",
    location: "서울 송파구 잠실동 789-12",
    lat: 37.5133,
    lng: 127.1001,
    propertyType: "오피스텔",
    source: "서울동부지방법원",
    minimumBid: 224000000,
    bidDate: "2026-01-27",
    riskScore: 90,
  },
  {
    id: "cm4",
    type: "공매",
    title: "서울 마포구 합정동 토지",
    location: "서울 마포구 합정동 234-56",
    lat: 37.5495,
    lng: 126.9138,
    propertyType: "토지",
    source: "캠코",
    minimumBid: 464000000,
    bidDate: "2026-01-28",
    riskScore: 68,
  },
  {
    id: "cm5",
    type: "경매",
    title: "서울 영등포구 여의도동 빌라",
    location: "서울 영등포구 여의도동 567-89",
    lat: 37.5219,
    lng: 126.9245,
    propertyType: "빌라",
    source: "서울남부지방법원",
    minimumBid: 196000000,
    bidDate: "2026-01-29",
    riskScore: 78,
  },
  {
    id: "cm6",
    type: "공매",
    title: "서울 종로구 종로동 빌딩",
    location: "서울 종로구 종로동 111-22",
    lat: 37.5704,
    lng: 126.9822,
    propertyType: "빌딩",
    source: "국세청",
    minimumBid: 1500000000,
    bidDate: "2026-01-30",
    riskScore: 75,
  },
]

export function CombinedMapPage({ onNavigate, onSelectProperty }: CombinedMapPageProps) {
  const [selectedProperty, setSelectedProperty] = useState<typeof mockCombinedMapData[0] | null>(null)
  const [typeFilter, setTypeFilter] = useState("all")
  const [showList, setShowList] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showAuction, setShowAuction] = useState(true)
  const [showPublicSale, setShowPublicSale] = useState(true)

  const filteredProperties = mockCombinedMapData.filter((property) => {
    if (typeFilter !== "all" && property.type !== typeFilter) return false
    if (property.type === "경매" && !showAuction) return false
    if (property.type === "공매" && !showPublicSale) return false
    if (searchQuery && !property.title.includes(searchQuery) && !property.location.includes(searchQuery)) return false
    return true
  })

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const getRiskBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500 text-xs">안전</Badge>
    if (score >= 60) return <Badge className="bg-yellow-500 text-xs">주의</Badge>
    return <Badge className="bg-red-500 text-xs">위험</Badge>
  }

  const auctionCount = filteredProperties.filter((p) => p.type === "경매").length
  const publicSaleCount = filteredProperties.filter((p) => p.type === "공매").length

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* 상단 컨트롤 */}
      <div className="bg-card border-b p-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="주소, 물건명 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList>
              <TabsTrigger value="all">전체</TabsTrigger>
              <TabsTrigger value="경매" className="gap-1">
                <Gavel className="h-3 w-3" />
                경매
              </TabsTrigger>
              <TabsTrigger value="공매" className="gap-1">
                <Store className="h-3 w-3" />
                공매
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-1" />
            필터
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
          <Button
            variant={showList ? "default" : "outline"}
            size="sm"
            onClick={() => setShowList(!showList)}
          >
            <List className="h-4 w-4 mr-1" />
            목록
          </Button>
        </div>

        {/* 필터 옵션 */}
        {showFilters && (
          <div className="flex items-center gap-6 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-auction"
                checked={showAuction}
                onCheckedChange={(checked) => setShowAuction(checked as boolean)}
              />
              <Label htmlFor="show-auction" className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                경매 물건
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-public-sale"
                checked={showPublicSale}
                onCheckedChange={(checked) => setShowPublicSale(checked as boolean)}
              />
              <Label htmlFor="show-public-sale" className="flex items-center gap-1 text-sm">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                공매 물건
              </Label>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 지도 영역 */}
        <div className="flex-1 relative bg-secondary">
          {/* 실제 지도 대신 목업 표시 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">경·공매 통합 지도</p>
              <p className="text-sm mt-2">카카오맵 API 연동 시 실제 지도가 표시됩니다</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-sm">
                  <Gavel className="h-4 w-4 text-blue-500" />
                  경매 {auctionCount}건
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Store className="h-4 w-4 text-green-500" />
                  공매 {publicSaleCount}건
                </span>
              </div>
            </div>
          </div>

          {/* 목업 마커들 */}
          {filteredProperties.map((property, index) => (
            <button
              key={property.id}
              className={`absolute z-10 p-2 rounded-full transition-all ${
                selectedProperty?.id === property.id
                  ? "bg-primary text-primary-foreground scale-125 ring-4 ring-primary/30"
                  : property.type === "경매"
                    ? "bg-blue-500 text-white hover:scale-110"
                    : "bg-green-500 text-white hover:scale-110"
              }`}
              style={{
                left: `${15 + (index * 12) % 70}%`,
                top: `${15 + (index * 18) % 65}%`,
              }}
              onClick={() => setSelectedProperty(property)}
            >
              {property.type === "경매" ? (
                <Gavel className="h-4 w-4" />
              ) : (
                <Store className="h-4 w-4" />
              )}
            </button>
          ))}

          {/* 지도 컨트롤 버튼들 */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <Button variant="secondary" size="icon" className="shadow-md">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-md">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-md">
              <Navigation className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="shadow-md">
              <Layers className="h-4 w-4" />
            </Button>
          </div>

          {/* 선택된 물건 정보 */}
          {selectedProperty && (
            <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={selectedProperty.type === "경매" ? "bg-blue-500" : "bg-green-500"}>
                      {selectedProperty.type === "경매" ? <Gavel className="h-3 w-3 mr-1" /> : <Store className="h-3 w-3 mr-1" />}
                      {selectedProperty.type}
                    </Badge>
                    <Badge variant="outline">{selectedProperty.propertyType}</Badge>
                    {getRiskBadge(selectedProperty.riskScore)}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedProperty(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="font-semibold">{selectedProperty.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedProperty.location}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedProperty.source}</p>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">최저가</p>
                    <p className="font-bold text-primary">{formatPrice(selectedProperty.minimumBid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">입찰일</p>
                    <p className="font-medium">{selectedProperty.bidDate}</p>
                  </div>
                </div>
                <Button
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => onSelectProperty?.(selectedProperty.id)}
                >
                  상세보기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 범례 */}
          <div className="absolute bottom-4 left-4 md:bottom-auto md:top-4 md:left-4 bg-card p-3 rounded-lg shadow-md">
            <p className="text-xs font-medium mb-2">물건 유형</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Gavel className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs">경매</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Store className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs">공매</span>
              </div>
            </div>
          </div>
        </div>

        {/* 목록 사이드바 */}
        {showList && (
          <div className="w-80 border-l bg-card overflow-y-auto hidden md:block">
            <div className="p-3 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                물건 목록
                <Badge variant="secondary">{filteredProperties.length}</Badge>
              </h3>
            </div>
            <div className="divide-y">
              {filteredProperties.map((property) => (
                <button
                  key={property.id}
                  className={`w-full text-left p-3 hover:bg-secondary transition-colors ${
                    selectedProperty?.id === property.id ? "bg-secondary" : ""
                  }`}
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${property.type === "경매" ? "bg-blue-500" : "bg-green-500"} text-xs`}>
                      {property.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
                    {getRiskBadge(property.riskScore)}
                  </div>
                  <p className="font-medium text-sm truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground truncate mt-1">{property.location}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-bold text-primary">
                      {formatPrice(property.minimumBid)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {property.bidDate.slice(5)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
