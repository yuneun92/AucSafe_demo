"use client"

import type { AuctionProperty } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Scale } from "lucide-react"

interface ComparePanelProps {
  properties: AuctionProperty[]
  onRemove: (property: AuctionProperty) => void
  onClear: () => void
}

export function ComparePanel({ properties, onRemove, onClear }: ComparePanelProps) {
  if (properties.length === 0) return null

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const compareFields = [
    { label: "물건 유형", key: "propertyType" },
    { label: "면적", key: "area", format: (v: number) => `${v}㎡` },
    { label: "감정가", key: "appraisedValue", format: formatPrice },
    { label: "최저 입찰가", key: "minimumBid", format: formatPrice },
    { label: "시세", key: "marketPrice", format: formatPrice },
    { label: "할인율", key: "priceDropRate", format: (v: number) => `${v}%` },
    { label: "추천 점수", key: "recommendScore", format: (v: number) => `${v}점` },
    { label: "리스크 점수", key: "riskScore", format: (v: number) => `${v}점` },
    { label: "점유 상태", key: "occupancyStatus" },
    { label: "경매일", key: "auctionDate" },
  ]

  const getBestValue = (key: string) => {
    if (key === "riskScore") {
      return Math.min(...properties.map((p) => p[key as keyof AuctionProperty] as number))
    }
    if (["recommendScore", "priceDropRate"].includes(key)) {
      return Math.max(...properties.map((p) => p[key as keyof AuctionProperty] as number))
    }
    if (["minimumBid", "appraisedValue"].includes(key)) {
      return Math.min(...properties.map((p) => p[key as keyof AuctionProperty] as number))
    }
    return null
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Scale className="h-5 w-5" />
            매물 비교 ({properties.length}/3)
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClear}>
            전체 삭제
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left p-2 text-sm font-medium text-muted-foreground min-w-[100px]">항목</th>
                {properties.map((property) => (
                  <th key={property.id} className="p-2 min-w-[150px]">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6"
                        onClick={() => onRemove(property)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <img
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.address}
                        className="w-full aspect-video object-cover rounded-lg mb-2"
                      />
                      <p className="text-xs font-medium line-clamp-2">{property.address}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {compareFields.map((field) => {
                const bestValue = getBestValue(field.key)
                return (
                  <tr key={field.key} className="border-t border-border">
                    <td className="p-2 text-sm text-muted-foreground">{field.label}</td>
                    {properties.map((property) => {
                      const value = property[field.key as keyof AuctionProperty]
                      const isBest = bestValue !== null && typeof value === "number" && value === bestValue
                      return (
                        <td key={property.id} className="p-2 text-center">
                          <span className={`text-sm ${isBest ? "font-bold text-primary" : ""}`}>
                            {field.format ? field.format(value as number) : String(value)}
                          </span>
                          {isBest && (
                            <Badge variant="secondary" className="ml-1 text-xs">
                              최고
                            </Badge>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
