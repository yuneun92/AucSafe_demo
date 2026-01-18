"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MapPin, Calendar, TrendingDown, AlertCircle, ChevronRight } from "lucide-react"
import type { AuctionProperty } from "@/lib/mock-data"
import { useState } from "react"

interface PropertyCardProps {
  property: AuctionProperty
  onSelect: (property: AuctionProperty) => void
  onCompare: (property: AuctionProperty) => void
  isComparing?: boolean
}

export function PropertyCard({ property, onSelect, onCompare, isComparing }: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-primary bg-primary/10"
    if (score <= 60) return "text-accent bg-accent/10"
    return "text-destructive bg-destructive/10"
  }

  const getRecommendColor = (score: number) => {
    if (score >= 80) return "text-primary bg-primary/10"
    if (score >= 60) return "text-accent bg-accent/10"
    return "text-muted-foreground bg-muted"
  }

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all cursor-pointer group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg">
          <img
            src={property.images[0] || "/placeholder.svg"}
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur">
              {property.propertyType}
            </Badge>
            {property.occupancyStatus === "공실" && (
              <Badge className="bg-primary/90 text-primary-foreground">공실</Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 h-8 w-8 bg-background/90 backdrop-blur hover:bg-background"
            onClick={(e) => {
              e.stopPropagation()
              setIsFavorite(!isFavorite)
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
          </Button>

          {/* Price Info */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground">최저가</p>
                <p className="text-xl font-bold text-foreground">{formatPrice(property.minimumBid)}</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <TrendingDown className="h-4 w-4" />
                {property.priceDropRate}% 할인
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Address */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-foreground line-clamp-2">{property.address}</p>
          </div>

          {/* Info Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {property.auctionDate}
            </div>
            <span>{property.area}㎡</span>
            <span>입찰 {property.bidCount}회</span>
          </div>

          {/* Scores */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getRecommendColor(property.recommendScore)}>
              추천 {property.recommendScore}점
            </Badge>
            <Badge variant="outline" className={getRiskColor(property.riskScore)}>
              리스크 {property.riskScore}점
            </Badge>
          </div>

          {/* Risk Warning */}
          {property.registryIssues.length > 0 && property.riskScore > 30 && (
            <div className="flex items-start gap-2 p-2 rounded-md bg-accent/10 text-accent text-xs">
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{property.registryIssues[0]}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant={isComparing ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                onCompare(property)
              }}
            >
              {isComparing ? "비교 중" : "비교 추가"}
            </Button>
            <Button size="sm" className="flex-1" onClick={() => onSelect(property)}>
              상세 분석
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
