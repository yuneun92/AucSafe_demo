"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  BellOff,
  TrendingDown,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Settings,
  Building2,
  Gavel,
  Clock,
} from "lucide-react"

interface Notification {
  id: string
  type: "price" | "auction" | "warning" | "system"
  title: string
  message: string
  propertyTitle?: string
  date: string
  read: boolean
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "price",
    title: "가격 하락 알림",
    message: "관심 매물의 최저입찰가가 10% 하락했습니다.",
    propertyTitle: "역삼동 OO아파트 102동",
    date: "2025-01-17 09:30",
    read: false,
  },
  {
    id: "2",
    type: "auction",
    title: "입찰일 임박",
    message: "입찰일이 3일 남았습니다. 입찰 준비를 확인하세요.",
    propertyTitle: "상암동 OO오피스텔",
    date: "2025-01-17 08:00",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "권리 분석 주의",
    message: "새로운 가압류가 등기되었습니다. 권리 분석을 다시 확인하세요.",
    propertyTitle: "성수동 OO지식산업센터",
    date: "2025-01-16 15:20",
    read: false,
  },
  {
    id: "4",
    type: "system",
    title: "AI 분석 완료",
    message: "요청하신 매물의 AI 종합 분석이 완료되었습니다.",
    propertyTitle: "잠실동 OO아파트 105동",
    date: "2025-01-16 14:00",
    read: true,
  },
  {
    id: "5",
    type: "auction",
    title: "낙찰 결과 안내",
    message: "관심 매물이 낙찰되었습니다. 낙찰가: 8.2억원",
    propertyTitle: "매탄동 OO빌라",
    date: "2025-01-15 17:00",
    read: true,
  },
  {
    id: "6",
    type: "price",
    title: "유찰 안내",
    message: "관심 매물이 유찰되어 2회차 경매가 진행됩니다.",
    propertyTitle: "송도동 OO아파트",
    date: "2025-01-14 17:30",
    read: true,
  },
]

const notificationSettings = [
  { id: "price", label: "가격 변동 알림", description: "관심 매물의 최저입찰가 변동 시 알림", icon: TrendingDown },
  { id: "auction", label: "입찰일 알림", description: "입찰일 7일, 3일, 1일 전 알림", icon: Calendar },
  { id: "warning", label: "권리 변동 알림", description: "등기 변동 사항 발생 시 알림", icon: AlertTriangle },
  { id: "result", label: "낙찰 결과 알림", description: "관심 매물 경매 결과 알림", icon: Gavel },
]

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [settings, setSettings] = useState<Record<string, boolean>>({
    price: true,
    auction: true,
    warning: true,
    result: true,
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "price":
        return <TrendingDown className="h-5 w-5 text-green-500" />
      case "auction":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "system":
        return <CheckCircle className="h-5 w-5 text-primary" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            알림
          </h1>
          <p className="text-muted-foreground mt-1">관심 매물의 변동 사항을 확인하세요</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            모두 읽음 처리
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" className="gap-2">
            전체
            <Badge variant="secondary">{notifications.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-2">
            안 읽음
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            설정
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 space-y-3">
          {notifications.length > 0 ? (
            <>
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`cursor-pointer transition-colors ${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded-full bg-secondary">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.read && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      {notification.propertyTitle && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {notification.propertyTitle}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <div className="text-center pt-4">
                <Button variant="ghost" className="text-muted-foreground" onClick={clearAll}>
                  모든 알림 삭제
                </Button>
              </div>
            </>
          ) : (
            <Card className="p-12 text-center">
              <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">알림이 없습니다</h3>
              <p className="text-sm text-muted-foreground">새로운 알림이 오면 여기에 표시됩니다</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="mt-6 space-y-3">
          {notifications.filter((n) => !n.read).length > 0 ? (
            notifications
              .filter((n) => !n.read)
              .map((notification) => (
                <Card
                  key={notification.id}
                  className="cursor-pointer border-primary/50 bg-primary/5"
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="p-2 rounded-full bg-secondary">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notification.title}</p>
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                      {notification.propertyTitle && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          {notification.propertyTitle}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.date}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-medium mb-2">모두 확인했습니다</h3>
              <p className="text-sm text-muted-foreground">읽지 않은 알림이 없습니다</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">알림 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <setting.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[setting.id]}
                    onCheckedChange={(checked) => setSettings({ ...settings, [setting.id]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
