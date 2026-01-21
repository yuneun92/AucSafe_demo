"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Search,
  MapPin,
  ChevronRight,
  Building2,
  Map,
} from "lucide-react"

interface LocationSearchPageProps {
  onSelectLocation?: (location: string) => void
}

// 목업 지역 데이터
const locationData = {
  "서울특별시": {
    count: 3245,
    districts: [
      { name: "강남구", count: 432 },
      { name: "서초구", count: 387 },
      { name: "송파구", count: 356 },
      { name: "강동구", count: 234 },
      { name: "강서구", count: 298 },
      { name: "마포구", count: 267 },
      { name: "영등포구", count: 245 },
      { name: "용산구", count: 198 },
      { name: "성동구", count: 176 },
      { name: "광진구", count: 165 },
      { name: "동대문구", count: 143 },
      { name: "중랑구", count: 128 },
      { name: "노원구", count: 216 },
    ],
  },
  "경기도": {
    count: 4567,
    districts: [
      { name: "수원시", count: 567 },
      { name: "성남시", count: 498 },
      { name: "용인시", count: 456 },
      { name: "고양시", count: 387 },
      { name: "화성시", count: 345 },
      { name: "부천시", count: 298 },
      { name: "안양시", count: 234 },
      { name: "평택시", count: 212 },
      { name: "의정부시", count: 198 },
      { name: "파주시", count: 187 },
    ],
  },
  "인천광역시": {
    count: 1234,
    districts: [
      { name: "남동구", count: 234 },
      { name: "부평구", count: 212 },
      { name: "서구", count: 198 },
      { name: "계양구", count: 176 },
      { name: "연수구", count: 165 },
      { name: "미추홀구", count: 143 },
      { name: "중구", count: 106 },
    ],
  },
  "부산광역시": {
    count: 1876,
    districts: [
      { name: "해운대구", count: 312 },
      { name: "부산진구", count: 267 },
      { name: "동래구", count: 234 },
      { name: "남구", count: 198 },
      { name: "북구", count: 187 },
      { name: "사상구", count: 165 },
      { name: "수영구", count: 143 },
    ],
  },
  "대구광역시": {
    count: 1123,
    districts: [
      { name: "수성구", count: 234 },
      { name: "달서구", count: 212 },
      { name: "북구", count: 187 },
      { name: "동구", count: 165 },
      { name: "남구", count: 143 },
      { name: "서구", count: 98 },
    ],
  },
  "대전광역시": {
    count: 876,
    districts: [
      { name: "유성구", count: 198 },
      { name: "서구", count: 187 },
      { name: "대덕구", count: 165 },
      { name: "동구", count: 154 },
      { name: "중구", count: 98 },
    ],
  },
  "광주광역시": {
    count: 765,
    districts: [
      { name: "북구", count: 187 },
      { name: "광산구", count: 176 },
      { name: "서구", count: 154 },
      { name: "남구", count: 134 },
      { name: "동구", count: 87 },
    ],
  },
}

export function LocationSearchPage({ onSelectLocation }: LocationSearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  const regions = Object.keys(locationData)

  const filteredRegions = regions.filter((region) =>
    region.includes(searchQuery) ||
    locationData[region as keyof typeof locationData].districts.some((d) => d.name.includes(searchQuery))
  )

  const handleRegionClick = (region: string) => {
    if (selectedRegion === region) {
      setSelectedRegion(null)
    } else {
      setSelectedRegion(region)
    }
  }

  const handleDistrictClick = (region: string, district: string) => {
    onSelectLocation?.(`${region} ${district}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          소재지 검색
        </h1>
        <p className="text-muted-foreground mt-1">
          지역별 경매 물건을 검색하세요
        </p>
      </div>

      {/* 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="시/도, 시/군/구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 전체 통계 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">전국 경매 물건</p>
            <p className="text-2xl font-bold text-primary">
              {Object.values(locationData).reduce((acc, r) => acc + r.count, 0).toLocaleString()}건
            </p>
          </div>
          <Button variant="outline" size="sm">
            전체 보기
          </Button>
        </CardContent>
      </Card>

      {/* 지역 목록 */}
      <div className="space-y-4">
        {filteredRegions.map((region) => {
          const regionData = locationData[region as keyof typeof locationData]
          const isExpanded = selectedRegion === region

          return (
            <Card key={region} className={isExpanded ? "border-primary/50" : ""}>
              <CardContent className="p-0">
                <button
                  onClick={() => handleRegionClick(region)}
                  className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Map className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">{region}</p>
                      <p className="text-sm text-muted-foreground">
                        {regionData.districts.length}개 시/군/구
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {regionData.count.toLocaleString()}건
                    </Badge>
                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`} />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t p-4 bg-secondary/30">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {regionData.districts.map((district) => (
                        <button
                          key={district.name}
                          onClick={() => handleDistrictClick(region, district.name)}
                          className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-colors text-left"
                        >
                          <p className="font-medium">{district.name}</p>
                          <p className="text-sm text-primary">{district.count}건</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRegions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
            <p className="text-sm mt-2">다른 검색어를 입력해보세요</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
