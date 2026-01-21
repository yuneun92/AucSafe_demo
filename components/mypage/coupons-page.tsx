"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Ticket,
  Gift,
  Calendar,
  Copy,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react"

interface CouponsPageProps {
  onNavigate?: (page: string) => void
}

// 목업 쿠폰 데이터
const mockCoupons = [
  {
    id: "1",
    code: "WELCOME2026",
    name: "신규 가입 축하 쿠폰",
    description: "프로 요금제 1개월 무료",
    discountType: "free_trial",
    discountValue: 29000,
    minOrderAmount: 0,
    expiryDate: "2026-02-28",
    status: "available",
    usedDate: null,
  },
  {
    id: "2",
    code: "FRIEND20",
    name: "친구 추천 쿠폰",
    description: "첫 구독 20% 할인",
    discountType: "percent",
    discountValue: 20,
    minOrderAmount: 0,
    expiryDate: "2026-03-31",
    status: "available",
    usedDate: null,
  },
  {
    id: "3",
    code: "ADDON5000",
    name: "추가 분석권 쿠폰",
    description: "추가 등기분석 구매 시 5,000원 할인",
    discountType: "fixed",
    discountValue: 5000,
    minOrderAmount: 9900,
    expiryDate: "2026-01-31",
    status: "available",
    usedDate: null,
  },
  {
    id: "4",
    code: "VIP2025",
    name: "VIP 감사 쿠폰",
    description: "프리미엄 요금제 30% 할인",
    discountType: "percent",
    discountValue: 30,
    minOrderAmount: 0,
    expiryDate: "2025-12-31",
    status: "expired",
    usedDate: null,
  },
  {
    id: "5",
    code: "EVENT1215",
    name: "연말 이벤트 쿠폰",
    description: "프로 요금제 1개월 무료",
    discountType: "free_trial",
    discountValue: 29000,
    minOrderAmount: 0,
    expiryDate: "2025-12-31",
    status: "used",
    usedDate: "2025-12-20",
  },
]

export function CouponsPage({ onNavigate }: CouponsPageProps) {
  const [filter, setFilter] = useState("available")
  const [couponCode, setCouponCode] = useState("")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filteredCoupons = mockCoupons.filter((coupon) => {
    if (filter === "available") return coupon.status === "available"
    if (filter === "used") return coupon.status === "used"
    if (filter === "expired") return coupon.status === "expired"
    return true
  })

  const availableCount = mockCoupons.filter((c) => c.status === "available").length

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleRegisterCoupon = () => {
    if (!couponCode.trim()) return
    // 목업: 실제로는 API 호출
    alert(`쿠폰 등록: ${couponCode}`)
    setCouponCode("")
  }

  const getDiscountText = (coupon: typeof mockCoupons[0]) => {
    switch (coupon.discountType) {
      case "free_trial":
        return `${coupon.discountValue.toLocaleString()}원 무료`
      case "percent":
        return `${coupon.discountValue}% 할인`
      case "fixed":
        return `${coupon.discountValue.toLocaleString()}원 할인`
      default:
        return ""
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">사용 가능</Badge>
      case "used":
        return <Badge variant="secondary">사용 완료</Badge>
      case "expired":
        return <Badge variant="destructive">기간 만료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getDaysLeft = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diff = expiry.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            쿠폰함
          </h1>
          <p className="text-muted-foreground mt-1">
            보유 쿠폰을 확인하고 사용하세요
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {availableCount}장 보유
        </Badge>
      </div>

      {/* 쿠폰 등록 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            쿠폰 등록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="쿠폰 코드를 입력하세요"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button onClick={handleRegisterCoupon}>등록</Button>
          </div>
        </CardContent>
      </Card>

      {/* 필터 */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="available">
            사용 가능 ({mockCoupons.filter((c) => c.status === "available").length})
          </TabsTrigger>
          <TabsTrigger value="used">
            사용 완료 ({mockCoupons.filter((c) => c.status === "used").length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            기간 만료 ({mockCoupons.filter((c) => c.status === "expired").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 쿠폰 목록 */}
      <div className="space-y-4">
        {filteredCoupons.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{filter === "available" ? "사용 가능한 쿠폰이 없습니다" :
                  filter === "used" ? "사용한 쿠폰이 없습니다" :
                  "만료된 쿠폰이 없습니다"}</p>
            </CardContent>
          </Card>
        ) : (
          filteredCoupons.map((coupon) => {
            const daysLeft = getDaysLeft(coupon.expiryDate)
            const isExpiringSoon = coupon.status === "available" && daysLeft <= 7 && daysLeft > 0

            return (
              <Card
                key={coupon.id}
                className={`overflow-hidden ${
                  coupon.status !== "available" ? "opacity-60" : ""
                }`}
              >
                <div className="flex">
                  <div className={`w-24 flex flex-col items-center justify-center p-4 ${
                    coupon.status === "available" ? "bg-primary text-primary-foreground" :
                    coupon.status === "used" ? "bg-secondary" : "bg-muted"
                  }`}>
                    <Gift className="h-8 w-8 mb-2" />
                    <p className="text-sm font-bold text-center leading-tight">
                      {getDiscountText(coupon)}
                    </p>
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold">{coupon.name}</p>
                          {getStatusBadge(coupon.status)}
                          {isExpiringSoon && (
                            <Badge variant="outline" className="text-orange-500 border-orange-500">
                              {daysLeft}일 남음
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{coupon.description}</p>
                        {coupon.minOrderAmount > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {coupon.minOrderAmount.toLocaleString()}원 이상 결제 시 사용 가능
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {coupon.status === "used"
                              ? `사용일: ${coupon.usedDate}`
                              : `유효기간: ~${coupon.expiryDate}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-lg">
                          <code className="text-sm font-mono">{coupon.code}</code>
                          {coupon.status === "available" && (
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {copiedCode === coupon.code ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {coupon.status === "available" && (
                          <Button size="sm">사용하기</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* 쿠폰 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p>• 쿠폰은 유효기간 내에만 사용 가능합니다.</p>
              <p>• 이미 사용한 쿠폰은 재사용할 수 없습니다.</p>
              <p>• 일부 쿠폰은 특정 상품/요금제에만 적용됩니다.</p>
              <p>• 쿠폰 관련 문의: support@aucsafe.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
