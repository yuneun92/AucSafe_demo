"use client"

import { useState } from "react"
import { PropertyCard } from "./property-card"
import { type AuctionProperty, auctionProperties } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, SlidersHorizontal, X, LayoutGrid, List } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface PropertyListProps {
  onSelectProperty: (property: AuctionProperty) => void
  compareList: AuctionProperty[]
  onCompare: (property: AuctionProperty) => void
}

export function PropertyList({ onSelectProperty, compareList, onCompare }: PropertyListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recommend")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [filters, setFilters] = useState({
    priceRange: [0, 2000000000],
    propertyTypes: [] as string[],
    districts: [] as string[],
    riskMin: 0,
    onlyVacant: false,
  })

  const propertyTypes = ["아파트", "오피스텔", "빌라", "상가"]
  const districts = ["강남구", "마포구", "송파구", "성동구", "연수구"]

  const filteredProperties = auctionProperties
    .filter((p) => {
      if (searchQuery && !p.address.includes(searchQuery) && !p.caseNumber.includes(searchQuery)) {
        return false
      }
      if (p.minimumBidPrice < filters.priceRange[0] || p.minimumBidPrice > filters.priceRange[1]) {
        return false
      }
      if (filters.propertyTypes.length > 0 && !filters.propertyTypes.includes(p.propertyType)) {
        return false
      }
      if (filters.districts.length > 0 && !filters.districts.some((d) => p.location.includes(d))) {
        return false
      }
      if (p.riskScore < filters.riskMin) {
        return false
      }
      if (filters.onlyVacant && p.occupancyStatus !== "공실") {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recommend":
          return b.recommendScore - a.recommendScore
        case "price-low":
          return a.minimumBidPrice - b.minimumBidPrice
        case "price-high":
          return b.minimumBidPrice - a.minimumBidPrice
        case "date":
          return new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime()
        case "risk":
          return b.riskScore - a.riskScore
        default:
          return 0
      }
    })

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(0)}억`
    }
    return `${(price / 10000000).toFixed(0)}천만`
  }

  const activeFilterCount = [
    filters.propertyTypes.length > 0,
    filters.districts.length > 0,
    filters.riskMin > 0,
    filters.onlyVacant,
    filters.priceRange[0] > 0 || filters.priceRange[1] < 2000000000,
  ].filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="주소 또는 사건번호로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-secondary border-border">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommend">추천순</SelectItem>
              <SelectItem value="price-low">낮은 가격순</SelectItem>
              <SelectItem value="price-high">높은 가격순</SelectItem>
              <SelectItem value="date">경매일순</SelectItem>
              <SelectItem value="risk">높은 안전점수순</SelectItem>
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                필터
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[320px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>상세 필터</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Price Range */}
                <div className="space-y-3">
                  <Label>가격 범위</Label>
                  <Slider
                    value={filters.priceRange}
                    onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                    max={2000000000}
                    step={50000000}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatPrice(filters.priceRange[0])}</span>
                    <span>{formatPrice(filters.priceRange[1])}</span>
                  </div>
                </div>

                {/* Property Types */}
                <div className="space-y-3">
                  <Label>물건 유형</Label>
                  <div className="flex flex-wrap gap-2">
                    {propertyTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={filters.propertyTypes.includes(type) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setFilters({
                            ...filters,
                            propertyTypes: filters.propertyTypes.includes(type)
                              ? filters.propertyTypes.filter((t) => t !== type)
                              : [...filters.propertyTypes, type],
                          })
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Districts */}
                <div className="space-y-3">
                  <Label>지역</Label>
                  <div className="flex flex-wrap gap-2">
                    {districts.map((district) => (
                      <Badge
                        key={district}
                        variant={filters.districts.includes(district) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setFilters({
                            ...filters,
                            districts: filters.districts.includes(district)
                              ? filters.districts.filter((d) => d !== district)
                              : [...filters.districts, district],
                          })
                        }}
                      >
                        {district}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Safety Score - 안전점수 최소값 */}
                <div className="space-y-3">
                  <Label>최소 안전점수: {filters.riskMin}점 이상</Label>
                  <Slider
                    value={[filters.riskMin]}
                    onValueChange={([value]) => setFilters({ ...filters, riskMin: value })}
                    max={100}
                    step={5}
                  />
                </div>

                {/* Vacant Only */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vacant"
                    checked={filters.onlyVacant}
                    onCheckedChange={(checked) => setFilters({ ...filters, onlyVacant: checked as boolean })}
                  />
                  <Label htmlFor="vacant">공실 물건만 보기</Label>
                </div>

                {/* Reset */}
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() =>
                    setFilters({
                      priceRange: [0, 2000000000],
                      propertyTypes: [],
                      districts: [],
                      riskMin: 0,
                      onlyVacant: false,
                    })
                  }
                >
                  필터 초기화
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden sm:flex border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.propertyTypes.map((type) => (
            <Badge key={type} variant="secondary" className="gap-1">
              {type}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters({
                    ...filters,
                    propertyTypes: filters.propertyTypes.filter((t) => t !== type),
                  })
                }
              />
            </Badge>
          ))}
          {filters.districts.map((district) => (
            <Badge key={district} variant="secondary" className="gap-1">
              {district}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  setFilters({
                    ...filters,
                    districts: filters.districts.filter((d) => d !== district),
                  })
                }
              />
            </Badge>
          ))}
          {filters.onlyVacant && (
            <Badge variant="secondary" className="gap-1">
              공실만
              <X className="h-3 w-3 cursor-pointer" onClick={() => setFilters({ ...filters, onlyVacant: false })} />
            </Badge>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 <span className="font-medium text-foreground">{filteredProperties.length}</span>개 매물
        </p>
        {compareList.length > 0 && (
          <Badge variant="outline" className="gap-1">
            비교 목록: {compareList.length}개
          </Badge>
        )}
      </div>

      {/* Property Grid */}
      <div
        className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}
      >
        {filteredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={onSelectProperty}
            onCompare={onCompare}
            isComparing={compareList.some((p) => p.id === property.id)}
          />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">조건에 맞는 매물이 없습니다.</p>
          <Button
            variant="link"
            onClick={() =>
              setFilters({
                priceRange: [0, 2000000000],
                propertyTypes: [],
                districts: [],
                riskMin: 0,
                onlyVacant: false,
              })
            }
          >
            필터 초기화하기
          </Button>
        </div>
      )}
    </div>
  )
}
