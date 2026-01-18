"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Users,
  Building,
  MapPin,
  TrendingUp,
  Lightbulb,
  ChevronRight,
  Bot,
} from "lucide-react"
import type { AuctionProperty } from "@/lib/mock-data"

interface AIRiskPanelProps {
  property: AuctionProperty | null
}

export function AIRiskPanel({ property }: AIRiskPanelProps) {
  const [activeTab, setActiveTab] = useState("summary")

  if (!property) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">매물을 선택하세요</h3>
        <p className="text-sm text-muted-foreground">
          지도에서 매물을 클릭하면
          <br />
          AI 분석 결과를 확인할 수 있습니다
        </p>
      </Card>
    )
  }

  const riskItems = [
    {
      label: "근저당권",
      status: "warning" as const,
      detail: "국민은행 근저당 설정 3.5억",
      icon: FileText,
    },
    {
      label: "전입세대",
      status: "safe" as const,
      detail: "전입세대 없음 확인",
      icon: Users,
    },
    {
      label: "건물 상태",
      status: "safe" as const,
      detail: "2019년 준공, 양호",
      icon: Building,
    },
    {
      label: "유치권",
      status: "safe" as const,
      detail: "유치권 신고 없음",
      icon: Shield,
    },
    {
      label: "법정지상권",
      status: "safe" as const,
      detail: "해당사항 없음",
      icon: MapPin,
    },
  ]

  const getStatusIcon = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "danger":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBg = (status: "safe" | "warning" | "danger") => {
    switch (status) {
      case "safe":
        return "bg-emerald-500/10 border-emerald-500/20"
      case "warning":
        return "bg-amber-500/10 border-amber-500/20"
      case "danger":
        return "bg-red-500/10 border-red-500/20"
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="mb-2 gap-1">
              <Bot className="h-3 w-3" />
              AI 분석
            </Badge>
            <CardTitle className="text-base line-clamp-1">{property.address}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">{property.caseNumber}</p>
          </div>
          <div className="text-right">
            <div
              className={`text-3xl font-bold ${
                property.riskScore >= 80
                  ? "text-emerald-500"
                  : property.riskScore >= 60
                    ? "text-amber-500"
                    : "text-red-500"
              }`}
            >
              {property.riskScore}
            </div>
            <p className="text-xs text-muted-foreground">안전점수</p>
          </div>
        </div>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="summary"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            요약
          </TabsTrigger>
          <TabsTrigger
            value="rights"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            권리분석
          </TabsTrigger>
          <TabsTrigger
            value="price"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            시세분석
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto">
          <TabsContent value="summary" className="m-0 p-4 space-y-4">
            {/* AI Summary */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">AI 종합 의견</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    해당 물건은 <span className="text-foreground font-medium">권리관계가 단순</span>하고
                    <span className="text-foreground font-medium"> 주변 시세 대비 저렴</span>하여 투자 가치가 있습니다.
                    다만 근저당 설정 금액을 고려한 입찰가 산정이 필요합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">예상 수익률</p>
                <p className="text-lg font-bold text-emerald-500">+18.5%</p>
              </div>
              <div className="bg-secondary rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">시세 대비</p>
                <p className="text-lg font-bold text-primary">-22%</p>
              </div>
            </div>

            {/* Risk Checklist */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                리스크 체크리스트
              </h4>
              {riskItems.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getStatusBg(item.status)}`}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(item.status)}
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rights" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">등기부등본 분석</h4>

              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">소유권</span>
                  <span className="text-sm font-medium">김OO (단독소유)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">근저당권</span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-amber-500">3.5억원</span>
                    <p className="text-xs text-muted-foreground">국민은행</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">가압류</span>
                  <span className="text-sm font-medium text-emerald-500">없음</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm">전세권</span>
                  <span className="text-sm font-medium text-emerald-500">없음</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">임차인</span>
                  <span className="text-sm font-medium text-emerald-500">미확인</span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-500">주의사항</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      근저당 설정금액 3.5억을 고려하여 입찰가를 산정하세요. 낙찰 후 말소되는 권리입니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="price" className="m-0 p-4 space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">가격 분석</h4>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>감정가</span>
                    <span className="font-medium">{(property.appraisalPrice / 100000000).toFixed(1)}억</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>최저입찰가</span>
                    <span className="font-medium text-primary">
                      {(property.minimumBidPrice / 100000000).toFixed(1)}억
                    </span>
                  </div>
                  <Progress value={(property.minimumBidPrice / property.appraisalPrice) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>주변 시세</span>
                    <span className="font-medium">{((property.appraisalPrice * 1.1) / 100000000).toFixed(1)}억</span>
                  </div>
                  <Progress value={110} className="h-2 [&>div]:bg-emerald-500" />
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-4 space-y-3">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  예상 수익 시나리오
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">낙찰가 (최저가 기준)</span>
                    <span>{(property.minimumBidPrice / 100000000).toFixed(1)}억</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">취득세 (4.6%)</span>
                    <span>{((property.minimumBidPrice * 0.046) / 10000).toFixed(0)}만</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">기타 비용</span>
                    <span>약 500만</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>예상 총 투자금</span>
                    <span>{((property.minimumBidPrice * 1.05) / 100000000).toFixed(2)}억</span>
                  </div>
                  <div className="flex justify-between text-emerald-500 font-medium">
                    <span>예상 시세차익</span>
                    <span>+{((property.appraisalPrice * 0.1) / 100000000).toFixed(2)}억</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-4 border-t">
        <Button className="w-full">전체 분석 리포트 보기</Button>
      </div>
    </Card>
  )
}
