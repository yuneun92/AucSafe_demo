"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  ChevronRight,
  Bell,
  Megaphone,
  Wrench,
  Gift,
  Calendar,
  Eye,
} from "lucide-react"

interface NoticesPageProps {
  onSelectNotice?: (noticeId: string) => void
}

// 목업 공지사항 데이터
const mockNotices = [
  {
    id: "1",
    type: "notice",
    title: "[공지] 2026년 1월 시스템 정기점검 안내",
    content: "서비스 품질 향상을 위해 2026년 1월 25일(토) 02:00 ~ 06:00 시스템 정기점검이 예정되어 있습니다.",
    date: "2026-01-20",
    views: 1234,
    isImportant: true,
  },
  {
    id: "2",
    type: "update",
    title: "[업데이트] AI 등기분석 기능 개선",
    content: "AI 등기분석 기능이 업데이트되었습니다. 이제 더 정확한 권리분석 결과를 제공합니다.",
    date: "2026-01-18",
    views: 892,
    isImportant: true,
  },
  {
    id: "3",
    type: "event",
    title: "[이벤트] 신규 가입 시 프로 요금제 1개월 무료!",
    content: "2026년 1월 한달간 신규 가입 시 프로 요금제를 1개월 무료로 이용하실 수 있습니다.",
    date: "2026-01-15",
    views: 2341,
    isImportant: false,
  },
  {
    id: "4",
    type: "notice",
    title: "[공지] 개인정보처리방침 변경 안내",
    content: "개인정보처리방침이 2026년 2월 1일부로 변경됩니다. 주요 변경 사항을 확인해주세요.",
    date: "2026-01-12",
    views: 567,
    isImportant: false,
  },
  {
    id: "5",
    type: "update",
    title: "[업데이트] 모바일 앱 v2.0 출시",
    content: "더욱 편리해진 모바일 앱 v2.0이 출시되었습니다. 새로운 기능들을 확인해보세요.",
    date: "2026-01-10",
    views: 1567,
    isImportant: false,
  },
  {
    id: "6",
    type: "notice",
    title: "[공지] 2025년 4분기 서비스 이용 통계",
    content: "2025년 4분기 서비스 이용 현황을 공유드립니다.",
    date: "2026-01-05",
    views: 432,
    isImportant: false,
  },
  {
    id: "7",
    type: "event",
    title: "[이벤트] 친구 추천 이벤트",
    content: "친구를 추천하고 프로 요금제 할인 쿠폰을 받으세요!",
    date: "2026-01-03",
    views: 1890,
    isImportant: false,
  },
  {
    id: "8",
    type: "update",
    title: "[업데이트] 지도 검색 기능 개선",
    content: "지도에서 더 빠르고 정확하게 매물을 검색할 수 있습니다.",
    date: "2025-12-28",
    views: 723,
    isImportant: false,
  },
]

const noticeTypeConfig = {
  notice: { label: "공지", icon: Megaphone, color: "bg-blue-500" },
  update: { label: "업데이트", icon: Wrench, color: "bg-green-500" },
  event: { label: "이벤트", icon: Gift, color: "bg-orange-500" },
}

export function NoticesPage({ onSelectNotice }: NoticesPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedNotice, setSelectedNotice] = useState<typeof mockNotices[0] | null>(null)

  const filteredNotices = mockNotices.filter((notice) => {
    const matchesSearch = notice.title.includes(searchQuery) || notice.content.includes(searchQuery)
    const matchesType = selectedType === "all" || notice.type === selectedType
    return matchesSearch && matchesType
  })

  const handleNoticeClick = (notice: typeof mockNotices[0]) => {
    setSelectedNotice(notice)
    onSelectNotice?.(notice.id)
  }

  if (selectedNotice) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => setSelectedNotice(null)} className="gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          목록으로 돌아가기
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={noticeTypeConfig[selectedNotice.type as keyof typeof noticeTypeConfig].color}>
                {noticeTypeConfig[selectedNotice.type as keyof typeof noticeTypeConfig].label}
              </Badge>
              {selectedNotice.isImportant && <Badge variant="destructive">중요</Badge>}
            </div>
            <CardTitle className="text-xl">{selectedNotice.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {selectedNotice.date}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                조회 {selectedNotice.views.toLocaleString()}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p>{selectedNotice.content}</p>
              <br />
              <p>안녕하세요, AucSafe입니다.</p>
              <br />
              <p>
                {selectedNotice.content} 자세한 내용은 아래를 참고해주세요.
              </p>
              <br />
              <h3>주요 내용</h3>
              <ul>
                <li>첫 번째 항목에 대한 설명입니다.</li>
                <li>두 번째 항목에 대한 설명입니다.</li>
                <li>세 번째 항목에 대한 설명입니다.</li>
              </ul>
              <br />
              <p>
                궁금한 점이 있으시면 고객센터로 문의해주세요.
              </p>
              <br />
              <p>감사합니다.</p>
              <p>AucSafe 드림</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            공지사항
          </h1>
          <p className="text-muted-foreground mt-1">
            AucSafe의 새로운 소식을 확인하세요
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="공지사항 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList>
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="notice">공지</TabsTrigger>
            <TabsTrigger value="update">업데이트</TabsTrigger>
            <TabsTrigger value="event">이벤트</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 중요 공지 */}
      {filteredNotices.filter(n => n.isImportant).length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="h-5 w-5 text-primary" />
              <span className="font-semibold text-primary">중요 공지</span>
            </div>
            <div className="space-y-2">
              {filteredNotices.filter(n => n.isImportant).map((notice) => (
                <button
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice)}
                  className="w-full text-left flex items-center justify-between p-2 rounded hover:bg-primary/10 transition-colors"
                >
                  <span className="font-medium truncate">{notice.title}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">{notice.date}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 공지사항 목록 */}
      <Card>
        <CardContent className="p-0 divide-y">
          {filteredNotices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              검색 결과가 없습니다
            </div>
          ) : (
            filteredNotices.map((notice) => {
              const typeConfig = noticeTypeConfig[notice.type as keyof typeof noticeTypeConfig]
              return (
                <button
                  key={notice.id}
                  onClick={() => handleNoticeClick(notice)}
                  className="w-full text-left p-4 hover:bg-secondary/50 transition-colors flex items-start gap-4"
                >
                  <div className={`w-10 h-10 rounded-lg ${typeConfig.color} flex items-center justify-center shrink-0`}>
                    <typeConfig.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        {typeConfig.label}
                      </Badge>
                      {notice.isImportant && (
                        <Badge variant="destructive" className="text-xs">중요</Badge>
                      )}
                    </div>
                    <p className="font-medium truncate">{notice.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{notice.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{notice.date}</span>
                      <span>조회 {notice.views.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </button>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* 페이지네이션 - 목업 */}
      <div className="flex justify-center gap-1">
        <Button variant="outline" size="sm" disabled>이전</Button>
        <Button variant="default" size="sm">1</Button>
        <Button variant="outline" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">다음</Button>
      </div>
    </div>
  )
}
