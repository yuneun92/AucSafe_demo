"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, TrendingDown, Eye } from "lucide-react"
import type { AuctionProperty } from "@/lib/mock-data"

interface MapInfowindowProps {
  property: AuctionProperty
  onClose: () => void
  onViewDetails: () => void
}

export function MapInfowindow({ property, onClose, onViewDetails }: MapInfowindowProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-primary text-primary-foreground"
    if (score >= 60) return "bg-warning text-warning-foreground"
    return "bg-destructive text-destructive-foreground"
  }

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억원`
    }
    return `${(price / 10000).toLocaleString()}만원`
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-xl p-3 min-w-[280px] max-w-[320px]">
      {/* Header with close button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm line-clamp-1 flex-1">{property.title}</h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Thumbnail and Info */}
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-secondary">
          <img
            src={property.image}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
            {property.address}
          </p>

          {/* AI Score Badge */}
          <Badge className={`${getScoreColor(property.riskScore)} text-xs mb-2`}>
            AI 안전점수 {property.riskScore}점
          </Badge>

          {/* Price Info */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">최저입찰가</span>
              <span className="text-sm font-bold text-primary">
                {formatPrice(property.minimumBidPrice)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              <span>감정가 대비 {property.priceDropRate}% 하락</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auction Date */}
      <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border">
        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          입찰일: {property.auctionDate}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {property.failedCount > 0 ? `유찰 ${property.failedCount}회` : "신건"}
        </span>
      </div>

      {/* View Details Button */}
      <Button
        size="sm"
        className="w-full mt-2 h-8 text-xs"
        onClick={onViewDetails}
      >
        <Eye className="h-3.5 w-3.5 mr-1" />
        상세보기
      </Button>
    </div>
  )
}
