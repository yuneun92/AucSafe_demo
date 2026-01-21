"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  Search,
  Banknote,
  Building2,
  MapPin,
  Calendar,
  Heart,
  ArrowUpDown,
  Plus,
  MessageSquare,
  User,
  Phone,
  Mail,
  ChevronRight,
  Shield,
  Clock,
} from "lucide-react"

interface NplExchangePageProps {
  onSelectNpl?: (nplId: string) => void
}

// 목업 NPL 거래소 데이터
const mockListings = [
  {
    id: "1",
    type: "sell",
    title: "강남구 역삼동 아파트 담보 NPL 매각",
    collateralType: "아파트",
    location: "서울 강남구",
    loanAmount: 500000000,
    askingPrice: 400000000,
    seller: "A투자",
    isVerified: true,
    createdAt: "2026-01-20",
    views: 234,
    inquiries: 12,
  },
  {
    id: "2",
    type: "buy",
    title: "서울/경기 아파트 담보 NPL 매입 희망",
    collateralType: "아파트",
    location: "서울, 경기",
    loanAmount: null,
    budget: 1000000000,
    buyer: "B캐피탈",
    isVerified: true,
    createdAt: "2026-01-19",
    views: 156,
    inquiries: 8,
  },
  {
    id: "3",
    type: "sell",
    title: "부산 해운대 상가 NPL 급매",
    collateralType: "상가",
    location: "부산 해운대구",
    loanAmount: 620000000,
    askingPrice: 480000000,
    seller: "C자산운용",
    isVerified: false,
    createdAt: "2026-01-18",
    views: 189,
    inquiries: 5,
  },
  {
    id: "4",
    type: "sell",
    title: "경기 용인시 토지 담보 NPL",
    collateralType: "토지",
    location: "경기 용인시",
    loanAmount: 180000000,
    askingPrice: 130000000,
    seller: "D금융",
    isVerified: true,
    createdAt: "2026-01-17",
    views: 98,
    inquiries: 3,
  },
  {
    id: "5",
    type: "buy",
    title: "전국 상가 NPL 대량 매입",
    collateralType: "상가",
    location: "전국",
    loanAmount: null,
    budget: 5000000000,
    buyer: "E리츠",
    isVerified: true,
    createdAt: "2026-01-16",
    views: 312,
    inquiries: 25,
  },
]

export function NplExchangePage({ onSelectNpl }: NplExchangePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [listingType, setListingType] = useState("all")
  const [collateralType, setCollateralType] = useState("all")
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState<typeof mockListings[0] | null>(null)

  const filteredListings = mockListings.filter((listing) => {
    const matchesSearch = listing.title.includes(searchQuery)
    const matchesType = listingType === "all" || listing.type === listingType
    const matchesCollateral = collateralType === "all" || listing.collateralType === collateralType
    return matchesSearch && matchesType && matchesCollateral
  })

  const handleInquiry = (listing: typeof mockListings[0]) => {
    setSelectedListing(listing)
    setShowInquiryModal(true)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ArrowUpDown className="h-6 w-6 text-primary" />
            NPL 거래소
          </h1>
          <p className="text-muted-foreground mt-1">
            NPL 매매 정보를 공유하고 거래하세요
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              매물 등록
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>NPL 매물 등록</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>등록 유형</Label>
                <Select defaultValue="sell">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sell">매도 (팝니다)</SelectItem>
                    <SelectItem value="buy">매수 (삽니다)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>제목</Label>
                <Input placeholder="매물 제목을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>담보 종류</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="아파트">아파트</SelectItem>
                      <SelectItem value="오피스텔">오피스텔</SelectItem>
                      <SelectItem value="상가">상가</SelectItem>
                      <SelectItem value="토지">토지</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>지역</Label>
                  <Input placeholder="예: 서울 강남구" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>채권액 (원)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>희망 거래가 (원)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>상세 설명</Label>
                <Textarea placeholder="담보물건 정보, 채권 현황 등을 입력하세요" rows={4} />
              </div>
              <div className="space-y-2">
                <Label>연락처</Label>
                <Input placeholder="연락 가능한 전화번호" />
              </div>
              <Button className="w-full">등록하기</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{mockListings.filter((l) => l.type === "sell").length}</p>
            <p className="text-sm text-muted-foreground">매도 매물</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-500">{mockListings.filter((l) => l.type === "buy").length}</p>
            <p className="text-sm text-muted-foreground">매수 희망</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{mockListings.reduce((acc, l) => acc + l.views, 0)}</p>
            <p className="text-sm text-muted-foreground">총 조회수</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{mockListings.reduce((acc, l) => acc + l.inquiries, 0)}</p>
            <p className="text-sm text-muted-foreground">총 문의</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="제목으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={listingType} onValueChange={setListingType}>
              <TabsList>
                <TabsTrigger value="all">전체</TabsTrigger>
                <TabsTrigger value="sell">매도</TabsTrigger>
                <TabsTrigger value="buy">매수</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={collateralType} onValueChange={setCollateralType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="담보종류" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="아파트">아파트</SelectItem>
                <SelectItem value="오피스텔">오피스텔</SelectItem>
                <SelectItem value="상가">상가</SelectItem>
                <SelectItem value="토지">토지</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 리스팅 목록 */}
      <div className="space-y-4">
        {filteredListings.map((listing) => (
          <Card
            key={listing.id}
            className="hover:border-primary/50 transition-colors"
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center shrink-0 ${
                  listing.type === "sell" ? "bg-blue-500/10" : "bg-green-500/10"
                }`}>
                  {listing.type === "sell" ? (
                    <Banknote className="h-8 w-8 text-blue-500" />
                  ) : (
                    <Building2 className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={listing.type === "sell" ? "default" : "secondary"}>
                      {listing.type === "sell" ? "매도" : "매수"}
                    </Badge>
                    <Badge variant="outline">{listing.collateralType}</Badge>
                    {listing.isVerified && (
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        인증
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium">{listing.title}</p>

                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {listing.location}
                    </span>
                    {listing.type === "sell" ? (
                      <>
                        <span>채권액: {(listing.loanAmount! / 100000000).toFixed(1)}억</span>
                        <span className="text-primary font-bold">
                          희망가: {(listing.askingPrice! / 100000000).toFixed(1)}억
                        </span>
                      </>
                    ) : (
                      <span className="text-green-500 font-bold">
                        예산: {(listing.budget! / 100000000).toFixed(0)}억
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {listing.type === "sell" ? listing.seller : listing.buyer}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {listing.createdAt}
                    </span>
                    <span>조회 {listing.views}</span>
                    <span>문의 {listing.inquiries}</span>
                  </div>
                </div>
                <Button variant="outline" onClick={() => handleInquiry(listing)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  문의하기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Banknote className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>검색 결과가 없습니다</p>
          </CardContent>
        </Card>
      )}

      {/* 문의 모달 */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>문의하기</DialogTitle>
          </DialogHeader>
          {selectedListing && (
            <div className="space-y-4 pt-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="font-medium">{selectedListing.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedListing.type === "sell" ? selectedListing.seller : selectedListing.buyer}
                </p>
              </div>
              <div className="space-y-2">
                <Label>이름</Label>
                <Input placeholder="이름을 입력하세요" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>연락처</Label>
                  <Input placeholder="010-0000-0000" />
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <Input type="email" placeholder="example@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>문의 내용</Label>
                <Textarea placeholder="문의하실 내용을 입력하세요" rows={4} />
              </div>
              <Button className="w-full" onClick={() => setShowInquiryModal(false)}>
                문의 보내기
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 페이지네이션 */}
      <div className="flex justify-center gap-1">
        <Button variant="outline" size="sm" disabled>이전</Button>
        <Button variant="default" size="sm">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">다음</Button>
      </div>
    </div>
  )
}
