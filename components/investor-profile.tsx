"use client"

import { useState } from "react"
import type { InvestorProfile } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Settings, Shield, Zap, TrendingUp, Home, Building2, BarChart3, User } from "lucide-react"

interface InvestorProfileProps {
  profile: InvestorProfile
  onProfileChange: (profile: InvestorProfile) => void
}

const propertyTypes = ["아파트", "오피스텔", "빌라", "상가/사무실", "토지"]
const areas = ["강남구", "서초구", "송파구", "마포구", "성동구", "용산구", "영등포구", "강서구"]

export function InvestorProfilePanel({ profile, onProfileChange }: InvestorProfileProps) {
  const [localProfile, setLocalProfile] = useState<InvestorProfile>(profile)
  const [open, setOpen] = useState(false)

  const formatBudget = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(0)}억`
    }
    return `${(value / 10000000).toFixed(0)}천만`
  }

  const handleSave = () => {
    onProfileChange(localProfile)
    setOpen(false)
  }

  const riskIcons = {
    conservative: Shield,
    moderate: BarChart3,
    aggressive: Zap,
  }

  const goalIcons = {
    residence: Home,
    rental: Building2,
    resale: TrendingUp,
  }

  const RiskIcon = riskIcons[profile.riskTolerance]
  const GoalIcon = goalIcons[profile.investmentGoal]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-5 w-5" />내 투자 성향
            </CardTitle>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                수정
              </Button>
            </DialogTrigger>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
            <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <RiskIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">위험 성향</p>
              <p className="font-medium">
                {profile.riskTolerance === "conservative"
                  ? "안정 추구형"
                  : profile.riskTolerance === "moderate"
                    ? "균형 투자형"
                    : "적극 투자형"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
            <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <GoalIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">투자 목적</p>
              <p className="font-medium">
                {profile.investmentGoal === "residence"
                  ? "실거주"
                  : profile.investmentGoal === "rental"
                    ? "임대 수익"
                    : "시세 차익"}
              </p>
            </div>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground mb-1">예산 범위</p>
            <p className="font-medium">
              {formatBudget(profile.budget.min)} ~ {formatBudget(profile.budget.max)}
            </p>
          </div>
          <div className="text-sm">
            <p className="text-muted-foreground mb-2">선호 지역</p>
            <div className="flex flex-wrap gap-1">
              {profile.preferredAreas.slice(0, 3).map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                </Badge>
              ))}
              {profile.preferredAreas.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{profile.preferredAreas.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>투자 성향 설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Risk Tolerance */}
          <div className="space-y-3">
            <Label>위험 성향</Label>
            <RadioGroup
              value={localProfile.riskTolerance}
              onValueChange={(value) =>
                setLocalProfile({
                  ...localProfile,
                  riskTolerance: value as InvestorProfile["riskTolerance"],
                })
              }
              className="grid grid-cols-3 gap-2"
            >
              {[
                { value: "conservative", label: "안정 추구형", icon: Shield },
                { value: "moderate", label: "균형 투자형", icon: BarChart3 },
                { value: "aggressive", label: "적극 투자형", icon: Zap },
              ].map((option) => (
                <Label
                  key={option.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    localProfile.riskTolerance === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <option.icon className="h-6 w-6" />
                  <span className="text-xs text-center">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Investment Goal */}
          <div className="space-y-3">
            <Label>투자 목적</Label>
            <RadioGroup
              value={localProfile.investmentGoal}
              onValueChange={(value) =>
                setLocalProfile({
                  ...localProfile,
                  investmentGoal: value as InvestorProfile["investmentGoal"],
                })
              }
              className="grid grid-cols-3 gap-2"
            >
              {[
                { value: "residence", label: "실거주", icon: Home },
                { value: "rental", label: "임대 수익", icon: Building2 },
                { value: "resale", label: "시세 차익", icon: TrendingUp },
              ].map((option) => (
                <Label
                  key={option.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-colors ${
                    localProfile.investmentGoal === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={option.value} className="sr-only" />
                  <option.icon className="h-6 w-6" />
                  <span className="text-xs text-center">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Budget Range */}
          <div className="space-y-3">
            <Label>예산 범위</Label>
            <Slider
              value={[localProfile.budget.min, localProfile.budget.max]}
              onValueChange={([min, max]) =>
                setLocalProfile({
                  ...localProfile,
                  budget: { min, max },
                })
              }
              max={3000000000}
              step={50000000}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{formatBudget(localProfile.budget.min)}</span>
              <span>{formatBudget(localProfile.budget.max)}</span>
            </div>
          </div>

          {/* Preferred Areas */}
          <div className="space-y-3">
            <Label>선호 지역</Label>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => (
                <Badge
                  key={area}
                  variant={localProfile.preferredAreas.includes(area) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setLocalProfile({
                      ...localProfile,
                      preferredAreas: localProfile.preferredAreas.includes(area)
                        ? localProfile.preferredAreas.filter((a) => a !== area)
                        : [...localProfile.preferredAreas, area],
                    })
                  }}
                >
                  {area}
                </Badge>
              ))}
            </div>
          </div>

          {/* Preferred Property Types */}
          <div className="space-y-3">
            <Label>선호 물건 유형</Label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <Badge
                  key={type}
                  variant={localProfile.preferredTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    setLocalProfile({
                      ...localProfile,
                      preferredTypes: localProfile.preferredTypes.includes(type)
                        ? localProfile.preferredTypes.filter((t) => t !== type)
                        : [...localProfile.preferredTypes, type],
                    })
                  }}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div className="space-y-3">
            <Label>경매 경험</Label>
            <RadioGroup
              value={localProfile.experienceLevel}
              onValueChange={(value) =>
                setLocalProfile({
                  ...localProfile,
                  experienceLevel: value as InvestorProfile["experienceLevel"],
                })
              }
              className="space-y-2"
            >
              {[
                { value: "beginner", label: "초보 (첫 경매 도전)" },
                { value: "intermediate", label: "중급 (1~5회 낙찰 경험)" },
                { value: "expert", label: "고급 (5회 이상 낙찰 경험)" },
              ].map((option) => (
                <Label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    localProfile.experienceLevel === option.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <RadioGroupItem value={option.value} />
                  <span className="text-sm">{option.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          <Button onClick={handleSave} className="w-full">
            설정 저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
