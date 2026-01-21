"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Heart,
  Bell,
  Calendar,
  TrendingUp,
  Trash2,
  ExternalLink,
  AlertCircle,
  Clock,
  Gavel,
  Store,
  Banknote,
  Building2,
  MapPin,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface FavoritesPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

// 공매 관심물건 목업
const mockPublicSaleFavorites = [
  {
    id: "psf1",
    title: "서울 강남구 역삼동 상가",
    location: "서울 강남구 역삼동 123-45",
    source: "온비드",
    propertyType: "상가",
    appraisalPrice: 850000000,
    minimumBid: 680000000,
    bidDate: "2026-01-25",
    images: ["/placeholder.svg"],
  },
  {
    id: "psf2",
    title: "경기 수원시 팔달구 오피스텔",
    location: "경기 수원시 팔달구 456-78",
    source: "캠코",
    propertyType: "오피스텔",
    appraisalPrice: 320000000,
    minimumBid: 256000000,
    bidDate: "2026-01-28",
    images: ["/placeholder.svg"],
  },
]

// NPL 관심물건 목업
const mockNplFavorites = [
  {
    id: "nplf1",
    title: "서울 서초구 반포동 아파트 채권",
    location: "서울 서초구 반포동 789-12",
    loanType: "주택담보대출",
    originalLoan: 500000000,
    askingPrice: 380000000,
    ltv: 65,
    discountRate: 24,
    images: ["/placeholder.svg"],
  },
]

export function FavoritesPage({ onSelectProperty }: FavoritesPageProps) {
  const [auctionFavorites, setAuctionFavorites] = useState(auctionProperties.slice(0, 4))
  const [publicSaleFavorites, setPublicSaleFavorites] = useState(mockPublicSaleFavorites)
  const [nplFavorites, setNplFavorites] = useState(mockNplFavorites)
  const [alerts, setAlerts] = useState([
    { id: "1", propertyId: "1", type: "price", category: "경매", message: "최저가가 10% 하락했습니다", date: "2026-01-20", read: false },
    { id: "2", propertyId: "2", type: "auction", category: "경매", message: "입찰일이 3일 남았습니다", date: "2026-01-19", read: false },
    { id: "3", propertyId: "psf1", type: "auction", category: "공매", message: "공매 입찰일이 5일 남았습니다", date: "2026-01-19", read: false },
    { id: "4", propertyId: "3", type: "status", category: "경매", message: "유찰되어 2회차 진행 예정", date: "2026-01-18", read: true },
  ])

  const [mainTab, setMainTab] = useState("favorites")
  const [categoryTab, setCategoryTab] = useState("auction")

  const removeAuctionFavorite = (id: string) => {
    setAuctionFavorites(auctionFavorites.filter((f) => f.id !== id))
  }

  const removePublicSaleFavorite = (id: string) => {
    setPublicSaleFavorites(publicSaleFavorites.filter((f) => f.id !== id))
  }

  const removeNplFavorite = (id: string) => {
    setNplFavorites(nplFavorites.filter((f) => f.id !== id))
  }

  const markAlertRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }

  const totalFavorites = auctionFavorites.length + publicSaleFavorites.length + nplFavorites.length
  const unreadAlerts = alerts.filter((a) => !a.read).length

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500" />
          관심 목록
        </h1>
        <p className="text-muted-foreground mt-1">관심 매물의 가격 변동, 입찰일 알림을 받아보세요</p>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            관심 매물
            <Badge variant="secondary">{totalFavorites}</Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            알림
            {unreadAlerts > 0 && <Badge className="bg-red-500">{unreadAlerts}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6 space-y-4">
          {/* 카테고리 탭 */}
          <Tabs value={categoryTab} onValueChange={setCategoryTab}>
            <TabsList className="w-full md:w-auto">
              <TabsTrigger value="auction" className="gap-2 flex-1 md:flex-none">
                <Gavel className="h-4 w-4" />
                경매
                <Badge variant="secondary">{auctionFavorites.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="public-sale" className="gap-2 flex-1 md:flex-none">
                <Store className="h-4 w-4" />
                공매
                <Badge variant="secondary">{publicSaleFavorites.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="npl" className="gap-2 flex-1 md:flex-none">
                <Banknote className="h-4 w-4" />
                NPL
                <Badge variant="secondary">{nplFavorites.length}</Badge>
              </TabsTrigger>
            </TabsList>

            {/* 경매 관심물건 */}
            <TabsContent value="auction" className="mt-4">
              {auctionFavorites.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {auctionFavorites.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="relative w-40 h-36 shrink-0">
                          <img
                            src={property.images[0] || "/placeholder.svg"}
                            alt={property.address}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 left-2 text-xs bg-blue-500">경매</Badge>
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{property.address}</p>
                              <p className="text-xs text-muted-foreground">{property.caseNumber}</p>
                            </div>
                            <Badge
                              variant={
                                property.riskScore >= 80
                                  ? "default"
                                  : property.riskScore >= 60
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {property.riskScore}점
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">최저가</span>
                              <span className="font-bold text-primary">
                                {formatPrice(property.minimumBidPrice)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {property.auctionDate}
                              <span className="ml-2">{property.bidCount}회 유찰</span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 bg-transparent"
                              onClick={() => onSelectProperty(property)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              상세보기
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeAuctionFavorite(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">관심 경매 물건이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">경매 검색에서 관심 있는 물건을 추가해보세요</p>
                  <Button variant="outline">경매 검색하기</Button>
                </Card>
              )}
            </TabsContent>

            {/* 공매 관심물건 */}
            <TabsContent value="public-sale" className="mt-4">
              {publicSaleFavorites.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {publicSaleFavorites.map((property) => (
                    <Card key={property.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="relative w-40 h-36 shrink-0">
                          <img
                            src={property.images[0] || "/placeholder.svg"}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 left-2 text-xs bg-green-500">공매</Badge>
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{property.title}</p>
                              <p className="text-xs text-muted-foreground">{property.source}</p>
                            </div>
                            <Badge variant="outline">{property.propertyType}</Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">최저가</span>
                              <span className="font-bold text-primary">
                                {formatPrice(property.minimumBid)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {property.location}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              입찰일: {property.bidDate}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              상세보기
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removePublicSaleFavorite(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">관심 공매 물건이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">공매 검색에서 관심 있는 물건을 추가해보세요</p>
                  <Button variant="outline">공매 검색하기</Button>
                </Card>
              )}
            </TabsContent>

            {/* NPL 관심물건 */}
            <TabsContent value="npl" className="mt-4">
              {nplFavorites.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {nplFavorites.map((npl) => (
                    <Card key={npl.id} className="overflow-hidden">
                      <div className="flex">
                        <div className="relative w-40 h-36 shrink-0">
                          <img
                            src={npl.images[0] || "/placeholder.svg"}
                            alt={npl.title}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-2 left-2 text-xs bg-purple-500">NPL</Badge>
                        </div>
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{npl.title}</p>
                              <p className="text-xs text-muted-foreground">{npl.loanType}</p>
                            </div>
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                              -{npl.discountRate}%
                            </Badge>
                          </div>

                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">매각희망가</span>
                              <span className="font-bold text-primary">
                                {formatPrice(npl.askingPrice)}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">원금</span>
                              <span>{formatPrice(npl.originalLoan)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {npl.location}
                            </div>
                          </div>

                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              상세보기
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => removeNplFavorite(npl.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">관심 NPL이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">NPL 검색에서 관심 있는 채권을 추가해보세요</p>
                  <Button variant="outline">NPL 검색하기</Button>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">알림이 없습니다</h3>
                <p className="text-sm text-muted-foreground">관심 물건에 변동사항이 있으면 알려드립니다</p>
              </Card>
            ) : (
              alerts.map((alert) => {
                const property = auctionProperties.find((p) => p.id === alert.propertyId)
                return (
                  <Card
                    key={alert.id}
                    className={`cursor-pointer transition-colors ${!alert.read ? "border-primary/50 bg-primary/5" : ""}`}
                    onClick={() => markAlertRead(alert.id)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          alert.type === "price"
                            ? "bg-green-500/10 text-green-500"
                            : alert.type === "auction"
                              ? "bg-yellow-500/10 text-yellow-500"
                              : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {alert.type === "price" ? (
                          <TrendingUp className="h-5 w-5" />
                        ) : alert.type === "auction" ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <AlertCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              alert.category === "경매"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                                : alert.category === "공매"
                                  ? "bg-green-500/10 text-green-600 border-green-500/30"
                                  : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                            }`}
                          >
                            {alert.category}
                          </Badge>
                          <p className="font-medium text-sm">{alert.message}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {property?.address || "물건 정보"} • {alert.date}
                        </p>
                      </div>
                      {!alert.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
