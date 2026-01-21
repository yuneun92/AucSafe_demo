"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  Search,
  Zap,
  Target,
  Users,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react"

interface ServiceIntroPageProps {
  onNavigate: (page: string) => void
}

export function ServiceIntroPage({ onNavigate }: ServiceIntroPageProps) {
  const features = [
    {
      icon: FileText,
      title: "등기부등본 자동 분석",
      description: "복잡한 권리관계를 AI가 쉬운 말로 해석해드립니다. 근저당, 전세권, 가압류 등 모든 권리를 한눈에 파악하세요.",
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      icon: Shield,
      title: "위험 매물 필터링",
      description: "법정지상권, 유치권, 지분경매 등 초보자가 피해야 할 위험 요소를 미리 알려드립니다.",
      color: "bg-red-500/10 text-red-500",
    },
    {
      icon: Zap,
      title: "적정 입찰가 추천",
      description: "감정가 대비 시세, 인수비용까지 고려한 실제 투자비용을 계산해드립니다.",
      color: "bg-yellow-500/10 text-yellow-500",
    },
    {
      icon: MessageSquare,
      title: "AI 챗봇 상담",
      description: "경매에 관한 모든 궁금증을 AI가 24시간 답변해드립니다. 조건에 맞는 매물도 추천받으세요.",
      color: "bg-purple-500/10 text-purple-500",
    },
    {
      icon: Search,
      title: "통합 검색",
      description: "경매, 공매, NPL 물건을 한곳에서 검색하세요. 지역, 가격, 물건종류별 맞춤 필터를 제공합니다.",
      color: "bg-green-500/10 text-green-500",
    },
    {
      icon: Target,
      title: "AI 매물 추천",
      description: "투자 성향과 예산에 맞는 매물을 AI가 자동으로 추천해드립니다.",
      color: "bg-orange-500/10 text-orange-500",
    },
  ]

  const stats = [
    { value: "100,000+", label: "분석된 매물", icon: FileText },
    { value: "50,000+", label: "회원 수", icon: Users },
    { value: "98%", label: "고객 만족도", icon: Award },
    { value: "24/7", label: "AI 상담", icon: Clock },
  ]

  const steps = [
    {
      step: 1,
      title: "매물 검색",
      description: "원하는 조건의 경매 물건을 검색하세요",
    },
    {
      step: 2,
      title: "AI 분석 확인",
      description: "등기부등본 분석 결과와 위험도를 확인하세요",
    },
    {
      step: 3,
      title: "입찰가 산정",
      description: "적정 입찰가와 예상 수익률을 계산하세요",
    },
    {
      step: 4,
      title: "입찰 참여",
      description: "준비된 정보로 자신있게 입찰에 참여하세요",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <Badge variant="secondary" className="px-4 py-1.5">
          부동산 경매의 새로운 기준
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          AI와 함께하는 <span className="text-primary">안전한 경매 투자</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          AucSafe는 AI 기술로 등기부등본을 분석하고, 위험 요소를 사전에 파악하여
          안전한 경매 투자를 도와드립니다.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg" onClick={() => onNavigate("register")}>
            무료로 시작하기
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => onNavigate("search")}>
            매물 둘러보기
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Features Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">주요 기능</h2>
          <p className="text-muted-foreground mt-2">
            경매 투자에 필요한 모든 기능을 제공합니다
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-6 space-y-4">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">이용 방법</h2>
          <p className="text-muted-foreground mt-2">
            간단한 4단계로 경매 투자를 시작하세요
          </p>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto text-xl font-bold">
                {step.step}
              </div>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-border -z-10" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">요금제</h2>
          <p className="text-muted-foreground mt-2">
            필요한 기능만 선택하세요
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">무료</h3>
              <p className="text-3xl font-bold">0원<span className="text-sm font-normal text-muted-foreground">/월</span></p>
              <ul className="space-y-2">
                {["기본 매물 검색", "월 3건 등기분석", "AI 챗봇 상담"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">현재 이용 중</Button>
            </CardContent>
          </Card>
          <Card className="border-primary">
            <CardContent className="p-6 space-y-4">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">인기</Badge>
              <h3 className="font-semibold text-lg">프로</h3>
              <p className="text-3xl font-bold">29,000원<span className="text-sm font-normal text-muted-foreground">/월</span></p>
              <ul className="space-y-2">
                {["무제한 매물 검색", "무제한 등기분석", "AI 추천 매물", "알림 서비스"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button className="w-full">시작하기</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold text-lg">프리미엄</h3>
              <p className="text-3xl font-bold">59,000원<span className="text-sm font-normal text-muted-foreground">/월</span></p>
              <ul className="space-y-2">
                {["프로의 모든 기능", "전문가 1:1 상담", "독점 매물 알림", "투자 리포트"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full">문의하기</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 px-6 rounded-2xl bg-primary/5 border">
        <h2 className="text-2xl font-bold mb-4">지금 바로 시작하세요</h2>
        <p className="text-muted-foreground mb-6">
          무료 회원가입으로 AI 경매 분석 서비스를 체험해보세요
        </p>
        <Button size="lg" onClick={() => onNavigate("register")}>
          무료 회원가입
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>
    </div>
  )
}
