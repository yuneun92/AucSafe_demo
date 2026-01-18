"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Building2, Building, Home, Store } from "lucide-react"

export interface MapFilterState {
  propertyTypes: string[]
  priceRange: [number, number]
  minSafetyScore: number
}

interface MapFilterOverlayProps {
  filters: MapFilterState
  onFiltersChange: (filters: MapFilterState) => void
  totalCount: number
  filteredCount: number
}

const propertyTypeOptions = [
  { id: "아파트", label: "아파트", icon: Building2 },
  { id: "오피스텔", label: "오피스텔", icon: Building },
  { id: "빌라", label: "빌라", icon: Home },
  { id: "상가", label: "상가", icon: Store },
]

export function MapFilterOverlay({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: MapFilterOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyTypes.includes(type)
      ? filters.propertyTypes.filter((t) => t !== type)
      : [...filters.propertyTypes, type]
    onFiltersChange({ ...filters, propertyTypes: newTypes })
  }

  const formatPrice = (value: number) => {
    if (value >= 10) return `${value}억`
    return `${value * 10000}만`
  }

  const hasActiveFilters =
    filters.propertyTypes.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 30 ||
    filters.minSafetyScore > 0

  const resetFilters = () => {
    onFiltersChange({
      propertyTypes: [],
      priceRange: [0, 30],
      minSafetyScore: 0,
    })
  }

  return (
    <Card className="shadow-lg border-border">
      <CardContent className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-sm font-medium"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>필터</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {filteredCount}/{totalCount}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={resetFilters}
            >
              <X className="h-3 w-3 mr-1" />
              초기화
            </Button>
          )}
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Property Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                물건 유형
              </label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((option) => {
                  const isActive = filters.propertyTypes.includes(option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => togglePropertyType(option.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <option.icon className="h-3.5 w-3.5" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">
                  가격 범위
                </label>
                <span className="text-xs text-foreground">
                  {formatPrice(filters.priceRange[0])} ~ {formatPrice(filters.priceRange[1])}
                </span>
              </div>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, priceRange: value as [number, number] })
                }
                min={0}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* Safety Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">
                  최소 AI 안전점수
                </label>
                <span className="text-xs text-foreground">{filters.minSafetyScore}점 이상</span>
              </div>
              <Slider
                value={[filters.minSafetyScore]}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, minSafetyScore: value[0] })
                }
                min={0}
                max={100}
                step={10}
                className="w-full"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
