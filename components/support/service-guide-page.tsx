"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  BookOpen,
  Search,
  FileText,
  MessageSquare,
  Bell,
  Heart,
  TrendingUp,
  Shield,
  ArrowRight,
  Play,
  ChevronRight,
} from "lucide-react"

interface ServiceGuidePageProps {
  onNavigate?: (page: string) => void
}

export function ServiceGuidePage({ onNavigate }: ServiceGuidePageProps) {
  const guides = [
    {
      id: "search",
      title: "매물 검색하기",
      icon: Search,
      description: "경매, 공매, NPL 물건을 검색하는 방법",
      steps: [
        "홈 화면 또는 상단 메뉴에서 '매물 검색'을 클릭합니다.",
        "검색창에 주소, 사건번호, 지역명을 입력합니다.",
        "필터를 사용하여 가격, 물건종류, 지역 등을 설정합니다.",
        "목록 또는 지도 뷰로 매물을 확인합니다.",
        "관심있는 매물을 클릭하여 상세 정보를 확인합니다.",
      ],
    },
    {
      id: "analysis",
      title: "등기부등본 분석하기",
      icon: FileText,
      description: "AI로 등기부등본을 분석하는 방법",
      steps: [
        "홈 화면의 주소 검색창에 분석할 부동산 주소를 입력합니다.",
        "또는 '등기분석' 메뉴에서 PDF 파일을 직접 업로드합니다.",
        "AI가 자동으로 권리관계를 분석합니다.",
        "말소기준권리, 인수/소멸 권리, 위험 요소를 확인합니다.",
        "분석 결과를 저장하거나 공유할 수 있습니다.",
      ],
    },
    {
      id: "chat",
      title: "AI 챗봇 이용하기",
      icon: MessageSquare,
      description: "AI에게 경매 관련 질문하기",
      steps: [
        "화면 하단의 채팅 아이콘을 클릭합니다.",
        "원하는 조건이나 질문을 자연어로 입력합니다.",
        "예: '강남 5억 이하 아파트 추천해줘'",
        "AI가 조건에 맞는 매물을 추천하거나 질문에 답변합니다.",
        "추천된 매물을 클릭하여 상세 정보를 확인합니다.",
      ],
    },
    {
      id: "favorites",
      title: "관심 물건 관리하기",
      icon: Heart,
      description: "관심있는 매물을 저장하고 알림받기",
      steps: [
        "매물 상세 페이지에서 하트 아이콘을 클릭합니다.",
        "'관심물건' 메뉴에서 저장된 매물을 확인합니다.",
        "경매일, 가격 변동 시 알림을 받을 수 있습니다.",
        "알림 설정은 '프로필 > 알림 설정'에서 관리합니다.",
        "더 이상 관심없는 매물은 하트를 다시 클릭하여 해제합니다.",
      ],
    },
    {
      id: "notifications",
      title: "알림 설정하기",
      icon: Bell,
      description: "맞춤 알림을 설정하는 방법",
      steps: [
        "'프로필 > 알림 설정' 메뉴로 이동합니다.",
        "관심 물건 경매일 알림, 가격 변동 알림 등을 설정합니다.",
        "조건에 맞는 신규 매물 알림을 설정할 수 있습니다.",
        "이메일/푸시 알림 수신 여부를 선택합니다.",
        "알림 시간(경매 1일 전, 7일 전 등)을 설정합니다.",
      ],
    },
    {
      id: "bid",
      title: "입찰가 계산하기",
      icon: TrendingUp,
      description: "적정 입찰가를 계산하는 방법",
      steps: [
        "매물 상세 페이지에서 '입찰가 계산기'를 클릭합니다.",
        "감정가, 시세, 인수해야 할 권리금액을 확인합니다.",
        "예상 수리비, 세금 등 추가 비용을 입력합니다.",
        "목표 수익률을 설정합니다.",
        "AI가 계산한 적정 입찰가 범위를 확인합니다.",
      ],
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          서비스 이용 안내
        </h1>
        <p className="text-muted-foreground mt-1">
          AucSafe를 200% 활용하는 방법을 알아보세요
        </p>
      </div>

      {/* 빠른 시작 가이드 */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">처음 오셨나요?</h2>
              <p className="text-muted-foreground mt-1">
                3분만에 AucSafe 시작하기 가이드를 확인해보세요
              </p>
            </div>
            <Button>
              시작 가이드 보기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 주요 기능 가이드 */}
      <Tabs defaultValue="search" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          {guides.map((guide) => (
            <TabsTrigger key={guide.id} value={guide.id} className="gap-2">
              <guide.icon className="h-4 w-4" />
              {guide.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {guides.map((guide) => (
          <TabsContent key={guide.id} value={guide.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <guide.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{guide.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {guide.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p>{step}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* 추가 자료 */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">경매 입문 가이드</h3>
              <p className="text-sm text-muted-foreground">
                경매 초보자를 위한 기초 지식
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">권리분석 가이드</h3>
              <p className="text-sm text-muted-foreground">
                등기부등본 읽는 법과 권리분석
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">입찰 전략 가이드</h3>
              <p className="text-sm text-muted-foreground">
                성공적인 입찰을 위한 전략
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">자주 묻는 질문</h3>
              <p className="text-sm text-muted-foreground">
                FAQ에서 빠르게 답을 찾으세요
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* 문의 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium">추가 도움이 필요하신가요?</p>
            <p className="text-sm text-muted-foreground">
              1:1 문의 또는 고객센터(1544-0000)로 연락주세요
            </p>
          </div>
          <Button variant="outline" onClick={() => onNavigate?.("inquiry")}>
            1:1 문의
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
