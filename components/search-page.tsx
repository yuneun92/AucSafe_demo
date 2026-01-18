"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Map, List, X, SlidersHorizontal, Calendar, TrendingUp, Heart } from "lucide-react"
import { MapView } from "@/components/map-view"
import { AIRiskPanel } from "@/components/ai-risk-panel"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface SearchPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

export function SearchPage({ onSelectProperty }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"map" | "list">("map")
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000000000])
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("score")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedProperty, setSelectedProperty] = useState<AuctionProperty | null>(null)

  const regions = ["서울", "경기", "인천", "부산", "대구", "광주", "대전"]
  const propertyTypes = ["아파트", "오피스텔", "빌라", "상가", "토지", "단독주택"]

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => (prev.includes(region) ? prev.filter((r) => r !== region) : [...prev, region]))
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const properties = auctionProperties || []

  const filteredProperties = properties.filter((property) => {
    if (!property) return false
    const matchesSearch =
      (property.address?.includes(searchQuery) || property.caseNumber?.includes(searchQuery)) ?? false
    const matchesPrice = property.minimumBidPrice >= priceRange[0] && property.minimumBidPrice <= priceRange[1]
    const matchesRegion = selectedRegions.length === 0 || selectedRegions.some((r) => property.location?.includes(r))
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.propertyType)
    return matchesSearch && matchesPrice && matchesRegion && matchesType
  })

  const handlePropertySelect = (property: AuctionProperty | null) => {
    setSelectedProperty(property)
  }

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b -mx-4 px-4 py-3">
        <div className="flex flex-col gap-3">
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="주소, 사건번호, 지역명으로 검색..."
                className="pl-10 bg-secondary border-0 h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {/* Quick Filters */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-11 bg-secondary border-0">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">AI점수 높은순</SelectItem>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="price-low">가격 낮은순</SelectItem>
                  <SelectItem value="price-high">가격 높은순</SelectItem>
                  <SelectItem value="biddate">입찰일 가까운순</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2 h-11"
              >
                <SlidersHorizontal className="h-4 w-4" />
                필터
                {(selectedRegions.length > 0 || selectedTypes.length > 0) && (
                  <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground">
                    {selectedRegions.length + selectedTypes.length}
                  </Badge>
                )}
              </Button>
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === "map" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none h-11 w-11"
                  onClick={() => setViewMode("map")}
                >
                  <Map className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="rounded-none h-11 w-11"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="border-0 bg-secondary">
              <CardContent className="p-4">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Price Range */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">가격 범위</h4>
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={2000000000}
                      step={50000000}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{(priceRange[0] / 100000000).toFixed(1)}억</span>
                      <span>{(priceRange[1] / 100000000).toFixed(1)}억</span>
                    </div>
                  </div>

                  {/* Region */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">지역</h4>
                    <div className="flex flex-wrap gap-2">
                      {regions.map((region) => (
                        <Badge
                          key={region}
                          variant={selectedRegions.includes(region) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleRegion(region)}
                        >
                          {region}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">물건 유형</h4>
                    <div className="flex flex-wrap gap-2">
                      {propertyTypes.slice(0, 4).map((type) => (
                        <Badge
                          key={type}
                          variant={selectedTypes.includes(type) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleType(type)}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* AI Score */}
                  <div>
                    <h4 className="font-medium mb-3 text-sm">AI 안전점수</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer">
                        80점 이상
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        60~79점
                      </Badge>
                      <Badge variant="outline" className="cursor-pointer">
                        60점 미만
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedRegions([])
                      setSelectedTypes([])
                      setPriceRange([0, 2000000000])
                    }}
                  >
                    초기화
                  </Button>
                  <Button size="sm" onClick={() => setShowFilters(false)}>
                    적용
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Filters */}
          {(selectedRegions.length > 0 || selectedTypes.length > 0) && !showFilters && (
            <div className="flex flex-wrap gap-2">
              {selectedRegions.map((region) => (
                <Badge key={region} variant="secondary" className="gap-1 pl-2">
                  {region}
                  <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => toggleRegion(region)} />
                </Badge>
              ))}
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1 pl-2">
                  {type}
                  <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => toggleType(type)} />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => {
                  setSelectedRegions([])
                  setSelectedTypes([])
                }}
              >
                전체 해제
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              총 <span className="font-medium text-foreground">{filteredProperties.length}</span>건의 매물
            </p>
          </div>
        </div>
      </div>

      {viewMode === "map" ? (
        <div className="grid lg:grid-cols-[1fr_380px] gap-4 h-[calc(100vh-280px)] min-h-[500px]">
          {/* Map View */}
          <MapView
            properties={filteredProperties}
            onPropertyClick={handlePropertySelect}
            selectedPropertyId={selectedProperty?.id}
            onBoundsChange={(bounds) => {
              console.log("Map bounds changed:", bounds)
            }}
          />

          {/* AI Risk Panel */}
          <AIRiskPanel property={selectedProperty} />
        </div>
      ) : (
        /* List View */
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onSelectProperty(property)}
            >
              <div className="relative h-40 bg-secondary">
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
                <button
                  className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
                    favorites.includes(property.id)
                      ? "bg-red-500 text-white"
                      : "bg-background/80 text-foreground hover:bg-background"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleFavorite(property.id)
                  }}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(property.id) ? "fill-current" : ""}`} />
                </button>
                <Badge className="absolute top-2 left-2">{property.propertyType}</Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium line-clamp-1">{property.address}</p>
                    <p className="text-xs text-muted-foreground">{property.caseNumber}</p>
                  </div>
                  <Badge
                    variant={
                      property.riskScore >= 80 ? "default" : property.riskScore >= 60 ? "secondary" : "destructive"
                    }
                  >
                    {property.riskScore}점
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">최저가</span>
                    <span className="font-bold text-primary">
                      {(property.minimumBidPrice / 100000000).toFixed(1)}억
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">감정가</span>
                    <span>{(property.appraisalPrice / 100000000).toFixed(1)}억</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {property.auctionDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {property.bidCount}회 유찰
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
