"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Calendar,
  TrendingUp,
  Heart,
  MapPin,
  Building2,
  Clock,
  Sparkles,
  Filter,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface NewAuctionsPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

export function NewAuctionsPage({ onSelectProperty }: NewAuctionsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [favorites, setFavorites] = useState<string[]>([])

  // 신규 등록 매물 필터 (최근 7일 이내)
  const newProperties = auctionProperties.filter((p) => {
    // 목업: 실제로는 등록일 기준 필터링
    return true
  })

  const filteredProperties = newProperties.filter((property) => {
    const matchesSearch = property.address?.includes(searchQuery) || property.caseNumber?.includes(searchQuery)
    const matchesRegion = region === "all" || property.location?.includes(region)
    const matchesType = propertyType === "all" || property.propertyType === propertyType
    return matchesSearch && matchesRegion && matchesType
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
            <Sparkles className="h-6 w-6 text-primary" />
            신규 경매 물건
          </h1>
          <p className="text-muted-foreground mt-1">
            최근 7일 이내 새로 등록된 경매 물건입니다
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          총 {filteredProperties.length}건
        </Badge>
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
                <SelectItem value="광주">광주</SelectItem>
                <SelectItem value="대전">대전</SelectItem>
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
                <SelectItem value="토지">토지</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">최신순</SelectItem>
                <SelectItem value="price-low">가격 낮은순</SelectItem>
                <SelectItem value="price-high">가격 높은순</SelectItem>
                <SelectItem value="score">AI점수 높은순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 신규 물건 알림 배너 */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">오늘 새로 등록된 물건</p>
            <p className="text-sm text-muted-foreground">
              오늘 <span className="text-primary font-bold">5건</span>의 새로운 경매 물건이 등록되었습니다
            </p>
          </div>
          <Button variant="outline" size="sm">
            알림 설정
          </Button>
        </CardContent>
      </Card>

      {/* 물건 목록 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.map((property) => (
          <Card
            key={property.id}
            className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onSelectProperty(property)}
          >
            <div className="relative h-40 bg-secondary">
              <img
                src={property.images?.[0] || property.image || "/placeholder.svg"}
                alt={property.address}
                className="w-full h-full object-cover"
              />
              <button
                className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                  favorites.includes(property.id)
                    ? "bg-red-500 text-white"
                    : "bg-background/80 text-foreground hover:bg-background"
                }`}
                onClick={(e) => toggleFavorite(property.id, e)}
              >
                <Heart className={`h-4 w-4 ${favorites.includes(property.id) ? "fill-current" : ""}`} />
              </button>
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge className="bg-green-500">신규</Badge>
                <Badge>{property.propertyType}</Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white font-bold text-lg">
                  {(property.minimumBidPrice / 100000000).toFixed(1)}억
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{property.address || property.title}</p>
                  <p className="text-xs text-muted-foreground">{property.caseNumber}</p>
                </div>
                <Badge
                  variant={
                    property.riskScore >= 80 ? "default" : property.riskScore >= 60 ? "secondary" : "destructive"
                  }
                  className="ml-2"
                >
                  {property.riskScore}점
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{property.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">감정가</span>
                  <span>{(property.appraisalPrice / 100000000).toFixed(1)}억</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">최저가율</span>
                  <span className="text-primary font-medium">
                    {((property.minimumBidPrice / property.appraisalPrice) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {property.auctionDate}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {property.bidCount || property.failedCount}회 유찰
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
