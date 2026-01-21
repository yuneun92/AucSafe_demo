"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, Check, X } from "lucide-react"

interface RegisterPageProps {
  onNavigate: (page: string) => void
  onRegister: (data: RegisterData) => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  phone: string
}

export function RegisterPage({ onNavigate, onRegister }: RegisterPageProps) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [agreeMarketing, setAgreeMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // 비밀번호 강도 체크
  const getPasswordStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score += 25
    if (/[a-z]/.test(pwd)) score += 25
    if (/[A-Z]/.test(pwd)) score += 25
    if (/[0-9]/.test(pwd)) score += 12.5
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 12.5
    return score
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordRequirements = [
    { label: "8자 이상", met: password.length >= 8 },
    { label: "영문 소문자", met: /[a-z]/.test(password) },
    { label: "영문 대문자", met: /[A-Z]/.test(password) },
    { label: "숫자", met: /[0-9]/.test(password) },
    { label: "특수문자", met: /[^a-zA-Z0-9]/.test(password) },
  ]

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value))
  }

  const validateStep1 = () => {
    if (!email) {
      setError("이메일을 입력해주세요.")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.")
      return false
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.")
      return false
    }
    if (passwordStrength < 75) {
      setError("비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.")
      return false
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!name) {
      setError("이름을 입력해주세요.")
      return false
    }
    if (!phone || phone.replace(/-/g, "").length < 10) {
      setError("올바른 휴대폰 번호를 입력해주세요.")
      return false
    }
    if (!agreeTerms || !agreePrivacy) {
      setError("필수 약관에 동의해주세요.")
      return false
    }
    return true
  }

  const handleNext = () => {
    setError("")
    if (step === 1 && validateStep1()) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateStep2()) return

    setIsLoading(true)
    // 목업: 실제로는 API 호출
    setTimeout(() => {
      onRegister({ email, password, name, phone })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">회원가입</CardTitle>
          <CardDescription>
            AucSafe 회원이 되어 다양한 서비스를 이용해보세요
          </CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {step}/2 단계
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">이메일 *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">비밀번호 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress value={passwordStrength} className="h-2" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {passwordStrength < 50 ? "약함" : passwordStrength < 75 ? "보통" : "강함"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {passwordRequirements.map((req, i) => (
                          <span
                            key={i}
                            className={`text-xs flex items-center gap-1 ${
                              req.met ? "text-green-600" : "text-muted-foreground"
                            }`}
                          >
                            {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {req.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="비밀번호를 다시 입력하세요"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs ${password === confirmPassword ? "text-green-600" : "text-destructive"}`}>
                      {password === confirmPassword ? "비밀번호가 일치합니다" : "비밀번호가 일치하지 않습니다"}
                    </p>
                  )}
                </div>

                <Button type="button" className="w-full" onClick={handleNext}>
                  다음
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">이름 *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">휴대폰 번호 *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="010-0000-0000"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="pl-10"
                      maxLength={13}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="agreeAll"
                      checked={agreeTerms && agreePrivacy && agreeMarketing}
                      onCheckedChange={(checked) => {
                        setAgreeTerms(checked as boolean)
                        setAgreePrivacy(checked as boolean)
                        setAgreeMarketing(checked as boolean)
                      }}
                    />
                    <Label htmlFor="agreeAll" className="text-sm font-medium cursor-pointer">
                      전체 동의
                    </Label>
                  </div>
                  <div className="pl-6 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeTerms"
                          checked={agreeTerms}
                          onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                        />
                        <Label htmlFor="agreeTerms" className="text-sm font-normal cursor-pointer">
                          [필수] 이용약관 동의
                        </Label>
                      </div>
                      <button type="button" className="text-xs text-muted-foreground hover:underline">
                        보기
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreePrivacy"
                          checked={agreePrivacy}
                          onCheckedChange={(checked) => setAgreePrivacy(checked as boolean)}
                        />
                        <Label htmlFor="agreePrivacy" className="text-sm font-normal cursor-pointer">
                          [필수] 개인정보처리방침 동의
                        </Label>
                      </div>
                      <button type="button" className="text-xs text-muted-foreground hover:underline">
                        보기
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeMarketing"
                          checked={agreeMarketing}
                          onCheckedChange={(checked) => setAgreeMarketing(checked as boolean)}
                        />
                        <Label htmlFor="agreeMarketing" className="text-sm font-normal cursor-pointer">
                          [선택] 마케팅 정보 수신 동의
                        </Label>
                      </div>
                      <button type="button" className="text-xs text-muted-foreground hover:underline">
                        보기
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    이전
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        가입 중...
                      </>
                    ) : (
                      "가입하기"
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            이미 회원이신가요?{" "}
            <button
              onClick={() => onNavigate("login")}
              className="text-primary hover:underline font-medium"
            >
              로그인
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
