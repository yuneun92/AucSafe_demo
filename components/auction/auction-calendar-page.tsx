"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  MapPin,
  Building2,
} from "lucide-react"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"

interface AuctionCalendarPageProps {
  onSelectProperty: (property: AuctionProperty) => void
}

// 달력 데이터 생성
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay()
}

export function AuctionCalendarPage({ onSelectProperty }: AuctionCalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [region, setRegion] = useState("all")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const monthNames = [
    "1월", "2월", "3월", "4월", "5월", "6월",
    "7월", "8월", "9월", "10월", "11월", "12월"
  ]
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

  // 목업: 날짜별 경매 건수
  const getAuctionCount = (day: number) => {
    // 임의의 패턴으로 경매 건수 반환
    const seed = day + month * 31
    if (seed % 7 === 0) return 0
    return Math.floor(Math.random() * 15) + 1
  }

  // 목업: 선택된 날짜의 경매 물건
  const getAuctionsForDate = (date: Date) => {
    return auctionProperties.slice(0, 5)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
    setSelectedDate(null)
  }

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(year, month, day))
  }

  const renderCalendar = () => {
    const days = []

    // 빈 칸 (이전 달)
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-muted/20" />)
    }

    // 날짜 칸
    for (let day = 1; day <= daysInMonth; day++) {
      const count = getAuctionCount(day)
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-24 p-2 text-left border-t transition-colors ${
            isSelected ? "bg-primary/10 border-primary" : "hover:bg-secondary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium ${isToday ? "text-primary" : ""}`}>
              {day}
              {isToday && <span className="ml-1 text-xs text-primary">오늘</span>}
            </span>
          </div>
          {count > 0 && (
            <div className="mt-1">
              <Badge variant={count >= 10 ? "default" : "secondary"} className="text-xs">
                {count}건
              </Badge>
            </div>
          )}
        </button>
      )
    }

    return days
  }

  const selectedAuctions = selectedDate ? getAuctionsForDate(selectedDate) : []

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            경매 일정
          </h1>
          <p className="text-muted-foreground mt-1">
            날짜별 경매 일정을 확인하세요
          </p>
        </div>
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="지역" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 지역</SelectItem>
            <SelectItem value="서울">서울</SelectItem>
            <SelectItem value="경기">경기</SelectItem>
            <SelectItem value="인천">인천</SelectItem>
            <SelectItem value="부산">부산</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* 캘린더 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className="text-xl">
                {year}년 {monthNames[month]}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-sm font-medium py-2 ${
                    i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : ""
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            {/* 날짜 그리드 */}
            <div className="grid grid-cols-7 border-l border-b">
              {renderCalendar()}
            </div>
            {/* 범례 */}
            <div className="flex items-center justify-end gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">1-9건</Badge>
                <span className="text-muted-foreground">일반</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge>10건+</Badge>
                <span className="text-muted-foreground">다건</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 선택된 날짜의 경매 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? (
                <>
                  {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 경매 물건
                </>
              ) : (
                "날짜를 선택하세요"
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedAuctions.length > 0 ? (
                <div className="space-y-3">
                  {selectedAuctions.map((property) => (
                    <button
                      key={property.id}
                      onClick={() => onSelectProperty(property)}
                      className="w-full text-left p-3 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {property.propertyType}
                        </Badge>
                        <span className="font-bold text-primary">
                          {(property.minimumBidPrice / 100000000).toFixed(1)}억
                        </span>
                      </div>
                      <p className="font-medium text-sm truncate">
                        {property.address || property.title}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{property.location}</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {property.caseNumber}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>해당 날짜에 예정된 경매가 없습니다</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>캘린더에서 날짜를 선택하면</p>
                <p>경매 물건을 확인할 수 있습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
