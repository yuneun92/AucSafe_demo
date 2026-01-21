"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  HelpCircle,
  MessageSquare,
  CreditCard,
  Shield,
  FileText,
  Settings,
  ChevronRight,
} from "lucide-react"

interface FaqPageProps {
  onNavigate?: (page: string) => void
}

// FAQ 카테고리 및 데이터
const faqCategories = [
  { id: "all", name: "전체", icon: HelpCircle },
  { id: "service", name: "서비스 이용", icon: Settings },
  { id: "auction", name: "경매/공매", icon: FileText },
  { id: "payment", name: "결제/구독", icon: CreditCard },
  { id: "account", name: "계정/보안", icon: Shield },
]

const faqData = [
  {
    id: "1",
    category: "service",
    question: "AucSafe는 어떤 서비스인가요?",
    answer: "AucSafe는 AI 기반 부동산 경매 분석 플랫폼입니다. 등기부등본을 자동으로 분석하여 권리관계를 쉽게 파악하고, 적정 입찰가를 추천받을 수 있습니다. 경매, 공매, NPL 물건을 통합 검색하고 관심 물건 알림도 받으실 수 있습니다.",
  },
  {
    id: "2",
    category: "service",
    question: "등기부등본 분석은 어떻게 하나요?",
    answer: "홈 화면에서 주소를 검색하거나 등기부등본 PDF 파일을 업로드하시면 됩니다. AI가 자동으로 권리관계를 분석하여 인수해야 할 권리, 말소되는 권리, 위험 요소 등을 쉽게 설명해 드립니다.",
  },
  {
    id: "3",
    category: "service",
    question: "AI 추천 매물은 어떤 기준으로 선정되나요?",
    answer: "AI는 안전점수(권리관계 복잡도), 수익성(시세 대비 낙찰가율), 입지(교통, 학군 등), 유찰 횟수 등을 종합적으로 분석하여 매물을 추천합니다. 회원님의 투자 성향과 예산을 설정하시면 더 맞춤화된 추천을 받으실 수 있습니다.",
  },
  {
    id: "4",
    category: "auction",
    question: "경매와 공매의 차이점은 무엇인가요?",
    answer: "경매는 법원을 통해 진행되는 강제 매각 절차이고, 공매는 한국자산관리공사(캠코) 등 공공기관을 통해 진행됩니다. 경매는 대법원 경매정보 사이트에서, 공매는 온비드에서 확인할 수 있습니다. AucSafe에서는 두 가지 모두 통합 검색이 가능합니다.",
  },
  {
    id: "5",
    category: "auction",
    question: "특수물건(지분경매, 유치권 등)은 피해야 하나요?",
    answer: "특수물건은 일반 물건보다 복잡한 권리관계가 있어 주의가 필요합니다. 하지만 이해하고 접근하면 더 좋은 기회가 될 수 있습니다. AucSafe의 AI가 각 특수물건의 위험 요소와 주의사항을 상세히 안내해 드립니다. 초보자분들은 전문가 상담 후 투자하시는 것을 권장합니다.",
  },
  {
    id: "6",
    category: "auction",
    question: "낙찰 후 절차는 어떻게 되나요?",
    answer: "낙찰 후에는 1) 잔금 납부(보통 1개월 이내), 2) 소유권 이전 등기, 3) 명도(점유자 퇴거)의 절차가 있습니다. AucSafe에서는 낙찰 후 가이드를 제공하며, 필요시 전문가 연결 서비스도 이용하실 수 있습니다.",
  },
  {
    id: "7",
    category: "payment",
    question: "요금제는 어떤 것들이 있나요?",
    answer: "무료, 프로(29,000원/월), 프리미엄(59,000원/월) 세 가지 요금제가 있습니다. 무료 요금제에서는 기본 검색과 월 3건의 등기분석이 가능하고, 프로 요금제부터 무제한 등기분석과 AI 추천이 제공됩니다. 자세한 내용은 서비스 소개 페이지를 참고해 주세요.",
  },
  {
    id: "8",
    category: "payment",
    question: "구독을 해지하려면 어떻게 하나요?",
    answer: "마이페이지 > 결제 내역에서 '구독 해지' 버튼을 클릭하시면 됩니다. 해지 후에도 결제 기간 종료일까지는 서비스를 이용하실 수 있습니다. 재구독은 언제든지 가능합니다.",
  },
  {
    id: "9",
    category: "payment",
    question: "환불 정책은 어떻게 되나요?",
    answer: "구독 결제 후 7일 이내에 서비스를 이용하지 않으셨다면 전액 환불이 가능합니다. 부분 환불은 이용 일수에 따라 계산됩니다. 환불 요청은 고객센터 1:1 문의를 통해 접수해 주세요.",
  },
  {
    id: "10",
    category: "account",
    question: "비밀번호를 잊어버렸어요.",
    answer: "로그인 페이지에서 '비밀번호 찾기'를 클릭하시고, 가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다. 이메일을 받지 못하셨다면 스팸함을 확인해 주세요.",
  },
  {
    id: "11",
    category: "account",
    question: "회원 탈퇴는 어떻게 하나요?",
    answer: "마이페이지 > 내 정보 수정 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 개인정보와 이용 기록이 삭제되며, 유료 구독 중인 경우 먼저 해지하셔야 합니다.",
  },
  {
    id: "12",
    category: "account",
    question: "개인정보는 안전하게 보호되나요?",
    answer: "네, AucSafe는 개인정보보호법에 따라 회원님의 정보를 안전하게 관리합니다. 모든 데이터는 암호화되어 저장되며, 제3자에게 제공되지 않습니다. 자세한 내용은 개인정보처리방침을 참고해 주세요.",
  },
]

export function FaqPage({ onNavigate }: FaqPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredFaqs = faqData.filter((faq) => {
    const matchesSearch = faq.question.includes(searchQuery) || faq.answer.includes(searchQuery)
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          자주 묻는 질문 (FAQ)
        </h1>
        <p className="text-muted-foreground mt-1">
          궁금한 점을 빠르게 해결하세요
        </p>
      </div>

      {/* 검색 */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="질문을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 카테고리 */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {faqCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="gap-2">
              <category.icon className="h-4 w-4" />
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* FAQ 목록 */}
      {filteredFaqs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
            <p className="text-sm mt-2">다른 키워드로 검색해보세요</p>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-2">
          {filteredFaqs.map((faq) => {
            const category = faqCategories.find((c) => c.id === faq.category)
            return (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start gap-3 text-left">
                    <Badge variant="secondary" className="shrink-0 mt-0.5">
                      {category?.name}
                    </Badge>
                    <span className="font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-0">
                  <p className="text-muted-foreground leading-relaxed pl-[72px]">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}

      {/* 추가 문의 안내 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="font-semibold">원하시는 답변을 찾지 못하셨나요?</p>
              <p className="text-sm text-muted-foreground mt-1">
                1:1 문의를 통해 전문 상담원에게 직접 질문하실 수 있습니다
              </p>
            </div>
            <Button onClick={() => onNavigate?.("inquiry")}>
              1:1 문의하기
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
