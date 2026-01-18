"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Bell, Calendar, TrendingUp, Trash2, ExternalLink, AlertCircle, Clock } from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface FavoritesPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

export function FavoritesPage({ onSelectProperty }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState(auctionProperties.slice(0, 4))
  const [alerts, setAlerts] = useState([
    { id: "1", propertyId: "1", type: "price", message: "최저가가 10% 하락했습니다", date: "2024-12-15", read: false },
    { id: "2", propertyId: "2", type: "auction", message: "입찰일이 3일 남았습니다", date: "2024-12-14", read: false },
    { id: "3", propertyId: "3", type: "status", message: "유찰되어 2회차 진행 예정", date: "2024-12-13", read: true },
  ])

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  const markAlertRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)))
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

      <Tabs defaultValue="favorites" className="w-full">
        <TabsList>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            관심 매물
            <Badge variant="secondary">{favorites.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-2">
            <Bell className="h-4 w-4" />
            알림
            <Badge variant="secondary">{alerts.filter((a) => !a.read).length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favorites.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {favorites.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="relative w-40 h-36 shrink-0">
                      <img
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.address}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 text-xs">{property.propertyType}</Badge>
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
                            {(property.minimumBidPrice / 100000000).toFixed(1)}억
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
                          onClick={() => removeFavorite(property.id)}
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
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">관심 매물이 없습니다</h3>
              <p className="text-sm text-muted-foreground mb-4">매물 검색에서 관심 있는 매물을 추가해보세요</p>
              <Button variant="outline">매물 검색하기</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="mt-6">
          <div className="space-y-3">
            {alerts.map((alert) => {
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
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {property?.address} • {alert.date}
                      </p>
                    </div>
                    {!alert.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
