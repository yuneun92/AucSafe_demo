"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  MapPin,
  Clock,
  Banknote,
  ExternalLink,
} from "lucide-react"

interface PublicSaleCalendarPageProps {
  onNavigate?: (page: string) => void
  onSelectProperty?: (id: string) => void
}

// 목업 공매 일정 데이터
const mockPublicSaleSchedule = [
  {
    id: "ps1",
    date: "2026-01-22",
    title: "서울 강남구 역삼동 상가",
    location: "서울 강남구 역삼동 123-45",
    source: "온비드",
    appraisalPrice: 850000000,
    minimumBid: 680000000,
    bidStartTime: "10:00",
    bidEndTime: "16:00",
    propertyType: "상가",
  },
  {
    id: "ps2",
    date: "2026-01-22",
    title: "경기 수원시 팔달구 토지",
    location: "경기 수원시 팔달구 456-78",
    source: "캠코",
    appraisalPrice: 320000000,
    minimumBid: 256000000,
    bidStartTime: "10:00",
    bidEndTime: "16:00",
    propertyType: "토지",
  },
  {
    id: "ps3",
    date: "2026-01-24",
    title: "부산 해운대구 아파트",
    location: "부산 해운대구 우동 789-12",
    source: "온비드",
    appraisalPrice: 520000000,
    minimumBid: 416000000,
    bidStartTime: "10:00",
    bidEndTime: "16:00",
    propertyType: "아파트",
  },
  {
    id: "ps4",
    date: "2026-01-27",
    title: "대전 유성구 공장",
    location: "대전 유성구 봉명동 234-56",
    source: "국세청",
    appraisalPrice: 1200000000,
    minimumBid: 840000000,
    bidStartTime: "10:00",
    bidEndTime: "17:00",
    propertyType: "공장",
  },
  {
    id: "ps5",
    date: "2026-01-28",
    title: "인천 연수구 오피스텔",
    location: "인천 연수구 송도동 567-89",
    source: "지자체",
    appraisalPrice: 280000000,
    minimumBid: 224000000,
    bidStartTime: "09:00",
    bidEndTime: "15:00",
    propertyType: "오피스텔",
  },
]

const sourceColors: Record<string, string> = {
  "온비드": "bg-blue-500",
  "캠코": "bg-green-500",
  "국세청": "bg-orange-500",
  "지자체": "bg-purple-500",
}

export function PublicSaleCalendarPage({ onNavigate, onSelectProperty }: PublicSaleCalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1)) // 2026년 1월
  const [selectedDate, setSelectedDate] = useState<string | null>("2026-01-22")
  const [sourceFilter, setSourceFilter] = useState("all")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // 달력 데이터 생성
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = []

  // 이전 달
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    const prevMonth = month === 0 ? 12 : month
    const prevYear = month === 0 ? year - 1 : year
    calendarDays.push({
      day,
      isCurrentMonth: false,
      dateStr: `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    })
  }

  // 현재 달
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
    })
  }

  // 다음 달 (6주 채우기)
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonth = month === 11 ? 1 : month + 2
    const nextYear = month === 11 ? year + 1 : year
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      dateStr: `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`,
    })
  }

  // 날짜별 공매 건수 계산
  const getSaleCountForDate = (dateStr: string) => {
    return mockPublicSaleSchedule.filter((sale) => {
      if (sourceFilter !== "all" && sale.source !== sourceFilter) return false
      return sale.date === dateStr
    }).length
  }

  // 선택된 날짜의 공매 목록
  const selectedDateSales = selectedDate
    ? mockPublicSaleSchedule.filter((sale) => {
        if (sourceFilter !== "all" && sale.source !== sourceFilter) return false
        return sale.date === selectedDate
      })
    : []

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1))
  }

  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만`
  }

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            공매 일정
          </h1>
          <p className="text-muted-foreground mt-1">
            공매 입찰 일정을 캘린더로 확인하세요
          </p>
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="출처 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="온비드">온비드</SelectItem>
            <SelectItem value="캠코">캠코</SelectItem>
            <SelectItem value="국세청">국세청</SelectItem>
            <SelectItem value="지자체">지자체</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 캘린더 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-lg">
                {year}년 {month + 1}월
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayInfo, i) => {
                const saleCount = getSaleCountForDate(dayInfo.dateStr)
                const isSelected = selectedDate === dayInfo.dateStr
                const isToday = dayInfo.dateStr === "2026-01-21"
                const dayOfWeek = i % 7

                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDate(dayInfo.dateStr)}
                    className={`
                      aspect-square p-1 rounded-lg text-sm relative transition-colors
                      ${!dayInfo.isCurrentMonth ? "text-muted-foreground/50" : ""}
                      ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}
                      ${isToday && !isSelected ? "ring-2 ring-primary" : ""}
                      ${dayOfWeek === 0 && dayInfo.isCurrentMonth ? "text-red-500" : ""}
                      ${dayOfWeek === 6 && dayInfo.isCurrentMonth ? "text-blue-500" : ""}
                      ${isSelected ? "text-primary-foreground" : ""}
                    `}
                  >
                    <span className="block">{dayInfo.day}</span>
                    {saleCount > 0 && (
                      <span
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 text-xs px-1.5 rounded-full ${
                          isSelected ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {saleCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 범례 */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">출처별:</span>
              {Object.entries(sourceColors).map(([source, color]) => (
                <div key={source} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-xs">{source}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 선택된 날짜 공매 목록 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {selectedDate ? (
                <>
                  {selectedDate.split("-")[1]}월 {selectedDate.split("-")[2]}일 공매
                  <Badge variant="secondary" className="ml-2">
                    {selectedDateSales.length}건
                  </Badge>
                </>
              ) : (
                "날짜를 선택하세요"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {selectedDateSales.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>해당 날짜에 공매 일정이 없습니다</p>
              </div>
            ) : (
              selectedDateSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-3 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => onSelectProperty?.(sale.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={sourceColors[sale.source]}>
                      {sale.source}
                    </Badge>
                    <Badge variant="outline">{sale.propertyType}</Badge>
                  </div>
                  <h4 className="font-medium text-sm mb-2">{sale.title}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{sale.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{sale.bidStartTime} ~ {sale.bidEndTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      <span>최저가 {formatPrice(sale.minimumBid)}</span>
                    </div>
                  </div>
                  <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-xs">
                    상세보기 <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 이번 주 공매 요약 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            이번 주 공매 일정
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {["온비드", "캠코", "국세청", "지자체"].map((source) => {
              const count = mockPublicSaleSchedule.filter((s) => s.source === source).length
              return (
                <div key={source} className="p-4 rounded-lg bg-secondary/50 text-center">
                  <Badge className={`${sourceColors[source]} mb-2`}>{source}</Badge>
                  <p className="text-2xl font-bold">{count}건</p>
                  <p className="text-xs text-muted-foreground">예정 공매</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
