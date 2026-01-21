"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Map,
  Search,
  MapPin,
  Banknote,
  Calendar,
  Building2,
  List,
  Filter,
  X,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
} from "lucide-react"

interface PublicSaleMapPageProps {
  onNavigate?: (page: string) => void
  onSelectProperty?: (id: string) => void
}

// 목업 공매 물건 데이터 (지도용)
const mockPublicSaleMapData = [
  {
    id: "psm1",
    title: "서울 강남구 역삼동 상가",
    location: "서울 강남구 역삼동 123-45",
    lat: 37.5012,
    lng: 127.0396,
    propertyType: "상가",
    source: "온비드",
    appraisalPrice: 850000000,
    minimumBid: 680000000,
    bidDate: "2026-01-25",
  },
  {
    id: "psm2",
    title: "서울 서초구 서초동 오피스텔",
    location: "서울 서초구 서초동 456-78",
    lat: 37.4837,
    lng: 127.0324,
    propertyType: "오피스텔",
    source: "캠코",
    appraisalPrice: 420000000,
    minimumBid: 336000000,
    bidDate: "2026-01-26",
  },
  {
    id: "psm3",
    title: "서울 송파구 잠실동 아파트",
    location: "서울 송파구 잠실동 789-12",
    lat: 37.5133,
    lng: 127.1001,
    propertyType: "아파트",
    source: "온비드",
    appraisalPrice: 920000000,
    minimumBid: 736000000,
    bidDate: "2026-01-27",
  },
  {
    id: "psm4",
    title: "서울 마포구 합정동 토지",
    location: "서울 마포구 합정동 234-56",
    lat: 37.5495,
    lng: 126.9138,
    propertyType: "토지",
    source: "국세청",
    appraisalPrice: 580000000,
    minimumBid: 464000000,
    bidDate: "2026-01-28",
  },
  {
    id: "psm5",
    title: "서울 영등포구 여의도동 빌딩",
    location: "서울 영등포구 여의도동 567-89",
    lat: 37.5219,
    lng: 126.9245,
    propertyType: "빌딩",
    source: "지자체",
    appraisalPrice: 2500000000,
    minimumBid: 2000000000,
    bidDate: "2026-01-29",
  },
]

const sourceColors: Record<string, string> = {
  "온비드": "bg-blue-500",
  "캠코": "bg-green-500",
  "국세청": "bg-orange-500",
  "지자체": "bg-purple-500",
}

export function PublicSaleMapPage({ onNavigate, onSelectProperty }: PublicSaleMapPageProps) {
  const [selectedProperty, setSelectedProperty] = useState<typeof mockPublicSaleMapData[0] | null>(null)
  const [sourceFilter, setSourceFilter] = useState("all")
  const [showList, setShowList] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProperties = mockPublicSaleMapData.filter((property) => {
    if (sourceFilter !== "all" && property.source !== sourceFilter) return false
    if (searchQuery && !property.title.includes(searchQuery) && !property.location.includes(searchQuery)) return false
    return true
  })

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* 상단 컨트롤 */}
      <div className="bg-card border-b p-3 flex items-center gap-3">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="주소, 물건명 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="출처" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="온비드">온비드</SelectItem>
            <SelectItem value="캠코">캠코</SelectItem>
            <SelectItem value="국세청">국세청</SelectItem>
            <SelectItem value="지자체">지자체</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showList ? "default" : "outline"}
          size="sm"
          onClick={() => setShowList(!showList)}
        >
          <List className="h-4 w-4 mr-1" />
          목록
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 지도 영역 */}
        <div className="flex-1 relative bg-secondary">
          {/* 실제 지도 대신 목업 표시 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Map className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">공매 물건 지도</p>
              <p className="text-sm mt-2">카카오맵 API 연동 시 실제 지도가 표시됩니다</p>
              <p className="text-sm mt-1">현재 {filteredProperties.length}개 물건이 표시됩니다</p>
            </div>
          </div>

          {/* 목업 마커들 */}
          {filteredProperties.map((property, index) => (
            <button
              key={property.id}
              className={`absolute z-10 p-2 rounded-full transition-all ${
                selectedProperty?.id === property.id
                  ? "bg-primary text-primary-foreground scale-125"
                  : `${sourceColors[property.source]} text-white hover:scale-110`
              }`}
              style={{
                left: `${20 + (index * 15) % 60}%`,
                top: `${20 + (index * 20) % 60}%`,
              }}
              onClick={() => setSelectedProperty(property)}
            >
              <MapPin className="h-5 w-5" />
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
                    <Badge className={sourceColors[selectedProperty.source]}>
                      {selectedProperty.source}
                    </Badge>
                    <Badge variant="outline">{selectedProperty.propertyType}</Badge>
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
            <p className="text-xs font-medium mb-2">출처별 마커</p>
            <div className="space-y-1">
              {Object.entries(sourceColors).map(([source, color]) => (
                <div key={source} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 목록 사이드바 */}
        {showList && (
          <div className="w-80 border-l bg-card overflow-y-auto hidden md:block">
            <div className="p-3 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                공매 물건 목록
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
                    <Badge className={`${sourceColors[property.source]} text-xs`}>
                      {property.source}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{property.propertyType}</Badge>
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
