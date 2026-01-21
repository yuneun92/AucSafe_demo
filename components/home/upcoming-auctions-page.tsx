"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  CalendarIcon,
  Heart,
  MapPin,
  Building2,
  Clock,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"
import { format, addDays, isSameDay, parseISO } from "date-fns"
import { ko } from "date-fns/locale"

interface UpcomingAuctionsPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

// 예정 경매 일정 그룹화
const groupByDate = (properties: AuctionProperty[]) => {
  const groups: Record<string, AuctionProperty[]> = {}
  properties.forEach((p) => {
    const date = p.auctionDate
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(p)
  })
  return groups
}

export function UpcomingAuctionsPage({ onSelectProperty }: UpcomingAuctionsPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")
  const [propertyType, setPropertyType] = useState("all")
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  // 예정 물건 필터 (오늘 이후 경매일)
  const upcomingProperties = auctionProperties.filter((p) => {
    // 목업: 실제로는 날짜 비교
    return true
  })

  const filteredProperties = upcomingProperties.filter((property) => {
    const matchesSearch = property.address?.includes(searchQuery) || property.caseNumber?.includes(searchQuery)
    const matchesRegion = region === "all" || property.location?.includes(region)
    const matchesType = propertyType === "all" || property.propertyType === propertyType
    return matchesSearch && matchesRegion && matchesType
  })

  const groupedProperties = groupByDate(filteredProperties)
  const sortedDates = Object.keys(groupedProperties).sort()

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }

  // 오늘부터 7일간 예정된 경매 수
  const next7DaysCount = filteredProperties.length

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            예정 경매 물건
          </h1>
          <p className="text-muted-foreground mt-1">
            곧 경매가 진행될 물건을 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            목록
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("calendar")}
          >
            캘린더
          </Button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">오늘 예정</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">28</p>
            <p className="text-sm text-muted-foreground">이번 주</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{next7DaysCount}</p>
            <p className="text-sm text-muted-foreground">7일 이내</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">156</p>
            <p className="text-sm text-muted-foreground">이번 달</p>
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange ? format(dateRange, "PPP", { locale: ko }) : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
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

      {/* D-Day 알림 */}
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="font-medium">입찰 마감 임박!</p>
            <p className="text-sm text-muted-foreground">
              관심 물건 중 <span className="text-orange-500 font-bold">3건</span>이 3일 이내 경매 예정입니다
            </p>
          </div>
          <Button variant="outline" size="sm">
            확인하기
          </Button>
        </CardContent>
      </Card>

      {viewMode === "list" ? (
        /* 날짜별 그룹 목록 */
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarIcon className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">{date}</h2>
                <Badge variant="secondary">{groupedProperties[date].length}건</Badge>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedProperties[date].map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => onSelectProperty(property)}
                  >
                    <div className="relative h-32 bg-secondary">
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
                      <Badge className="absolute top-2 left-2">{property.propertyType}</Badge>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{property.address || property.title}</p>
                          <p className="text-xs text-muted-foreground">{property.caseNumber}</p>
                        </div>
                        <p className="font-bold text-primary ml-2">
                          {(property.minimumBidPrice / 100000000).toFixed(1)}억
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 캘린더 뷰 */
        <Card>
          <CardContent className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>캘린더 뷰는 준비 중입니다</p>
              <p className="text-sm mt-2">목록 뷰를 이용해주세요</p>
            </div>
          </CardContent>
        </Card>
      )}

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
