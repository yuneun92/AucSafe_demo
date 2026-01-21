"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  History,
  Building2,
  MapPin,
  Calendar,
  Heart,
  Trash2,
  Clock,
  ChevronRight,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface RecentViewsPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

// 목업 최근 열람 데이터
const mockRecentViews = auctionProperties.slice(0, 10).map((p, i) => ({
  ...p,
  viewedAt: new Date(Date.now() - i * 3600000).toISOString(),
  viewCount: Math.floor(Math.random() * 5) + 1,
}))

export function RecentViewsPage({ onSelectProperty }: RecentViewsPageProps) {
  const [filter, setFilter] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const filteredViews = mockRecentViews.filter((view) => {
    if (filter === "all") return true
    if (filter === "today") {
      const today = new Date().toDateString()
      return new Date(view.viewedAt).toDateString() === today
    }
    if (filter === "week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      return new Date(view.viewedAt).getTime() > weekAgo
    }
    return true
  })

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id])
  }

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const deleteSelected = () => {
    // 목업: 실제로는 API 호출
    console.log("Delete:", selectedItems)
    setSelectedItems([])
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))

    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return date.toLocaleDateString()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6 text-primary" />
            최근 열람 물건
          </h1>
          <p className="text-muted-foreground mt-1">
            최근에 본 경매/공매 물건입니다
          </p>
        </div>
        {selectedItems.length > 0 && (
          <Button variant="destructive" size="sm" onClick={deleteSelected}>
            <Trash2 className="h-4 w-4 mr-2" />
            선택 삭제 ({selectedItems.length})
          </Button>
        )}
      </div>

      {/* 필터 */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="today">오늘</TabsTrigger>
            <TabsTrigger value="week">이번 주</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-sm text-muted-foreground">
          총 {filteredViews.length}건
        </p>
      </div>

      {/* 열람 목록 */}
      <div className="space-y-3">
        {filteredViews.map((view) => (
          <Card
            key={view.id}
            className={`overflow-hidden transition-colors cursor-pointer ${
              selectedItems.includes(view.id) ? "border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => onSelectProperty(view)}
          >
            <CardContent className="p-0">
              <div className="flex">
                <div className="relative w-32 h-24 shrink-0">
                  <img
                    src={view.images?.[0] || view.image || "/placeholder.svg"}
                    alt={view.address}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                </div>
                <div className="flex-1 p-3 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(view.id)}
                    onChange={() => toggleSelect(view.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {view.propertyType}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(view.viewedAt)}
                      </span>
                      {view.viewCount > 1 && (
                        <span className="text-xs text-muted-foreground">
                          ({view.viewCount}회 열람)
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-sm truncate">{view.address || view.title}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {view.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {view.auctionDate}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {(view.minimumBidPrice / 100000000).toFixed(1)}억
                    </p>
                    <Badge
                      variant={
                        view.riskScore >= 80 ? "default" : view.riskScore >= 60 ? "secondary" : "destructive"
                      }
                      className="text-xs mt-1"
                    >
                      {view.riskScore}점
                    </Badge>
                  </div>
                  <button
                    className={`p-2 rounded-full transition-colors ${
                      favorites.includes(view.id)
                        ? "bg-red-500 text-white"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                    onClick={(e) => toggleFavorite(view.id, e)}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(view.id) ? "fill-current" : ""}`} />
                  </button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredViews.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>최근 열람한 물건이 없습니다</p>
            <p className="text-sm mt-2">관심있는 물건을 둘러보세요</p>
          </CardContent>
        </Card>
      )}

      {/* 전체 삭제 */}
      {filteredViews.length > 0 && (
        <div className="flex justify-center">
          <Button variant="ghost" className="text-muted-foreground">
            열람 기록 전체 삭제
          </Button>
        </div>
      )}
    </div>
  )
}
