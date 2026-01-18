"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  Building2,
  Gavel,
  Target,
  AlertTriangle,
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface DashboardPageProps {
  onNavigate: (tab: string) => void
  onSelectProperty: (property: AuctionProperty) => void
}

const stats = [
  {
    label: "오늘의 추천 매물",
    value: "127",
    change: "+12",
    changeType: "positive" as const,
    icon: Target,
  },
  {
    label: "신규 경매 등록",
    value: "48",
    change: "+8",
    changeType: "positive" as const,
    icon: Gavel,
  },
  {
    label: "평균 낙찰가율",
    value: "78.5%",
    change: "-2.3%",
    changeType: "negative" as const,
    icon: Building2,
  },
  {
    label: "주의 매물",
    value: "15",
    change: "+3",
    changeType: "warning" as const,
    icon: AlertTriangle,
  },
]

const upcomingAuctions = [
  { date: "2025-01-20", count: 23, court: "서울중앙지방법원" },
  { date: "2025-01-22", count: 18, court: "서울동부지방법원" },
  { date: "2025-01-25", count: 31, court: "수원지방법원" },
  { date: "2025-01-27", count: 15, court: "인천지방법원" },
]

const marketTrends = [
  { region: "서울 강남", change: +2.3, trend: "up" },
  { region: "서울 마포", change: +1.8, trend: "up" },
  { region: "경기 수원", change: -0.5, trend: "down" },
  { region: "인천 송도", change: +3.1, trend: "up" },
]

export function DashboardPage({ onNavigate, onSelectProperty }: DashboardPageProps) {
  const topProperties = auctionProperties.filter((p) => p.riskScore >= 80).slice(0, 3)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">안녕하세요, 투자자님!</h1>
          <p className="text-muted-foreground mt-1">오늘의 경매 시장 현황을 확인하세요</p>
        </div>
        <Button onClick={() => onNavigate("search")}>
          <Sparkles className="h-4 w-4 mr-2" />
          AI 추천 매물 보기
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-500"
                      : stat.changeType === "negative"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : stat.changeType === "negative" ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Recommended Properties */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">AI 추천 매물 TOP 3</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("search")}>
                전체보기 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProperties.map((property, index) => (
                <div
                  key={property.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors"
                  onClick={() => onSelectProperty(property)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{property.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{property.location}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-primary">
                        {(property.minimumBidPrice / 100000000).toFixed(1)}억
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {property.propertyType}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        property.riskScore >= 80
                          ? "bg-green-500"
                          : property.riskScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }
                    >
                      {property.riskScore}점
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{property.auctionDate}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Auctions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              다가오는 경매일
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingAuctions.map((auction) => (
              <div
                key={auction.date}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div>
                  <p className="font-medium">{auction.date}</p>
                  <p className="text-xs text-muted-foreground">{auction.court}</p>
                </div>
                <Badge variant="secondary">{auction.count}건</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Market Trends */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              지역별 시세 동향
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {marketTrends.map((trend) => (
              <div key={trend.region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{trend.region}</span>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      trend.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {trend.change > 0 ? "+" : ""}
                    {trend.change}%
                  </span>
                </div>
                <Progress
                  value={50 + trend.change * 10}
                  className="h-2"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              빠른 실행
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate("search")}
            >
              <Building2 className="h-6 w-6" />
              <span>매물 검색</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate("analysis")}
            >
              <Sparkles className="h-6 w-6" />
              <span>AI 분석</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
              onClick={() => onNavigate("favorites")}
            >
              <Target className="h-6 w-6" />
              <span>관심 매물</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Calendar className="h-6 w-6" />
              <span>입찰 일정</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
