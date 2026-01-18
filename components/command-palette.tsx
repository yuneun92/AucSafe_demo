"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, MapPin, Building2, Sparkles, Heart, Settings, TrendingUp, Filter, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCommand: (command: string, payload?: any) => void
}

const commands = [
  { id: "search", label: "매물 검색", icon: Search, shortcut: "S", category: "검색" },
  { id: "map", label: "지도 보기", icon: MapPin, shortcut: "M", category: "보기" },
  { id: "ai", label: "AI에게 질문하기", icon: Sparkles, shortcut: "A", category: "AI" },
  { id: "filter-seoul", label: "서울 매물만 보기", icon: Filter, shortcut: "", category: "필터" },
  { id: "filter-apt", label: "아파트만 보기", icon: Building2, shortcut: "", category: "필터" },
  { id: "filter-safe", label: "안전 매물만 보기 (80점+)", icon: TrendingUp, shortcut: "", category: "필터" },
  { id: "favorites", label: "관심 목록 보기", icon: Heart, shortcut: "F", category: "보기" },
  { id: "settings", label: "투자 성향 설정", icon: Settings, shortcut: ",", category: "설정" },
]

export function CommandPalette({ open, onOpenChange, onCommand }: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase()),
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open) return

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((i) => (i + 1) % filteredCommands.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((i) => (i - 1 + filteredCommands.length) % filteredCommands.length)
      } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
        e.preventDefault()
        onCommand(filteredCommands[selectedIndex].id)
        onOpenChange(false)
        setQuery("")
      }
    },
    [open, filteredCommands, selectedIndex, onCommand, onOpenChange],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden bg-card border-border">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="명령어 검색... (예: 서울, 아파트, AI)"
            className="border-0 bg-transparent p-0 h-auto text-sm focus-visible:ring-0 placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-sm">검색 결과가 없습니다</div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <button
                key={cmd.id}
                onClick={() => {
                  onCommand(cmd.id)
                  onOpenChange(false)
                  setQuery("")
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <cmd.icon className="w-4 h-4" />
                <span className="flex-1 text-sm">{cmd.label}</span>
                <Badge variant="outline" className="text-xs font-normal">
                  {cmd.category}
                </Badge>
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded text-muted-foreground">{cmd.shortcut}</kbd>
                )}
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-border flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded">↑↓</kbd> 이동
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded">Enter</kbd> 실행
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted rounded">Esc</kbd> 닫기
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
