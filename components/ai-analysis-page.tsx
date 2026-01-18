"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, CheckCircle, FileText, MapPin, BarChart3, Lightbulb, Sparkles } from "lucide-react"
import { auctionProperties } from "@/lib/mock-data"

export function AIAnalysisPage() {
  const [selectedProperty, setSelectedProperty] = useState(auctionProperties[0])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(true)

  const handleAnalyze = () => {
    setAnalyzing(true)
    setAnalysisComplete(false)
    setTimeout(() => {
      setAnalyzing(false)
      setAnalysisComplete(true)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI 종합 분석
          </h1>
          <p className="text-muted-foreground mt-1">등기부등본, 권리분석, 시세 분석을 AI가 종합적으로 분석합니다</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing}>
          <Sparkles className="h-4 w-4 mr-2" />
          {analyzing ? "분석 중..." : "새로 분석하기"}
        </Button>
      </div>

      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">분석 대상 매물 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {auctionProperties.slice(0, 6).map((property) => (
              <button
                key={property.id}
                onClick={() => setSelectedProperty(property)}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedProperty.id === property.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">{property.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">{property.caseNumber}</p>
                  </div>
                  <Badge
                    variant={
                      property.riskScore >= 80 ? "default" : property.riskScore >= 60 ? "secondary" : "destructive"
                    }
                  >
                    {property.riskScore}점
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="registry" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="registry">등기부 분석</TabsTrigger>
                <TabsTrigger value="rights">권리 분석</TabsTrigger>
                <TabsTrigger value="market">시세 분석</TabsTrigger>
              </TabsList>

              <TabsContent value="registry" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      등기부등본 AI 분석
                    </CardTitle>
                    <CardDescription>소유권, 근저당, 가압류 등 권리관계를 분석합니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 갑구 분석 */}
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          갑
                        </span>
                        갑구 (소유권 관련)
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm">소유자: 김OO (단독 소유)</p>
                            <p className="text-xs text-muted-foreground">2018.03.15 등기</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm">가압류: 서울중앙지방법원 2024카단12345</p>
                            <p className="text-xs text-muted-foreground">청구금액 5,000만원 - 낙찰 시 말소 예정</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 을구 분석 */}
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-chart-2 text-background text-xs flex items-center justify-center">
                          을
                        </span>
                        을구 (소유권 외)
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div>
                            <p className="text-sm">근저당권: KB국민은행</p>
                            <p className="text-xs text-muted-foreground">
                              채권최고액 3억 6,000만원 - 낙찰 시 말소 예정
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          <div>
                            <p className="text-sm">전세권: 없음</p>
                            <p className="text-xs text-muted-foreground">인수해야 할 권리 없음</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rights" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      권리분석 리포트
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 말소기준권리 */}
                    <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <h4 className="font-medium">말소기준권리</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        2019.05.20 KB국민은행 근저당권 설정이 말소기준권리입니다. 이후 설정된 모든 권리는 낙찰 시
                        말소됩니다.
                      </p>
                    </div>

                    {/* 인수되는 권리 */}
                    <div className="p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <h4 className="font-medium">인수 가능 권리</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>임차인 보증금 (대항력 있음)</span>
                          <span className="font-medium">1억 2,000만원</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          2019.03.10 전입신고, 확정일자 있음. 말소기준권리보다 선순위로 인수해야 함.
                        </p>
                      </div>
                    </div>

                    {/* 예상 총 비용 */}
                    <div className="p-4 rounded-lg bg-secondary">
                      <h4 className="font-medium mb-3">예상 총 투자비용</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>예상 낙찰가 (감정가 80%)</span>
                          <span>{(selectedProperty.appraisalPrice * 0.8).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>인수할 임차보증금</span>
                          <span>120,000,000원</span>
                        </div>
                        <div className="flex justify-between">
                          <span>취득세 (약 4.6%)</span>
                          <span>{Math.round(selectedProperty.appraisalPrice * 0.8 * 0.046).toLocaleString()}원</span>
                        </div>
                        <div className="flex justify-between font-medium pt-2 border-t">
                          <span>총 예상 비용</span>
                          <span className="text-primary">
                            {(
                              selectedProperty.appraisalPrice * 0.8 +
                              120000000 +
                              Math.round(selectedProperty.appraisalPrice * 0.8 * 0.046)
                            ).toLocaleString()}
                            원
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="market" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      시세 및 수익성 분석
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 시세 비교 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-sm text-muted-foreground">감정가</p>
                        <p className="text-xl font-bold">{selectedProperty.appraisalPrice.toLocaleString()}원</p>
                      </div>
                      <div className="p-4 rounded-lg bg-secondary">
                        <p className="text-sm text-muted-foreground">주변 실거래가 평균</p>
                        <p className="text-xl font-bold">
                          {Math.round(selectedProperty.appraisalPrice * 1.1).toLocaleString()}원
                        </p>
                        <p className="text-xs text-green-500">감정가 대비 +10%</p>
                      </div>
                    </div>

                    {/* 수익률 분석 */}
                    <div className="p-4 rounded-lg border">
                      <h4 className="font-medium mb-3">예상 수익률 (낙찰가 80% 기준)</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>시세 대비 수익률</span>
                            <span className="text-green-500">+37.5%</span>
                          </div>
                          <Progress value={75} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>월세 수익률 (연)</span>
                            <span>5.2%</span>
                          </div>
                          <Progress value={52} className="h-2" />
                        </div>
                      </div>
                    </div>

                    {/* 주변 시세 */}
                    <div className="p-4 rounded-lg bg-secondary/50">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        주변 최근 실거래
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-border">
                          <span>래미안강남힐스 84㎡ (2024.11)</span>
                          <span className="font-medium">12.8억</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                          <span>아크로리버파크 84㎡ (2024.10)</span>
                          <span className="font-medium">13.2억</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>반포자이 84㎡ (2024.10)</span>
                          <span className="font-medium">12.5억</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* AI Summary Sidebar */}
          <div className="space-y-6">
            {/* AI 종합 점수 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI 종합 평가
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-secondary"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-primary"
                        strokeDasharray={`${selectedProperty.riskScore * 2.51} 251`}
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold">{selectedProperty.riskScore}</span>
                  </div>
                  <p className="mt-2 font-medium">
                    {selectedProperty.riskScore >= 80
                      ? "투자 추천"
                      : selectedProperty.riskScore >= 60
                        ? "검토 필요"
                        : "주의 필요"}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>권리 안전성</span>
                    <span className="font-medium">85점</span>
                  </div>
                  <Progress value={85} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>수익성</span>
                    <span className="font-medium">78점</span>
                  </div>
                  <Progress value={78} className="h-2" />

                  <div className="flex justify-between text-sm">
                    <span>입지</span>
                    <span className="font-medium">92점</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* AI 추천 코멘트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  AI 추천 의견
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    <strong>장점:</strong> 강남권 역세권 입지, 시세 대비 저렴한 감정가, 말소되는 권리가 대부분이라
                    권리관계 안전
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    <strong>주의:</strong> 선순위 임차인 보증금 1.2억 인수 필요, 경쟁률 높을 것으로 예상
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm">
                    <strong>추천 입찰가:</strong> 감정가의 82~85% 수준인
                    <span className="font-bold text-primary ml-1">
                      {Math.round(selectedProperty.appraisalPrice * 0.82).toLocaleString()}원 ~{" "}
                      {Math.round(selectedProperty.appraisalPrice * 0.85).toLocaleString()}원
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
