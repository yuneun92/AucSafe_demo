"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  ArrowDown,
  Calculator,
  Lightbulb,
  TrendingUp,
  Banknote,
  Home,
  User,
  Building,
  Scale,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

interface RightsTimelineItem {
  date: string
  type: "mortgage" | "lease" | "seizure" | "auction" | "transfer"
  title: string
  holder: string
  amount?: number
  isBaseline?: boolean
  willBeCancelled: boolean
  description: string
}

interface RightsAnalysisProps {
  propertyId: string
  appraisalPrice: number
  minimumBidPrice: number
}

// 목업 권리관계 데이터
const mockRightsTimeline: RightsTimelineItem[] = [
  {
    date: "2018.03.15",
    type: "transfer",
    title: "소유권 이전",
    holder: "김OO",
    willBeCancelled: false,
    description: "현재 소유자가 매매로 취득",
  },
  {
    date: "2019.05.20",
    type: "mortgage",
    title: "근저당권 설정",
    holder: "KB국민은행",
    amount: 360000000,
    isBaseline: true,
    willBeCancelled: true,
    description: "말소기준권리 - 이 권리 이후 설정된 권리들은 낙찰 시 모두 말소됩니다",
  },
  {
    date: "2019.08.10",
    type: "lease",
    title: "전입신고 (임차인)",
    holder: "이OO",
    amount: 120000000,
    willBeCancelled: false,
    description: "대항력 있는 임차인 - 말소기준권리보다 후순위이나 배당요구로 보증금 일부 회수 예정",
  },
  {
    date: "2023.11.05",
    type: "seizure",
    title: "가압류",
    holder: "서울중앙지법",
    amount: 50000000,
    willBeCancelled: true,
    description: "낙찰 시 말소되는 권리",
  },
  {
    date: "2024.01.10",
    type: "auction",
    title: "경매개시결정",
    holder: "서울중앙지방법원",
    willBeCancelled: true,
    description: "현재 진행 중인 경매",
  },
]

const typeConfig = {
  mortgage: { icon: Building, color: "text-blue-500", bg: "bg-blue-500/10", label: "근저당" },
  lease: { icon: User, color: "text-green-500", bg: "bg-green-500/10", label: "임차권" },
  seizure: { icon: Scale, color: "text-red-500", bg: "bg-red-500/10", label: "가압류" },
  auction: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "경매" },
  transfer: { icon: Home, color: "text-purple-500", bg: "bg-purple-500/10", label: "소유권" },
}

export function RightsAnalysis({ propertyId, appraisalPrice, minimumBidPrice }: RightsAnalysisProps) {
  const [expectedBidPrice, setExpectedBidPrice] = useState(minimumBidPrice)
  const [showAllRights, setShowAllRights] = useState(false)
  const [expandedItem, setExpandedItem] = useState<number | null>(null)

  // 비용 계산
  const acquisitionTax = Math.round(expectedBidPrice * 0.046) // 취득세 약 4.6%
  const assumedDeposit = 120000000 // 인수해야 할 임차보증금
  const otherCosts = 5000000 // 기타 비용 (등기비용 등)
  const totalInvestment = expectedBidPrice + assumedDeposit + acquisitionTax + otherCosts

  // 예상 수익 계산
  const marketPrice = appraisalPrice * 1.1
  const expectedProfit = marketPrice - totalInvestment
  const expectedROI = ((expectedProfit / totalInvestment) * 100).toFixed(1)

  // 말소기준권리 찾기
  const baselineRight = mockRightsTimeline.find((r) => r.isBaseline)

  return (
    <div className="space-y-6">
      {/* 권리관계 한눈에 보기 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              권리관계 타임라인
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>등기부에 기재된 권리들을 시간순으로 보여줍니다. 말소기준권리를 기준으로 어떤 권리가 말소되고 인수되는지 확인하세요.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          {/* 말소기준권리 강조 박스 */}
          {baselineRight && (
            <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-primary">말소기준권리란?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    경매에서 가장 중요한 개념입니다. <strong>{baselineRight.date}</strong>에 설정된 <strong>{baselineRight.holder}</strong>의 근저당권이 말소기준권리입니다.
                  </p>
                  <p className="text-sm mt-2">
                    <span className="text-green-600 font-medium">이 날짜 이후</span>에 설정된 권리는 낙찰 시 <span className="text-green-600 font-medium">자동 말소</span>되고,
                    <span className="text-red-600 font-medium"> 이전</span>에 설정된 권리는 <span className="text-red-600 font-medium">인수</span>해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 타임라인 */}
          <div className="relative">
            {mockRightsTimeline.map((item, index) => {
              const config = typeConfig[item.type]
              const Icon = config.icon
              const isExpanded = expandedItem === index

              return (
                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                  {/* 연결선 */}
                  {index < mockRightsTimeline.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border" />
                  )}

                  {/* 아이콘 */}
                  <div
                    className={`absolute left-0 p-2 rounded-full ${config.bg} ${
                      item.isBaseline ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  {/* 내용 */}
                  <div
                    className={`ml-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                      item.isBaseline
                        ? "border-primary bg-primary/5"
                        : item.willBeCancelled
                          ? "border-green-500/30 bg-green-500/5"
                          : "border-red-500/30 bg-red-500/5"
                    }`}
                    onClick={() => setExpandedItem(isExpanded ? null : index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {item.date}
                        </Badge>
                        <span className="font-medium text-sm">{item.title}</span>
                        {item.isBaseline && (
                          <Badge className="bg-primary text-xs">말소기준권리</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.willBeCancelled ? (
                          <Badge variant="outline" className="text-green-600 border-green-600/50 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            말소
                          </Badge>
                        ) : item.type !== "transfer" ? (
                          <Badge variant="outline" className="text-red-600 border-red-600/50 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            인수
                          </Badge>
                        ) : null}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span>{item.holder}</span>
                      {item.amount && (
                        <span className="font-medium text-foreground">
                          {(item.amount / 100000000).toFixed(1)}억원
                        </span>
                      )}
                    </div>

                    {/* 확장 설명 */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 왜 이 금액인가? */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            왜 이 금액으로 입찰해야 하나요?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 입찰가 슬라이더 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">예상 입찰가 설정</span>
              <span className="font-bold text-primary text-lg">
                {(expectedBidPrice / 100000000).toFixed(2)}억원
              </span>
            </div>
            <Slider
              value={[expectedBidPrice]}
              onValueChange={(value) => setExpectedBidPrice(value[0])}
              min={minimumBidPrice}
              max={appraisalPrice}
              step={10000000}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>최저가 {(minimumBidPrice / 100000000).toFixed(1)}억</span>
              <span>감정가 {(appraisalPrice / 100000000).toFixed(1)}억</span>
            </div>
          </div>

          {/* 비용 분석 카드들 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Banknote className="h-4 w-4" />
                <span className="text-xs">입찰가</span>
              </div>
              <p className="text-lg font-bold">{(expectedBidPrice / 100000000).toFixed(2)}억</p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <User className="h-4 w-4" />
                <span className="text-xs">인수할 보증금</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>말소기준권리보다 선순위인 임차인의 보증금은 낙찰자가 인수해야 합니다.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-lg font-bold text-red-600">+{(assumedDeposit / 100000000).toFixed(1)}억</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calculator className="h-4 w-4" />
                <span className="text-xs">취득세 (4.6%)</span>
              </div>
              <p className="text-lg font-bold">+{(acquisitionTax / 10000).toLocaleString()}만</p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Home className="h-4 w-4" />
                <span className="text-xs">기타비용</span>
              </div>
              <p className="text-lg font-bold">+{(otherCosts / 10000).toLocaleString()}만</p>
            </div>
          </div>

          {/* 총 투자비용 */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">실제 총 투자비용</span>
              <span className="text-2xl font-bold text-primary">
                {(totalInvestment / 100000000).toFixed(2)}억원
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              입찰가만 보면 안됩니다! 인수할 보증금과 세금을 포함한 실제 비용을 계산하세요.
            </p>
          </div>

          {/* 예상 수익 */}
          <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-semibold">예상 수익 분석</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">주변 시세 (예상 매도가)</span>
                <span className="font-medium">{(marketPrice / 100000000).toFixed(1)}억원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 투자비용</span>
                <span className="font-medium">-{(totalInvestment / 100000000).toFixed(2)}억원</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-green-500/30">
                <span className="font-semibold">예상 시세차익</span>
                <span className={`font-bold ${expectedProfit > 0 ? "text-green-500" : "text-red-500"}`}>
                  {expectedProfit > 0 ? "+" : ""}
                  {(expectedProfit / 100000000).toFixed(2)}억원 ({expectedROI}%)
                </span>
              </div>
            </div>
          </div>

          {/* AI 추천 입찰가 */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-primary">AI 추천 입찰가</p>
                <p className="text-2xl font-bold mt-1">
                  {(appraisalPrice * 0.82 / 100000000).toFixed(2)}억 ~ {(appraisalPrice * 0.85 / 100000000).toFixed(2)}억원
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  감정가의 82~85% 수준을 추천합니다. 이 가격대에서 낙찰 시
                  인수비용을 포함해도 시세 대비 <strong className="text-green-500">약 10~15%의 수익</strong>이 예상됩니다.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 핵심 체크리스트 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            입찰 전 체크리스트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { checked: true, label: "말소기준권리 확인", detail: "2019.05.20 KB국민은행 근저당권" },
              { checked: true, label: "인수할 권리 확인", detail: "임차보증금 1.2억원 (이OO)" },
              { checked: false, label: "명도 가능성 확인", detail: "임차인 협의 필요" },
              { checked: true, label: "시세 대비 수익성", detail: "예상 수익률 12.3%" },
              { checked: false, label: "현장 답사", detail: "실제 상태 확인 필요" },
            ].map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  item.checked ? "bg-green-500/10" : "bg-yellow-500/10"
                }`}
              >
                {item.checked ? (
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
