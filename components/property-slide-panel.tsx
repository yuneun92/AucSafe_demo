"use client"

import {
  X,
  Heart,
  Share2,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Building2,
  Scale,
  FileText,
  BarChart3,
  Calculator,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AuctionProperty } from "@/lib/mock-data"
import { RightsAnalysis } from "./rights-analysis"

import { useState, useEffect } from "react"

interface PropertySlidePanelProps {
  property: AuctionProperty | null
  isOpen: boolean
  onClose: () => void
  onFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function PropertySlidePanel({ property, isOpen, onClose, onFavorite, isFavorite }: PropertySlidePanelProps) {
  const [activeTab, setActiveTab] = useState("analysis")

  // 패널 열릴 때 탭 초기화
  useEffect(() => {
    if (isOpen) {
      setActiveTab("analysis")
    }
  }, [isOpen, property?.id])

  if (!property) return null

  const riskItems = [
    { label: "선순위 근저당", status: "safe", detail: "없음" },
    { label: "임차인", status: "warning", detail: "1명 (보증금 5천만원)" },
    { label: "가처분/가등기", status: "safe", detail: "없음" },
    { label: "유치권", status: "safe", detail: "미신고" },
  ]

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header Image */}
        <div className="relative h-56 bg-secondary">
          <img
            src={property.image || "/placeholder.svg?height=224&width=600&query=apartment building"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />

          {/* Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full bg-card/80 backdrop-blur"
              onClick={() => onFavorite?.(property.id)}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-card/80 backdrop-blur">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="secondary" size="icon" className="rounded-full bg-card/80 backdrop-blur" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* AI Score Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge
              className={`text-sm px-3 py-1 ${
                property.riskScore >= 80
                  ? "bg-primary/20 text-primary border-primary/30"
                  : property.riskScore >= 60
                    ? "bg-warning/20 text-warning border-warning/30"
                    : "bg-destructive/20 text-destructive border-destructive/30"
              }`}
            >
              AI 안전점수 {property.riskScore}점
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title & Location */}
          <div>
            <h2 className="text-xl font-bold mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <MapPin className="w-4 h-4" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Key Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">감정가</p>
              <p className="text-lg font-bold">{(property.appraisalPrice / 100000000).toFixed(1)}억원</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">최저입찰가</p>
              <p className="text-lg font-bold text-primary">{(property.minimumBidPrice / 100000000).toFixed(1)}억원</p>
              <p className="text-xs text-muted-foreground">
                ({Math.round((property.minimumBidPrice / property.appraisalPrice) * 100)}%)
              </p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">입찰일</p>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <p className="font-semibold">{property.auctionDate}</p>
              </div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">유찰횟수</p>
              <p className="text-lg font-bold">{property.failedCount}회</p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 bg-secondary">
              <TabsTrigger value="analysis" className="gap-1">
                <Scale className="w-3 h-3" />
                권리분석
              </TabsTrigger>
              <TabsTrigger value="calculator" className="gap-1">
                <Calculator className="w-3 h-3" />
                입찰계산
              </TabsTrigger>
              <TabsTrigger value="area" className="gap-1">
                <MapPin className="w-3 h-3" />
                주변정보
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-4 space-y-4">
              {/* 간단 요약 */}
              <div className="space-y-3">
                {riskItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      {item.status === "safe" ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : item.status === "warning" ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      )}
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{item.detail}</span>
                  </div>
                ))}
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  AI 종합 의견
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  해당 물건은 권리관계가 비교적 단순하며, 임차인 1명에 대한 명도 협의가 필요합니다. 유찰{" "}
                  {property.failedCount}회로 가격 메리트가 있으며, 주변 시세 대비 투자 가치가 높은 것으로 분석됩니다.
                </p>
              </div>

              {/* 상세 분석 버튼 */}
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("calculator")}>
                <Scale className="w-4 h-4 mr-2" />
                상세 권리분석 보기
              </Button>
            </TabsContent>

            <TabsContent value="calculator" className="mt-4">
              <RightsAnalysis
                propertyId={property.id}
                appraisalPrice={property.appraisalPrice}
                minimumBidPrice={property.minimumBidPrice}
              />
            </TabsContent>

            <TabsContent value="area" className="mt-4 space-y-4">
              {/* 시세 정보 */}
              <div className="space-y-3 pb-4 border-b border-border">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  시세 정보
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">주변 평균 시세</span>
                  <span className="font-semibold">{((property.appraisalPrice * 1.1) / 100000000).toFixed(1)}억원</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">예상 수익률</span>
                  <span className="font-semibold text-green-500">+15.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">평당가</span>
                  <span className="font-semibold">2,850만원</span>
                </div>
              </div>

              {/* 주변 시설 */}
              <h4 className="font-semibold text-sm">주변 시설</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: "지하철역", value: "도보 5분" },
                  { icon: Building2, label: "초등학교", value: "300m" },
                  { icon: Building2, label: "대형마트", value: "500m" },
                  { icon: Building2, label: "종합병원", value: "1.2km" },
                ].map((item, i) => (
                  <div key={i} className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" className="flex-1 bg-transparent">
              <Scale className="w-4 h-4 mr-2" />
              비교함에 추가
            </Button>
            <Button className="flex-1">입찰 시뮬레이션</Button>
          </div>
        </div>
      </div>
    </>
  )
}
