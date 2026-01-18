"use client"

import { useState } from "react"
import type { AuctionProperty } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Calendar,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  FileText,
  Building2,
  DollarSign,
  Users,
  ChevronLeft,
  Heart,
  Share2,
  Printer,
  ExternalLink,
} from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

interface PropertyDetailProps {
  property: AuctionProperty
  onClose: () => void
  onCompare: (property: AuctionProperty) => void
}

export function PropertyDetail({ property, onClose, onCompare }: PropertyDetailProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const priceChartData = property.priceHistory.map((item) => ({
    ...item,
    price: item.price / 100000000,
  }))

  const comparisonData = [
    { name: "감정가", value: property.appraisedValue / 100000000 },
    { name: "최저가", value: property.minimumBid / 100000000 },
    { name: "시세", value: property.marketPrice / 100000000 },
  ]

  const riskItems = [
    {
      label: "권리분석",
      status: property.riskScore <= 30 ? "safe" : property.riskScore <= 60 ? "warning" : "danger",
      description: property.registryIssues[0] || "권리관계 깨끗",
    },
    {
      label: "점유현황",
      status: property.occupancyStatus === "공실" ? "safe" : "warning",
      description: property.occupancyStatus,
    },
    {
      label: "시세대비",
      status: property.minimumBid < property.marketPrice * 0.7 ? "safe" : "warning",
      description: `시세 대비 ${Math.round((1 - property.minimumBid / property.marketPrice) * 100)}% 할인`,
    },
    {
      label: "입찰경쟁",
      status: property.bidCount <= 3 ? "safe" : property.bidCount <= 5 ? "warning" : "danger",
      description: `${property.bidCount}회 유찰`,
    },
  ]

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-auto">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onClose}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => onCompare(property)}>
              비교 추가
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image & Basic Info */}
            <Card className="bg-card border-border overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant="secondary" className="bg-background/90 backdrop-blur">
                    {property.propertyType}
                  </Badge>
                  <Badge className="bg-primary text-primary-foreground">{property.caseNumber}</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold mb-2">{property.address}</h1>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {property.area}㎡
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {property.auctionDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {property.bidCount}회 유찰
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">최저 입찰가</p>
                    <p className="text-2xl font-bold text-primary">{formatPrice(property.minimumBid)}</p>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <TrendingDown className="h-4 w-4" />
                      감정가 대비 {property.priceDropRate}% 할인
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="w-full justify-start bg-secondary">
                <TabsTrigger value="analysis">AI 분석</TabsTrigger>
                <TabsTrigger value="rights">권리분석</TabsTrigger>
                <TabsTrigger value="price">가격 추이</TabsTrigger>
                <TabsTrigger value="location">주변 정보</TabsTrigger>
              </TabsList>

              <TabsContent value="analysis" className="mt-4 space-y-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">AI 종합 분석</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{property.description}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-primary/10">
                        <p className="text-sm text-muted-foreground mb-1">추천 점수</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-primary">{property.recommendScore}</span>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <Progress value={property.recommendScore} className="mt-2 h-2" />
                      </div>
                      <div className="p-4 rounded-lg bg-destructive/10">
                        <p className="text-sm text-muted-foreground mb-1">리스크 점수</p>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-destructive">{property.riskScore}</span>
                          <span className="text-sm text-muted-foreground">/ 100</span>
                        </div>
                        <Progress
                          value={property.riskScore}
                          className="mt-2 h-2 bg-destructive/20 [&>div]:bg-destructive"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {riskItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                          <div className="flex items-center gap-3">
                            {item.status === "safe" ? (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            ) : item.status === "warning" ? (
                              <AlertTriangle className="h-5 w-5 text-accent" />
                            ) : (
                              <AlertTriangle className="h-5 w-5 text-destructive" />
                            )}
                            <span className="font-medium">{item.label}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{item.description}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rights" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      등기부등본 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">설정된 권리</p>
                      <div className="flex flex-wrap gap-2">
                        {property.rights.map((right, index) => (
                          <Badge key={index} variant="outline">
                            {right}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">권리분석 요약</p>
                      <div className="space-y-2">
                        {property.registryIssues.map((issue, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-2 p-3 rounded-lg ${
                              issue.includes("깨끗") || issue.includes("없음")
                                ? "bg-primary/10 text-primary"
                                : "bg-accent/10 text-accent"
                            }`}
                          >
                            {issue.includes("깨끗") || issue.includes("없음") ? (
                              <CheckCircle className="h-4 w-4 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 mt-0.5" />
                            )}
                            <span className="text-sm">{issue}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      등기부등본 원문 보기
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="price" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base">가격 변동 추이</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`${value}억`, "가격"]}
                          />
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke="hsl(var(--primary))"
                            strokeWidth={2}
                            dot={{ fill: "hsl(var(--primary))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "8px",
                            }}
                            formatter={(value: number) => [`${value.toFixed(1)}억`, "가격"]}
                          />
                          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="location" className="mt-4">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      주변 시설 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-lg bg-secondary mb-4 flex items-center justify-center">
                      <span className="text-muted-foreground">지도 영역</span>
                    </div>
                    <div className="space-y-2">
                      {property.nearbyFacilities.map((facility, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-sm">{facility}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Price Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  가격 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">감정가</span>
                  <span className="font-medium">{formatPrice(property.appraisedValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">최저 입찰가</span>
                  <span className="font-bold text-primary text-lg">{formatPrice(property.minimumBid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">시세</span>
                  <span className="font-medium">{formatPrice(property.marketPrice)}</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">예상 수익</span>
                    <span className="font-bold text-primary">
                      {formatPrice(property.marketPrice - property.minimumBid)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">시세 기준 예상 차익 (취득세, 기타 비용 미포함)</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendation */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <CheckCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-primary">AI 추천</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {property.recommendScore >= 80
                        ? "권리관계가 깨끗하고 시세 대비 할인율이 높아 투자 가치가 있습니다."
                        : "일부 주의사항이 있으니 상세 분석을 확인하세요."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button className="w-full" size="lg">
                입찰 시뮬레이션
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                전문가 상담 신청
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
