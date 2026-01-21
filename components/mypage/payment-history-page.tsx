"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Receipt,
  Calendar,
  Download,
  ChevronRight,
  Crown,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"

interface PaymentHistoryPageProps {
  onNavigate?: (page: string) => void
}

// 목업 결제 내역 데이터
const mockPayments = [
  {
    id: "1",
    type: "subscription",
    planName: "프로 요금제",
    amount: 29000,
    status: "completed",
    paymentMethod: "신한카드 ****1234",
    paymentDate: "2026-01-15",
    period: "2026-01-15 ~ 2026-02-14",
    receiptUrl: "#",
  },
  {
    id: "2",
    type: "subscription",
    planName: "프로 요금제",
    amount: 29000,
    status: "completed",
    paymentMethod: "신한카드 ****1234",
    paymentDate: "2025-12-15",
    period: "2025-12-15 ~ 2026-01-14",
    receiptUrl: "#",
  },
  {
    id: "3",
    type: "addon",
    planName: "추가 등기분석 10건",
    amount: 9900,
    status: "completed",
    paymentMethod: "카카오페이",
    paymentDate: "2025-12-10",
    receiptUrl: "#",
  },
  {
    id: "4",
    type: "subscription",
    planName: "프로 요금제",
    amount: 29000,
    status: "completed",
    paymentMethod: "신한카드 ****1234",
    paymentDate: "2025-11-15",
    period: "2025-11-15 ~ 2025-12-14",
    receiptUrl: "#",
  },
  {
    id: "5",
    type: "subscription",
    planName: "프리미엄 요금제",
    amount: 0,
    status: "refunded",
    paymentMethod: "신한카드 ****1234",
    paymentDate: "2025-10-15",
    period: "2025-10-15 ~ 2025-11-14",
    refundDate: "2025-10-20",
    refundAmount: 59000,
  },
]

// 현재 구독 정보
const currentSubscription = {
  planName: "프로 요금제",
  price: 29000,
  startDate: "2026-01-15",
  nextBillingDate: "2026-02-15",
  paymentMethod: "신한카드 ****1234",
  features: ["무제한 매물 검색", "무제한 등기분석", "AI 추천 매물", "알림 서비스"],
}

export function PaymentHistoryPage({ onNavigate }: PaymentHistoryPageProps) {
  const [filter, setFilter] = useState("all")

  const filteredPayments = mockPayments.filter((payment) => {
    if (filter === "all") return true
    return payment.type === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">결제 완료</Badge>
      case "pending":
        return <Badge variant="secondary">처리 중</Badge>
      case "refunded":
        return <Badge variant="destructive">환불 완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6 text-primary" />
          결제 내역
        </h1>
        <p className="text-muted-foreground mt-1">
          결제 및 구독 관리
        </p>
      </div>

      {/* 현재 구독 */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            현재 구독 중
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xl font-bold">{currentSubscription.planName}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {currentSubscription.price.toLocaleString()}원<span className="text-sm font-normal text-muted-foreground">/월</span>
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {currentSubscription.features.map((feature, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right space-y-2">
              <p className="text-sm text-muted-foreground">
                다음 결제일: <span className="font-medium text-foreground">{currentSubscription.nextBillingDate}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                결제 수단: {currentSubscription.paymentMethod}
              </p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  요금제 변경
                </Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  구독 해지
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결제 수단 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            결제 수단
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">신한카드</p>
                <p className="text-sm text-muted-foreground">**** **** **** 1234</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">기본</Badge>
              <Button variant="ghost" size="sm">변경</Button>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4">
            <CreditCard className="h-4 w-4 mr-2" />
            결제 수단 추가
          </Button>
        </CardContent>
      </Card>

      {/* 결제 내역 필터 */}
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="subscription">구독</TabsTrigger>
            <TabsTrigger value="addon">추가 구매</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 결제 내역 목록 */}
      <Card>
        <CardContent className="p-0 divide-y">
          {filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              결제 내역이 없습니다
            </div>
          ) : (
            filteredPayments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      payment.status === "completed" ? "bg-green-500/10" :
                      payment.status === "refunded" ? "bg-red-500/10" : "bg-yellow-500/10"
                    }`}>
                      {payment.status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : payment.status === "refunded" ? (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{payment.planName}</p>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {payment.paymentMethod}
                      </p>
                      {payment.period && (
                        <p className="text-xs text-muted-foreground mt-1">
                          이용 기간: {payment.period}
                        </p>
                      )}
                      {payment.refundDate && (
                        <p className="text-xs text-destructive mt-1">
                          환불일: {payment.refundDate} (환불액: {payment.refundAmount?.toLocaleString()}원)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {payment.status === "refunded" ? "-" : ""}{payment.amount.toLocaleString()}원
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payment.paymentDate}
                    </p>
                    {payment.receiptUrl && payment.status !== "refunded" && (
                      <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs">
                        <Download className="h-3 w-3" />
                        영수증
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 결제 관련 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>• 구독 결제는 매월 시작일 기준으로 자동 결제됩니다.</p>
          <p>• 구독 해지 시 남은 기간 동안은 서비스를 계속 이용할 수 있습니다.</p>
          <p>• 결제 관련 문의: support@aucsafe.com</p>
        </CardContent>
      </Card>
    </div>
  )
}
