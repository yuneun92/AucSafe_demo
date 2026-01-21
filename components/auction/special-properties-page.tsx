"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  AlertTriangle,
  Percent,
  Scale,
  Building2,
  Clock,
  TrendingDown,
  Calendar,
  MapPin,
  Heart,
  ChevronRight,
  Info,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface SpecialPropertiesPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

// 특수물건 카테고리
const specialCategories = [
  {
    id: "share",
    name: "지분 경매",
    icon: Percent,
    description: "전체 소유권이 아닌 일부 지분만 경매되는 물건",
    warning: "다른 지분권자와의 협의 필요, 활용 제한 가능성",
    count: 45,
    color: "bg-blue-500",
  },
  {
    id: "surface-right",
    name: "법정지상권",
    icon: Scale,
    description: "토지와 건물 소유자가 다른 경우 발생하는 권리",
    warning: "건물 철거 위험, 지료 분쟁 가능성",
    count: 32,
    color: "bg-orange-500",
  },
  {
    id: "lien",
    name: "유치권",
    icon: AlertTriangle,
    description: "공사비 등 미지급으로 점유 중인 물건",
    warning: "인도 지연, 추가 비용 발생 가능성",
    count: 28,
    color: "bg-red-500",
  },
  {
    id: "old-appraisal",
    name: "감정 1년 경과",
    icon: Clock,
    description: "감정평가 후 1년 이상 경과한 물건",
    warning: "시세 변동 가능성, 재감정 고려 필요",
    count: 67,
    color: "bg-yellow-500",
  },
  {
    id: "recent-changes",
    name: "최근 2주 변동",
    icon: TrendingDown,
    description: "최근 2주 내 변동(유찰, 가격변경 등)이 있는 물건",
    warning: "가격 변동 원인 파악 필요",
    count: 89,
    color: "bg-purple-500",
  },
]

// 목업 특수물건 데이터
const getMockSpecialProperties = (category: string) => {
  return auctionProperties.slice(0, 5).map((p, i) => ({
    ...p,
    specialType: category,
    specialInfo: category === "share" ? "1/2 지분" :
                 category === "surface-right" ? "법정지상권 존재" :
                 category === "lien" ? "유치권 신고 (5억)" :
                 category === "old-appraisal" ? "감정일: 2024-06-15" :
                 "최저가 20% 하락",
  }))
}

export function SpecialPropertiesPage({ onSelectProperty }: SpecialPropertiesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState("share")
  const [searchQuery, setSearchQuery] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  const currentCategory = specialCategories.find((c) => c.id === selectedCategory)!
  const properties = getMockSpecialProperties(selectedCategory)

  const filteredProperties = properties.filter((property) => {
    return property.address?.includes(searchQuery) || property.caseNumber?.includes(searchQuery)
  })

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          특수 물건 검색
        </h1>
        <p className="text-muted-foreground mt-1">
          지분, 법정지상권, 유치권 등 특수 물건을 검색하세요
        </p>
      </div>

      {/* 경고 안내 */}
      <Card className="border-orange-500/50 bg-orange-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-orange-600 dark:text-orange-400">특수 물건 투자 주의사항</p>
            <p className="text-sm text-muted-foreground mt-1">
              특수 물건은 일반 경매 물건에 비해 복잡한 권리관계와 추가적인 위험 요소가 있을 수 있습니다.
              반드시 전문가 상담 후 입찰을 결정하시기 바랍니다.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 탭 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {specialCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              <category.icon className="h-4 w-4" />
              {category.name}
              <Badge variant="secondary" className="ml-1">{category.count}</Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* 카테고리 설명 */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg ${currentCategory.color} flex items-center justify-center`}>
                <currentCategory.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{currentCategory.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentCategory.description}</p>
                <div className="flex items-start gap-2 mt-2 p-2 rounded bg-destructive/10 text-destructive">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="text-sm">{currentCategory.warning}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 검색 */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="주소, 사건번호로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 물건 목록 */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {filteredProperties.map((property) => (
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
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className={currentCategory.color}>{currentCategory.name}</Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                    {(property as any).specialInfo}
                  </Badge>
                </div>
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

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {property.auctionDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {property.location}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <Card className="mt-4">
            <CardContent className="p-8 text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>검색 결과가 없습니다</p>
            </CardContent>
          </Card>
        )}
      </Tabs>

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
