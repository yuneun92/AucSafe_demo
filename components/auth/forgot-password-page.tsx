"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, CheckCircle, Lock, Eye, EyeOff } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void
  onResetPassword: (email: string, newPassword: string) => void
}

export function ForgotPasswordPage({ onNavigate, onResetPassword }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<"email" | "verify" | "reset" | "complete">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("이메일을 입력해주세요.")
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식이 아닙니다.")
      return
    }

    setIsLoading(true)
    // 목업: 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false)
      setStep("verify")
      setCountdown(180) // 3분
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1000)
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (otp.length !== 6) {
      setError("인증번호 6자리를 입력해주세요.")
      return
    }

    setIsLoading(true)
    // 목업: 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false)
      // 목업: 123456이 정답
      if (otp === "123456") {
        setStep("reset")
      } else {
        setError("인증번호가 일치하지 않습니다.")
      }
    }, 1000)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword) {
      setError("새 비밀번호를 입력해주세요.")
      return
    }
    if (newPassword.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    setIsLoading(true)
    // 목업: 실제로는 API 호출
    setTimeout(() => {
      setIsLoading(false)
      setStep("complete")
      onResetPassword(email, newPassword)
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {step !== "complete" && (
            <button
              onClick={() => {
                if (step === "email") onNavigate("login")
                else if (step === "verify") setStep("email")
                else if (step === "reset") setStep("verify")
              }}
              className="absolute left-6 top-6 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <CardTitle className="text-2xl">
            {step === "email" && "비밀번호 찾기"}
            {step === "verify" && "이메일 인증"}
            {step === "reset" && "새 비밀번호 설정"}
            {step === "complete" && "비밀번호 변경 완료"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "가입하신 이메일로 인증번호를 보내드립니다"}
            {step === "verify" && `${email}로 전송된 인증번호를 입력해주세요`}
            {step === "reset" && "새로운 비밀번호를 설정해주세요"}
            {step === "complete" && "비밀번호가 성공적으로 변경되었습니다"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="가입하신 이메일을 입력하세요"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    전송 중...
                  </>
                ) : (
                  "인증번호 받기"
                )}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      남은 시간: <span className="text-primary font-medium">{formatTime(countdown)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-destructive">
                      인증번호가 만료되었습니다
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCountdown(180)
                    // 재전송 로직
                  }}
                  className="w-full text-sm text-primary hover:underline"
                  disabled={countdown > 150}
                >
                  인증번호 재전송
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || countdown === 0}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  "인증하기"
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                테스트용 인증번호: 123456
              </p>
            </form>
          )}

          {step === "reset" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="새 비밀번호를 입력하세요"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <p className="text-xs text-muted-foreground">
                  8자 이상, 영문/숫자/특수문자 조합 권장
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="새 비밀번호를 다시 입력하세요"
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
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    변경 중...
                  </>
                ) : (
                  "비밀번호 변경"
                )}
              </Button>
            </form>
          )}

          {step === "complete" && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-muted-foreground">
                새로운 비밀번호로 로그인해주세요
              </p>
              <Button className="w-full" onClick={() => onNavigate("login")}>
                로그인하기
              </Button>
            </div>
          )}

          {step !== "complete" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              비밀번호가 기억나셨나요?{" "}
              <button
                onClick={() => onNavigate("login")}
                className="text-primary hover:underline font-medium"
              >
                로그인
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
