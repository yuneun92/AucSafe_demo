"use client"

import { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Upload,
  FileText,
  Sparkles,
  ArrowRight,
  Building2,
  MessageSquare,
  TrendingUp,
  Shield,
  Search,
  ChevronRight,
  CheckCircle,
  Zap,
  Target,
  X,
  Loader2,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface LandingPageProps {
  onNavigate: (tab: string) => void
  onSelectProperty: (property: AuctionProperty) => void
  onStartChat: (message: string) => void
  onFileUpload: (fileName: string) => void
}

export function LandingPage({ onNavigate, onSelectProperty, onStartChat, onFileUpload }: LandingPageProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [chatInput, setChatInput] = useState("")

  const topRecommended = auctionProperties.filter((p) => p.riskScore >= 80).slice(0, 3)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // 바로 분석 결과 페이지로 이동
    onFileUpload(file.name)
  }

  const clearFile = () => {
    setUploadedFile(null)
    setIsAnalyzing(false)
    setAnalysisComplete(false)
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      onStartChat(chatInput)
      setChatInput("")
    }
  }

  const quickQuestions = [
    "5억 이하 서울 아파트 추천해줘",
    "초보자가 피해야 할 경매 물건은?",
    "수익률 좋은 오피스텔 찾아줘",
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="px-3 md:px-4 py-8 md:py-12 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
          {/* 헤드라인 */}
          <div className="text-center space-y-3 md:space-y-4">
            <Badge variant="secondary" className="px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm">
              <Sparkles className="w-3 h-3 mr-1" />
              AI 기반 경매 분석
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              경매, <span className="text-primary">어렵지 않아요</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              복잡한 등기부등본, AI가 쉽게 해석해드려요.
              <br className="hidden md:block" />
              <span className="md:hidden"> </span>
              권리관계부터 적정 입찰가까지 한눈에 파악하세요.
            </p>
          </div>

          {/* 메인 액션 카드들 */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            {/* 등기부등본 업로드 */}
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div
                  className={`relative p-5 md:p-8 transition-colors ${
                    dragActive
                      ? "bg-primary/10 border-2 border-dashed border-primary"
                      : "bg-card"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {!uploadedFile ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">등기부등본 분석</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF나 이미지를 올리면 AI가 권리관계를 분석해요
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="file-upload">
                          <Button variant="default" className="cursor-pointer" asChild>
                            <span>
                              <FileText className="w-4 h-4 mr-2" />
                              파일 선택하기
                            </span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileInput}
                        />
                        <p className="text-xs text-muted-foreground">
                          또는 여기로 파일을 끌어다 놓으세요
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{uploadedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={clearFile}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {isAnalyzing && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/5">
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                          <div>
                            <p className="font-medium text-sm">AI가 분석 중입니다...</p>
                            <p className="text-xs text-muted-foreground">
                              권리관계를 파악하고 있어요
                            </p>
                          </div>
                        </div>
                      )}

                      {analysisComplete && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="w-5 h-5" />
                            <span className="font-medium">분석 완료!</span>
                          </div>
                          <Button className="w-full" onClick={() => onNavigate("analysis")}>
                            분석 결과 보기
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI 챗봇 */}
            <Card>
              <CardContent className="p-5 md:p-8 space-y-4">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-violet-500/20 to-primary/20 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI에게 물어보기</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    원하는 조건을 말씀하시면 맞춤 매물을 찾아드려요
                  </p>
                </div>
                <form onSubmit={handleChatSubmit} className="space-y-3">
                  <div className="relative">
                    <Input
                      placeholder="예: 강남 5억 이하 아파트 찾아줘"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 md:flex-wrap md:overflow-visible">
                    {quickQuestions.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onStartChat(q)}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* 빠른 액션 */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" className="md:h-10 md:px-4" onClick={() => onNavigate("search")}>
              <Search className="w-4 h-4 mr-2" />
              매물 검색하기
            </Button>
            <Button variant="outline" size="sm" className="md:h-10 md:px-4" onClick={() => onNavigate("dashboard")}>
              <TrendingUp className="w-4 h-4 mr-2" />
              시장 동향 보기
            </Button>
          </div>
        </div>
      </div>

      {/* AI 추천 매물 섹션 */}
      <div className="border-t bg-card/50 px-3 md:px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                AI 추천 매물
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                권리관계가 안전하고 수익성 높은 매물만 선별했어요
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("search")}>
              전체 보기
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {topRecommended.map((property) => (
              <Card
                key={property.id}
                className="cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
                onClick={() => onSelectProperty(property)}
              >
                <div className="relative h-32">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge
                    className="absolute top-2 left-2 bg-green-500"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    안전 {property.riskScore}점
                  </Badge>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold">
                      {(property.minimumBidPrice / 100000000).toFixed(1)}억
                    </p>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{property.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{property.location}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {property.propertyType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {property.auctionDate}
                    </span>
                  </div>
                  {/* 추천 이유 */}
                  <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/10">
                    <p className="text-xs text-primary">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      권리 깨끗 · 시세대비 30% 저렴 · 유찰 {property.failedCount}회
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 서비스 특징 */}
      <div className="px-3 md:px-4 py-8 md:py-12 border-t">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: FileText,
                title: "등기부 자동 해석",
                description: "복잡한 권리관계를 AI가 쉬운 말로 설명해드려요",
              },
              {
                icon: Zap,
                title: "적정가 추천",
                description: "인수비용까지 고려한 실제 투자비용을 계산해드려요",
              },
              {
                icon: Shield,
                title: "위험 매물 필터링",
                description: "초보자가 피해야 할 위험 요소를 미리 알려드려요",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
