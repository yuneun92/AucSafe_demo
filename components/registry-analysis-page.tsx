"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Building,
  User,
  Scale,
  Banknote,
  Calculator,
  TrendingUp,
  Lightbulb,
  Home,
  ArrowLeft,
  Download,
  Share2,
  HelpCircle,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RegistryAnalysisPageProps {
  fileName?: string
  onBack: () => void
  onFindSimilar: () => void
}

// 등기부등본 분석 결과 목업 데이터
const mockRegistryData = {
  summary: {
    propertyType: "아파트",
    address: "서울시 강남구 역삼동 123-45 OO아파트 102동 1502호",
    area: "84.52㎡ (전용면적)",
    owner: "김OO",
    ownershipDate: "2018.03.15",
  },
  safetyScore: 72,
  riskLevel: "주의" as "안전" | "주의" | "위험",

  // 갑구 (소유권 관련)
  gapSection: [
    {
      seq: 1,
      date: "2018.03.15",
      type: "소유권이전",
      holder: "김OO",
      detail: "매매",
      status: "유효",
      risk: "safe" as const,
    },
    {
      seq: 2,
      date: "2023.11.05",
      type: "가압류",
      holder: "서울중앙지방법원",
      detail: "청구금액 50,000,000원",
      status: "유효 (낙찰 시 말소)",
      risk: "warning" as const,
    },
  ],

  // 을구 (소유권 외)
  eulSection: [
    {
      seq: 1,
      date: "2019.05.20",
      type: "근저당권설정",
      holder: "KB국민은행",
      detail: "채권최고액 360,000,000원",
      status: "유효 (말소기준권리)",
      risk: "baseline" as const,
    },
    {
      seq: 2,
      date: "2022.08.10",
      type: "전세권설정",
      holder: "이OO",
      detail: "전세금 200,000,000원",
      status: "유효 (낙찰 시 말소)",
      risk: "warning" as const,
    },
  ],

  // 임차인 현황
  tenants: [
    {
      name: "박OO",
      moveInDate: "2019.03.10",
      deposit: 120000000,
      hasConfirmDate: true,
      confirmDate: "2019.03.12",
      status: "대항력 있음 (선순위)",
      willBeAssumed: true,
      explanation: "말소기준권리(2019.05.20)보다 전입일이 빠르므로 대항력이 있습니다. 낙찰자가 보증금을 인수해야 합니다.",
    },
  ],

  // 말소기준권리 정보
  baselineRight: {
    date: "2019.05.20",
    type: "근저당권",
    holder: "KB국민은행",
    explanation: "이 권리를 기준으로 그 이후에 설정된 권리들은 낙찰 시 모두 말소됩니다. 그 이전에 설정된 권리(임차권 등)는 낙찰자가 인수해야 할 수 있습니다.",
  },

  // 예상 비용
  estimatedCosts: {
    appraisalPrice: 850000000,
    minimumBid: 595000000,
    marketPrice: 920000000,
  },

  // 위험 요소 요약
  risks: [
    {
      level: "high",
      title: "선순위 임차인 존재",
      description: "보증금 1.2억원을 인수해야 합니다",
      solution: "낙찰가에 인수금액을 더해 실제 투자비용을 계산하세요",
    },
    {
      level: "medium",
      title: "가압류 등기",
      description: "5천만원 가압류가 있으나 낙찰 시 말소됩니다",
      solution: "말소되므로 큰 문제 없음",
    },
  ],

  // 안전 요소
  safePoints: [
    "소유자 단독 명의로 권리관계 단순",
    "유치권 신고 없음",
    "법정지상권 해당 없음",
    "근저당권 외 복잡한 담보권 없음",
  ],
}

export function RegistryAnalysisPage({ fileName, onBack, onFindSimilar }: RegistryAnalysisPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [expandedSections, setExpandedSections] = useState<string[]>(["baseline"])
  const [expectedBidPrice, setExpectedBidPrice] = useState(mockRegistryData.estimatedCosts.minimumBid)

  // 로딩 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setIsLoading(false), 300)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  // 비용 계산
  const assumedDeposit = 120000000
  const acquisitionTax = Math.round(expectedBidPrice * 0.046)
  const otherCosts = 5000000
  const totalInvestment = expectedBidPrice + assumedDeposit + acquisitionTax + otherCosts
  const expectedProfit = mockRegistryData.estimatedCosts.marketPrice - totalInvestment
  const expectedROI = ((expectedProfit / totalInvestment) * 100).toFixed(1)

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">등기부등본 분석 중</h2>
              <p className="text-sm text-muted-foreground">{fileName || "document.pdf"}</p>
            </div>
            <div className="space-y-2">
              <Progress value={loadingProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {loadingProgress < 30 && "문서 구조 파악 중..."}
                {loadingProgress >= 30 && loadingProgress < 60 && "권리관계 분석 중..."}
                {loadingProgress >= 60 && loadingProgress < 90 && "위험 요소 검토 중..."}
                {loadingProgress >= 90 && "분석 완료!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      {/* Header */}
      <div className="sticky top-[64px] z-20 bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-bold text-lg">등기부등본 분석 결과</h1>
                <p className="text-sm text-muted-foreground">{fileName || "document.pdf"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                리포트 저장
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* 안전점수 & 요약 */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* 안전점수 카드 */}
          <Card className={`${
            mockRegistryData.riskLevel === "안전"
              ? "border-green-500/50 bg-green-500/5"
              : mockRegistryData.riskLevel === "주의"
                ? "border-yellow-500/50 bg-yellow-500/5"
                : "border-red-500/50 bg-red-500/5"
          }`}>
            <CardContent className="p-6 text-center">
              <div className="relative inline-flex items-center justify-center w-28 h-28 mb-4">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                  <circle
                    cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8"
                    className={
                      mockRegistryData.safetyScore >= 80 ? "text-green-500"
                      : mockRegistryData.safetyScore >= 60 ? "text-yellow-500"
                      : "text-red-500"
                    }
                    strokeDasharray={`${mockRegistryData.safetyScore * 3.02} 302`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-bold">{mockRegistryData.safetyScore}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <Badge className={`text-sm px-4 py-1 ${
                mockRegistryData.riskLevel === "안전" ? "bg-green-500"
                : mockRegistryData.riskLevel === "주의" ? "bg-yellow-500"
                : "bg-red-500"
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {mockRegistryData.riskLevel}
              </Badge>
              <p className="text-sm text-muted-foreground mt-3">
                권리관계에 주의가 필요한 물건입니다
              </p>
            </CardContent>
          </Card>

          {/* 물건 정보 */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                물건 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">물건 종류</p>
                  <p className="font-medium">{mockRegistryData.summary.propertyType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">면적</p>
                  <p className="font-medium">{mockRegistryData.summary.area}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">주소</p>
                  <p className="font-medium">{mockRegistryData.summary.address}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">소유자</p>
                  <p className="font-medium">{mockRegistryData.summary.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">소유권 취득일</p>
                  <p className="font-medium">{mockRegistryData.summary.ownershipDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 핵심 체크포인트 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              핵심 체크포인트
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 위험 요소 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  주의해야 할 점
                </h4>
                {mockRegistryData.risks.map((risk, i) => (
                  <div key={i} className={`p-3 rounded-lg ${
                    risk.level === "high" ? "bg-red-500/10 border border-red-500/20" : "bg-yellow-500/10 border border-yellow-500/20"
                  }`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${risk.level === "high" ? "text-red-500" : "text-yellow-500"}`} />
                      <div>
                        <p className="font-medium text-sm">{risk.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{risk.description}</p>
                        <p className="text-xs mt-2 text-primary">💡 {risk.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 안전 요소 */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  안전한 점
                </h4>
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <ul className="space-y-2">
                    {mockRegistryData.safePoints.map((point, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 말소기준권리 설명 */}
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader
            className="cursor-pointer"
            onClick={() => toggleSection("baseline")}
          >
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                말소기준권리란?
                <Badge variant="outline" className="ml-2">중요</Badge>
              </div>
              {expandedSections.includes("baseline") ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </CardTitle>
          </CardHeader>
          {expandedSections.includes("baseline") && (
            <CardContent className="pt-0 space-y-4">
              <div className="p-4 rounded-lg bg-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-primary/20 shrink-0">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">
                      {mockRegistryData.baselineRight.date} {mockRegistryData.baselineRight.holder} {mockRegistryData.baselineRight.type}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {mockRegistryData.baselineRight.explanation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-sm">말소기준권리 이후</p>
                  <p className="text-xs text-muted-foreground mt-1">낙찰 시 자동 말소</p>
                </div>
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                  <p className="font-medium text-sm">말소기준권리 이전</p>
                  <p className="text-xs text-muted-foreground mt-1">낙찰자가 인수</p>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 등기부 상세 분석 */}
        <Tabs defaultValue="gap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gap">갑구 (소유권)</TabsTrigger>
            <TabsTrigger value="eul">을구 (담보권)</TabsTrigger>
            <TabsTrigger value="tenant">임차인 현황</TabsTrigger>
          </TabsList>

          <TabsContent value="gap" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">갑</span>
                  갑구 - 소유권에 관한 사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRegistryData.gapSection.map((item) => (
                  <div
                    key={item.seq}
                    className={`p-4 rounded-lg border ${
                      item.risk === "safe" ? "border-green-500/30 bg-green-500/5"
                      : item.risk === "warning" ? "border-yellow-500/30 bg-yellow-500/5"
                      : "border-red-500/30 bg-red-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {item.risk === "safe" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{item.date}</Badge>
                            <span className="font-medium">{item.type}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.holder}</p>
                          <p className="text-sm mt-1">{item.detail}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="eul" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-500 text-white text-xs flex items-center justify-center font-bold">을</span>
                  을구 - 소유권 외의 권리에 관한 사항
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRegistryData.eulSection.map((item) => (
                  <div
                    key={item.seq}
                    className={`p-4 rounded-lg border ${
                      item.risk === "baseline" ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : item.risk === "safe" ? "border-green-500/30 bg-green-500/5"
                      : "border-yellow-500/30 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {item.risk === "baseline" ? (
                          <Scale className="w-5 h-5 text-primary mt-0.5" />
                        ) : item.risk === "safe" ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">{item.date}</Badge>
                            <span className="font-medium">{item.type}</span>
                            {item.risk === "baseline" && (
                              <Badge className="bg-primary text-xs">말소기준권리</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{item.holder}</p>
                          <p className="text-sm mt-1">{item.detail}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tenant" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  임차인 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRegistryData.tenants.map((tenant, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      tenant.willBeAssumed
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-green-500/30 bg-green-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {tenant.willBeAssumed ? (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{tenant.name}</span>
                          <Badge variant={tenant.willBeAssumed ? "destructive" : "default"}>
                            {tenant.willBeAssumed ? "인수" : "말소"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">전입일</p>
                            <p className="font-medium">{tenant.moveInDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">보증금</p>
                            <p className="font-medium text-red-600">
                              {(tenant.deposit / 100000000).toFixed(1)}억원
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">확정일자</p>
                            <p className="font-medium">
                              {tenant.hasConfirmDate ? tenant.confirmDate : "없음"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">대항력</p>
                            <p className="font-medium">{tenant.status}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 rounded bg-card border border-border">
                          <p className="text-sm text-muted-foreground">
                            <Info className="w-4 h-4 inline mr-1" />
                            {tenant.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 예상 비용 계산기 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              실제 투자비용 계산
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                min={mockRegistryData.estimatedCosts.minimumBid}
                max={mockRegistryData.estimatedCosts.appraisalPrice}
                step={10000000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>최저가 {(mockRegistryData.estimatedCosts.minimumBid / 100000000).toFixed(1)}억</span>
                <span>감정가 {(mockRegistryData.estimatedCosts.appraisalPrice / 100000000).toFixed(1)}억</span>
              </div>
            </div>

            {/* 비용 항목 */}
            <div className="grid md:grid-cols-4 gap-3">
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

            {/* 총 비용 & 수익 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">실제 총 투자비용</span>
                  <span className="text-2xl font-bold text-primary">
                    {(totalInvestment / 100000000).toFixed(2)}억원
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  입찰가 + 인수보증금 + 세금 + 기타비용
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                expectedProfit > 0
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">예상 시세차익</span>
                  <span className={`text-2xl font-bold ${expectedProfit > 0 ? "text-green-500" : "text-red-500"}`}>
                    {expectedProfit > 0 ? "+" : ""}{(expectedProfit / 100000000).toFixed(2)}억원
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  시세 {(mockRegistryData.estimatedCosts.marketPrice / 100000000).toFixed(1)}억 기준, 수익률 {expectedROI}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI 추천 */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20 shrink-0">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">AI 종합 의견</h3>
                <p className="text-muted-foreground leading-relaxed">
                  이 물건은 <strong className="text-foreground">선순위 임차인(보증금 1.2억)</strong>이 있어
                  실제 투자비용이 입찰가보다 높습니다. 하지만 권리관계가 비교적 단순하고,
                  시세 대비 저렴한 가격으로 낙찰받을 수 있다면 투자 가치가 있습니다.
                </p>
                <div className="mt-4 p-4 rounded-lg bg-card">
                  <p className="text-sm font-semibold mb-2">추천 입찰가</p>
                  <p className="text-2xl font-bold text-primary">
                    {((mockRegistryData.estimatedCosts.appraisalPrice * 0.7) / 100000000).toFixed(1)}억 ~ {((mockRegistryData.estimatedCosts.appraisalPrice * 0.75) / 100000000).toFixed(1)}억원
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (감정가의 70~75%, 인수비용 고려 시 적정 수익률 확보)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 하단 CTA */}
        <div className="flex gap-4">
          <Button variant="outline" className="flex-1" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            다른 등기부 분석하기
          </Button>
          <Button className="flex-1" onClick={onFindSimilar}>
            <TrendingUp className="w-4 h-4 mr-2" />
            비슷한 매물 찾아보기
          </Button>
        </div>
      </div>
    </div>
  )
}
