"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  X,
  Send,
} from "lucide-react"

interface InquiryPageProps {
  onNavigate?: (page: string) => void
}

// 목업 문의 내역 데이터
const mockInquiries = [
  {
    id: "1",
    category: "payment",
    title: "결제 오류 문의드립니다",
    content: "프로 요금제 결제 시 오류가 발생했습니다. 확인 부탁드립니다.",
    status: "answered",
    createdAt: "2026-01-18",
    answeredAt: "2026-01-19",
    answer: "안녕하세요, AucSafe입니다. 문의하신 결제 오류 건은 일시적인 시스템 지연으로 발생한 것으로 확인됩니다. 현재 정상적으로 결제가 완료되어 있습니다. 불편을 드려 죄송합니다.",
  },
  {
    id: "2",
    category: "service",
    title: "등기분석 결과 문의",
    content: "등기분석 결과에서 '말소기준권리'의 의미가 정확히 무엇인가요?",
    status: "answered",
    createdAt: "2026-01-15",
    answeredAt: "2026-01-16",
    answer: "말소기준권리란 경매로 인해 소멸되는 권리와 인수해야 하는 권리의 기준이 되는 권리입니다. 일반적으로 가장 먼저 설정된 (근)저당권이 말소기준권리가 됩니다.",
  },
  {
    id: "3",
    category: "account",
    title: "이메일 변경 요청",
    content: "가입 이메일을 변경하고 싶습니다.",
    status: "pending",
    createdAt: "2026-01-20",
    answeredAt: null,
    answer: null,
  },
]

const categoryOptions = [
  { value: "service", label: "서비스 이용" },
  { value: "auction", label: "경매/공매" },
  { value: "payment", label: "결제/구독" },
  { value: "account", label: "계정/보안" },
  { value: "etc", label: "기타" },
]

export function InquiryPage({ onNavigate }: InquiryPageProps) {
  const [viewMode, setViewMode] = useState<"list" | "write" | "detail">("list")
  const [selectedInquiry, setSelectedInquiry] = useState<typeof mockInquiries[0] | null>(null)
  const [filter, setFilter] = useState("all")

  // 글쓰기 폼
  const [category, setCategory] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [attachments, setAttachments] = useState<string[]>([])

  const filteredInquiries = mockInquiries.filter((inquiry) => {
    if (filter === "all") return true
    return inquiry.status === filter
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 목업: 실제로는 API 호출
    alert("문의가 등록되었습니다.")
    setViewMode("list")
    setCategory("")
    setTitle("")
    setContent("")
    setAttachments([])
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name)
      setAttachments((prev) => [...prev, ...fileNames])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />답변 대기</Badge>
      case "answered":
        return <Badge className="bg-green-500 gap-1"><CheckCircle className="h-3 w-3" />답변 완료</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // 상세 보기
  if (viewMode === "detail" && selectedInquiry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          목록으로
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{categoryOptions.find((c) => c.value === selectedInquiry.category)?.label}</Badge>
              {getStatusBadge(selectedInquiry.status)}
            </div>
            <CardTitle>{selectedInquiry.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{selectedInquiry.createdAt}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="whitespace-pre-wrap">{selectedInquiry.content}</p>
            </div>

            {selectedInquiry.answer && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary">AucSafe</Badge>
                  <span className="text-sm text-muted-foreground">{selectedInquiry.answeredAt}</span>
                </div>
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="whitespace-pre-wrap">{selectedInquiry.answer}</p>
                </div>
              </div>
            )}

            {selectedInquiry.status === "pending" && (
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <p className="text-sm">답변을 준비 중입니다. 빠른 시일 내에 답변 드리겠습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // 글쓰기
  if (viewMode === "write") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="gap-2">
          <ChevronRight className="h-4 w-4 rotate-180" />
          목록으로
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              1:1 문의하기
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>문의 유형 *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="문의 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>제목 *</Label>
                <Input
                  placeholder="문의 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>내용 *</Label>
                <Textarea
                  placeholder="문의 내용을 상세히 입력해주세요"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>첨부파일</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      클릭하여 파일을 첨부하세요
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      최대 10MB, jpg/png/pdf
                    </p>
                  </label>
                </div>
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {attachments.map((file, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {file}
                        <button onClick={() => removeAttachment(i)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full gap-2">
                <Send className="h-4 w-4" />
                문의 등록
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 목록
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            1:1 문의
          </h1>
          <p className="text-muted-foreground mt-1">
            궁금한 점을 문의해주세요
          </p>
        </div>
        <Button onClick={() => setViewMode("write")} className="gap-2">
          <Plus className="h-4 w-4" />
          문의하기
        </Button>
      </div>

      {/* 필터 */}
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">전체 ({mockInquiries.length})</TabsTrigger>
          <TabsTrigger value="pending">답변 대기 ({mockInquiries.filter((i) => i.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="answered">답변 완료 ({mockInquiries.filter((i) => i.status === "answered").length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 문의 목록 */}
      <Card>
        <CardContent className="p-0 divide-y">
          {filteredInquiries.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>문의 내역이 없습니다</p>
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <button
                key={inquiry.id}
                onClick={() => {
                  setSelectedInquiry(inquiry)
                  setViewMode("detail")
                }}
                className="w-full text-left p-4 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {categoryOptions.find((c) => c.value === inquiry.category)?.label}
                      </Badge>
                      {getStatusBadge(inquiry.status)}
                    </div>
                    <p className="font-medium truncate">{inquiry.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{inquiry.content}</p>
                    <p className="text-xs text-muted-foreground mt-2">{inquiry.createdAt}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* 안내 */}
      <Card className="bg-secondary/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p>• 평일 09:00 ~ 18:00 운영 (주말/공휴일 휴무)</p>
          <p>• 문의 접수 후 24시간 이내 답변 드립니다.</p>
          <p>• 긴급 문의: 1544-0000</p>
        </CardContent>
      </Card>
    </div>
  )
}
