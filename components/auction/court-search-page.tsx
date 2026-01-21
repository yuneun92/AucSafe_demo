"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Building,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  ExternalLink,
} from "lucide-react"

interface CourtSearchPageProps {
  onSelectCourt?: (courtId: string) => void
}

// 목업 법원 데이터
const mockCourts = [
  {
    id: "1",
    name: "서울중앙지방법원",
    region: "서울",
    address: "서울특별시 서초구 법원로 3",
    phone: "02-530-1114",
    auctionDay: "매주 화, 목",
    currentCases: 1234,
    upcomingCases: 89,
  },
  {
    id: "2",
    name: "서울남부지방법원",
    region: "서울",
    address: "서울특별시 양천구 신월로 386",
    phone: "02-2192-1114",
    auctionDay: "매주 월, 수",
    currentCases: 876,
    upcomingCases: 52,
  },
  {
    id: "3",
    name: "서울동부지방법원",
    region: "서울",
    address: "서울특별시 송파구 법원로 101",
    phone: "02-2204-1114",
    auctionDay: "매주 화, 금",
    currentCases: 654,
    upcomingCases: 41,
  },
  {
    id: "4",
    name: "서울북부지방법원",
    region: "서울",
    address: "서울특별시 도봉구 마들로 749",
    phone: "02-3399-1114",
    auctionDay: "매주 수, 금",
    currentCases: 543,
    upcomingCases: 38,
  },
  {
    id: "5",
    name: "서울서부지방법원",
    region: "서울",
    address: "서울특별시 마포구 마포대로 174",
    phone: "02-3271-1114",
    auctionDay: "매주 월, 목",
    currentCases: 432,
    upcomingCases: 29,
  },
  {
    id: "6",
    name: "수원지방법원",
    region: "경기",
    address: "경기도 수원시 영통구 법조로 20",
    phone: "031-210-1114",
    auctionDay: "매주 화, 목",
    currentCases: 987,
    upcomingCases: 67,
  },
  {
    id: "7",
    name: "의정부지방법원",
    region: "경기",
    address: "경기도 의정부시 녹양로 80",
    phone: "031-828-1114",
    auctionDay: "매주 월, 수",
    currentCases: 567,
    upcomingCases: 34,
  },
  {
    id: "8",
    name: "인천지방법원",
    region: "인천",
    address: "인천광역시 남동구 정각로 29",
    phone: "032-260-1114",
    auctionDay: "매주 화, 금",
    currentCases: 765,
    upcomingCases: 45,
  },
  {
    id: "9",
    name: "부산지방법원",
    region: "부산",
    address: "부산광역시 연제구 법원로 31",
    phone: "051-590-1114",
    auctionDay: "매주 월, 목",
    currentCases: 876,
    upcomingCases: 58,
  },
  {
    id: "10",
    name: "대구지방법원",
    region: "대구",
    address: "대구광역시 수성구 동대구로 364",
    phone: "053-757-1114",
    auctionDay: "매주 수, 금",
    currentCases: 654,
    upcomingCases: 42,
  },
]

export function CourtSearchPage({ onSelectCourt }: CourtSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [region, setRegion] = useState("all")

  const filteredCourts = mockCourts.filter((court) => {
    const matchesSearch = court.name.includes(searchQuery) || court.address.includes(searchQuery)
    const matchesRegion = region === "all" || court.region === region
    return matchesSearch && matchesRegion
  })

  const regions = [...new Set(mockCourts.map((c) => c.region))]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6 text-primary" />
          법원 검색
        </h1>
        <p className="text-muted-foreground mt-1">
          법원별 경매 물건을 검색하세요
        </p>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="법원명 또는 주소로 검색..."
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
                {regions.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 법원 목록 */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredCourts.map((court) => (
          <Card
            key={court.id}
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => onSelectCourt?.(court.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{court.name}</h3>
                    <Badge variant="secondary">{court.region}</Badge>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{court.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{court.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>경매일: {court.auctionDay}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary">{court.currentCases.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">진행중</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-500">{court.upcomingCases}</p>
                      <p className="text-xs text-muted-foreground">예정</p>
                    </div>
                    <div className="flex-1" />
                    <Button variant="outline" size="sm" className="gap-1">
                      매물 보기
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
            <p className="text-sm mt-2">다른 검색 조건을 시도해보세요</p>
          </CardContent>
        </Card>
      )}

      {/* 법원 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium">대법원 법원경매정보</p>
              <p className="text-sm text-muted-foreground">
                법원경매 공식 사이트에서 더 자세한 정보를 확인하세요
              </p>
            </div>
            <Button variant="outline" size="sm">
              바로가기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
