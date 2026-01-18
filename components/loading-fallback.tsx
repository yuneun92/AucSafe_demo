import { Building2 } from "lucide-react"

export function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center animate-pulse">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-xl border-2 border-primary/30 animate-ping" />
        </div>
        <div className="text-center">
          <h2 className="font-semibold text-lg">AucSafe</h2>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    </div>
  )
}
