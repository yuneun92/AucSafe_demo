"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  User,
  Settings,
  CreditCard,
  Shield,
  LogOut,
  Edit,
  Building2,
  Target,
  TrendingUp,
  MapPin,
  Wallet,
  Crown,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Lock,
} from "lucide-react"
import { useTheme } from "next-themes"

const investmentHistory = [
  { id: 1, property: "역삼동 OO아파트", result: "낙찰", price: "8.75억", date: "2024-12-15", profit: "+12%" },
  { id: 2, property: "마포구 OO오피스텔", result: "유찰", price: "-", date: "2024-11-20", profit: "-" },
  { id: 3, property: "송파구 OO빌라", result: "낙찰", price: "3.2억", date: "2024-10-08", profit: "+8%" },
]

export function ProfilePage() {
  const { theme, setTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    name: "김투자",
    email: "investor@example.com",
    phone: "010-1234-5678",
    experience: "intermediate",
    investmentGoal: "rental",
    budget: "5억 ~ 10억",
    preferredAreas: ["서울 강남", "서울 송파", "경기 분당"],
    preferredTypes: ["아파트", "오피스텔"],
  })

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            마이페이지
          </h1>
          <p className="text-muted-foreground mt-1">프로필 및 투자 설정을 관리하세요</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">김</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                  <Crown className="h-3 w-3 mr-1" />
                  프리미엄
                </Badge>
              </div>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">127</p>
                  <p className="text-xs text-muted-foreground">분석한 매물</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">3</p>
                  <p className="text-xs text-muted-foreground">낙찰 성공</p>
                </div>
                <div className="w-px h-10 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">+10.2%</p>
                  <p className="text-xs text-muted-foreground">평균 수익률</p>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="h-4 w-4 mr-2" />
              프로필 편집
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="investment" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="investment">투자 설정</TabsTrigger>
          <TabsTrigger value="history">투자 내역</TabsTrigger>
          <TabsTrigger value="membership">멤버십</TabsTrigger>
          <TabsTrigger value="settings">앱 설정</TabsTrigger>
        </TabsList>

        {/* Investment Profile Tab */}
        <TabsContent value="investment" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                투자 프로필
              </CardTitle>
              <CardDescription>AI가 맞춤 매물을 추천하는데 활용됩니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>투자 경험</Label>
                  <Select defaultValue={profile.experience} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">입문자 (첫 경매)</SelectItem>
                      <SelectItem value="intermediate">중급자 (1-5회 경험)</SelectItem>
                      <SelectItem value="expert">전문가 (5회 이상)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>투자 목적</Label>
                  <Select defaultValue={profile.investmentGoal} disabled={!isEditing}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residence">실거주</SelectItem>
                      <SelectItem value="rental">임대 수익</SelectItem>
                      <SelectItem value="resale">시세 차익</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  투자 예산
                </Label>
                <Select defaultValue="5-10" disabled={!isEditing}>
                  <SelectTrigger>
                    <SelectValue placeholder="예산 범위 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-3">3억 이하</SelectItem>
                    <SelectItem value="3-5">3억 ~ 5억</SelectItem>
                    <SelectItem value="5-10">5억 ~ 10억</SelectItem>
                    <SelectItem value="10-20">10억 ~ 20억</SelectItem>
                    <SelectItem value="20+">20억 이상</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  선호 지역
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="px-3 py-1">
                      {area}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-7">
                      + 추가
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  선호 매물 유형
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.preferredTypes.map((type) => (
                    <Badge key={type} variant="secondary" className="px-3 py-1">
                      {type}
                    </Badge>
                  ))}
                  {isEditing && (
                    <Button variant="outline" size="sm" className="h-7">
                      + 추가
                    </Button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={() => setIsEditing(false)}>저장</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    취소
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investment History Tab */}
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                투자 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {investmentHistory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          item.result === "낙찰" ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{item.property}</p>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.result === "낙찰" ? "default" : "secondary"}>{item.result}</Badge>
                      {item.price !== "-" && (
                        <p className="text-sm font-medium mt-1">{item.price}</p>
                      )}
                      {item.profit !== "-" && (
                        <p className="text-xs text-green-500">{item.profit}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Membership Tab */}
        <TabsContent value="membership" className="mt-6 space-y-6">
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">프리미엄 멤버십</h3>
                    <p className="text-sm text-muted-foreground">2025년 2월 15일까지</p>
                  </div>
                </div>
                <Button>연장하기</Button>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>AI 분석 이용량</span>
                  <span>87 / 100회</span>
                </div>
                <Progress value={87} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">멤버십 혜택</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "AI 종합 분석", free: "3회/월", premium: "100회/월" },
                { label: "실시간 알림", free: "기본", premium: "무제한" },
                { label: "등기부 자동 분석", free: "-", premium: "O" },
                { label: "맞춤 추천", free: "기본", premium: "고급 AI" },
                { label: "투자 리포트", free: "-", premium: "월간 제공" },
              ].map((feature) => (
                <div key={feature.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span>{feature.label}</span>
                  <div className="flex gap-8 text-sm">
                    <span className="text-muted-foreground w-20 text-center">{feature.free}</span>
                    <span className="text-primary font-medium w-20 text-center">{feature.premium}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="settings" className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                앱 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">다크 모드</p>
                    <p className="text-sm text-muted-foreground">어두운 테마 사용</p>
                  </div>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5" />
                  <div>
                    <p className="font-medium">푸시 알림</p>
                    <p className="text-sm text-muted-foreground">앱 알림 수신</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5" />
                  <div>
                    <p className="font-medium">생체 인증</p>
                    <p className="text-sm text-muted-foreground">Face ID / 지문 로그인</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-2">
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  개인정보 처리방침
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  결제 관리
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" className="w-full justify-between text-destructive hover:text-destructive">
                <span className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
