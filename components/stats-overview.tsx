"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Building2, Gavel, Target, AlertTriangle } from "lucide-react"

const stats = [
  {
    label: "오늘의 추천 매물",
    value: "127",
    change: "+12",
    changeType: "positive" as const,
    icon: Target,
  },
  {
    label: "신규 경매 등록",
    value: "48",
    change: "+8",
    changeType: "positive" as const,
    icon: Gavel,
  },
  {
    label: "평균 낙찰가율",
    value: "78.5%",
    change: "-2.3%",
    changeType: "negative" as const,
    icon: Building2,
  },
  {
    label: "주의 매물",
    value: "15",
    change: "+3",
    changeType: "warning" as const,
    icon: AlertTriangle,
  },
]

export function StatsOverview() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === "positive"
                    ? "text-primary"
                    : stat.changeType === "negative"
                      ? "text-destructive"
                      : "text-accent"
                }`}
              >
                {stat.changeType === "positive" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : stat.changeType === "negative" ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
