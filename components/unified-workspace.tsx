"use client"

import { useState, useEffect } from "react"
import {
  Search,
  MapPin,
  List,
  Grid3X3,
  SlidersHorizontal,
  X,
  Heart,
  Building2,
  TrendingUp,
  Calendar,
  ChevronDown,
  Command,
  Sparkles,
  Bell,
  User,
  Menu,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { auctionProperties, type AuctionProperty } from "@/lib/mock-data"
import { CommandPalette } from "./command-palette"
import { FloatingChat } from "./floating-chat"
import { PropertySlidePanel } from "./property-slide-panel"
import { MapView } from "./map-view"
import { DashboardPage } from "./dashboard-page"
import { AIAnalysisPage } from "./ai-analysis-page"
import { FavoritesPage } from "./favorites-page"
import { NotificationsPage } from "./notifications-page"
import { ProfilePage } from "./profile-page"
import { LandingPage } from "./landing-page"
import { RegistryAnalysisPage } from "./registry-analysis-page"
import { AIChatPage } from "./ai-chat-page"
import { useTheme } from "next-themes"
import { Moon, Sun, MessageSquare, Gavel, Store, Banknote, HelpCircle, FileText, Map } from "lucide-react"

// New page imports
import { ServiceIntroPage, NoticesPage, NewAuctionsPage, UpcomingAuctionsPage } from "./home"
import { AuctionCalendarPage, AuctionResultsPage, CourtSearchPage, LocationSearchPage, SpecialPropertiesPage } from "./auction"
import { PublicSaleSearchPage, PublicSaleCalendarPage, PublicSaleResultsPage } from "./public-sale"
import { CombinedSearchPage } from "./search"
import { PublicSaleMapPage, CombinedMapPage } from "./map"
import { NplSearchPage, NplExchangePage } from "./npl"
import { RecentViewsPage, PaymentHistoryPage, CouponsPage } from "./mypage"
import { FaqPage, InquiryPage, ServiceGuidePage } from "./support"
import { LoginPage, RegisterPage, ForgotPasswordPage } from "./auth"

type ViewMode = "list" | "grid" | "map"
type ActiveTab =
  | "home" | "dashboard" | "search" | "analysis" | "favorites" | "notifications" | "profile" | "registry-analysis" | "chat"
  // 홈 서브메뉴
  | "service-intro" | "notices" | "new-auctions" | "upcoming-auctions"
  // 경매 검색 서브메뉴
  | "auction-calendar" | "auction-results" | "court-search" | "location-search" | "special-properties"
  // 공매 검색 서브메뉴
  | "public-sale-search" | "public-sale-calendar" | "public-sale-results"
  // 통합 검색
  | "combined-search"
  // 지도 검색
  | "auction-map" | "public-sale-map" | "combined-map"
  // NPL
  | "npl-search" | "npl-exchange"
  // 마이페이지
  | "recent-views" | "payment-history" | "coupons"
  // 고객센터
  | "faq" | "inquiry" | "service-guide"
  // 회원
  | "login" | "register" | "forgot-password"

interface ActiveFilter {
  id: string
  label: string
  type: string
}

export function UnifiedWorkspace() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>(undefined)
  const { theme, setTheme } = useTheme()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Handle mobile detection after mount to avoid hydration mismatch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const [searchQuery, setSearchQuery] = useState("")
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<AuctionProperty | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [sortBy, setSortBy] = useState("추천순")

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const handleCommand = (command: string) => {
    switch (command) {
      case "map":
        setViewMode("map")
        break
      case "filter-seoul":
        addFilter({ id: "seoul", label: "서울", type: "location" })
        break
      case "filter-apt":
        addFilter({ id: "apt", label: "아파트", type: "type" })
        break
      case "filter-safe":
        addFilter({ id: "safe", label: "안전 80+", type: "safety" })
        break
      case "favorites":
        addFilter({ id: "favorites", label: "관심 목록", type: "favorites" })
        break
    }
  }

  const addFilter = (filter: ActiveFilter) => {
    if (!activeFilters.find((f) => f.id === filter.id)) {
      setActiveFilters([...activeFilters, filter])
    }
  }

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter((f) => f.id !== filterId))
  }

  const handlePropertyClick = (property: AuctionProperty) => {
    setSelectedProperty(property)
    setPanelOpen(true)
  }

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  // Filter properties
  const filteredProperties = (auctionProperties || []).filter((p) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !p.title?.toLowerCase().includes(query) &&
        !p.address?.toLowerCase().includes(query) &&
        !p.location?.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    for (const filter of activeFilters) {
      if (filter.type === "location" && filter.id === "seoul" && !p.location?.includes("서울")) {
        return false
      }
      if (filter.type === "type" && filter.id === "apt" && p.propertyType !== "아파트") {
        return false
      }
      if (filter.type === "safety" && filter.id === "safe" && p.riskScore < 80) {
        return false
      }
      if (filter.type === "favorites" && !favorites.includes(p.id)) {
        return false
      }
    }

    return true
  })

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3">
          {/* Logo & Nav */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
              onClick={() => setActiveTab("home")}
            >
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">AucSafe</span>
            </button>

            {/* 햄버거 메뉴 버튼 (작은 화면용) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* 데스크탑 네비게이션 (md 이상에서만 표시) */}
            <nav className="hidden md:flex items-center gap-1">
              {/* 경공매 검색 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Gavel className="w-4 h-4 mr-1.5" />
                    경공매
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">경매</div>
                  <DropdownMenuItem onClick={() => setActiveTab("search")}>경매 종합 검색</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("auction-calendar")}>경매 일정</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("auction-results")}>입찰 결과</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("court-search")}>법원 검색</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("location-search")}>소재지 검색</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("special-properties")}>특수물건</DropdownMenuItem>
                  <div className="my-1 border-t" />
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">공매</div>
                  <DropdownMenuItem onClick={() => setActiveTab("public-sale-search")}>공매 종합 검색</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("public-sale-calendar")}>공매 일정</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("public-sale-results")}>공매 입찰 결과</DropdownMenuItem>
                  <div className="my-1 border-t" />
                  <DropdownMenuItem onClick={() => setActiveTab("combined-search")}>경·공매 통합 검색</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* NPL */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Banknote className="w-4 h-4 mr-1.5" />
                    NPL
                    <ChevronDown className="w-3 h-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setActiveTab("npl-search")}>NPL 검색</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveTab("npl-exchange")}>NPL 거래소</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* AI 분석/상담 - 보라색 강조 */}
              <div className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/40">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 ${
                    activeTab === "analysis"
                      ? "text-violet-700 dark:text-violet-300 bg-violet-500/20"
                      : "text-violet-600 dark:text-violet-400 hover:bg-violet-500/15"
                  }`}
                  onClick={() => setActiveTab("analysis")}
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  AI분석
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 ${
                    activeTab === "chat"
                      ? "text-violet-700 dark:text-violet-300 bg-violet-500/20"
                      : "text-violet-600 dark:text-violet-400 hover:bg-violet-500/15"
                  }`}
                  onClick={() => {
                    setInitialChatMessage(undefined)
                    setActiveTab("chat")
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-1.5" />
                  AI상담
                </Button>
              </div>

              {/* 관심 목록 */}
              <Button
                variant="ghost"
                size="sm"
                className={activeTab === "favorites" ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"}
                onClick={() => setActiveTab("favorites")}
              >
                <Heart className="w-4 h-4 mr-1.5" />
                관심
                {favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 md:mx-4">
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center gap-2 md:gap-3 px-3 py-2 bg-secondary rounded-lg text-sm text-muted-foreground hover:bg-secondary/80 transition-colors"
            >
              <Search className="w-4 h-4" />
              <span className="flex-1 text-left truncate text-xs md:text-sm">검색...</span>
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-muted rounded">
                <Command className="w-3 h-3" />K
              </kbd>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`relative h-9 w-9 hidden md:inline-flex ${activeTab === "notifications" ? "bg-secondary" : ""}`}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full" />
            </Button>
            {/* 마이페이지/고객센터/프로필 드롭다운 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hidden md:inline-flex"
                >
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                  <User className="w-4 h-4 mr-2" />내 정보 수정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("recent-views")}>
                  <FileText className="w-4 h-4 mr-2" />최근 열람 물건
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("payment-history")}>
                  <Banknote className="w-4 h-4 mr-2" />결제 내역
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("coupons")}>
                  <Banknote className="w-4 h-4 mr-2" />쿠폰함
                </DropdownMenuItem>
                <div className="border-t my-1" />
                <DropdownMenuItem onClick={() => setActiveTab("notices")}>
                  <Bell className="w-4 h-4 mr-2" />공지사항
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("faq")}>
                  <HelpCircle className="w-4 h-4 mr-2" />FAQ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("inquiry")}>
                  <MessageSquare className="w-4 h-4 mr-2" />1:1 문의
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("service-guide")}>
                  <FileText className="w-4 h-4 mr-2" />서비스 이용 안내
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 햄버거 메뉴 패널 (작은 화면용) */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="p-4 space-y-3">
              {/* 경공매 검색 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2">경매</p>
                <div className="grid grid-cols-2 gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>
                    <Gavel className="w-4 h-4 mr-2" />경매 종합 검색
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("auction-calendar"); setMenuOpen(false); }}>
                    <Calendar className="w-4 h-4 mr-2" />경매 일정
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("auction-results"); setMenuOpen(false); }}>
                    <TrendingUp className="w-4 h-4 mr-2" />입찰 결과
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("special-properties"); setMenuOpen(false); }}>
                    <Building2 className="w-4 h-4 mr-2" />특수물건
                  </Button>
                </div>
              </div>
              <div className="border-t border-border/50" />
              {/* 공매 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2">공매</p>
                <div className="grid grid-cols-2 gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("public-sale-search"); setMenuOpen(false); }}>
                    <Store className="w-4 h-4 mr-2" />공매 종합 검색
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("public-sale-calendar"); setMenuOpen(false); }}>
                    <Calendar className="w-4 h-4 mr-2" />공매 일정
                  </Button>
                </div>
              </div>
              <div className="border-t border-border/50" />
              {/* NPL */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2">NPL</p>
                <div className="grid grid-cols-2 gap-1">
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("npl-search"); setMenuOpen(false); }}>
                    <Banknote className="w-4 h-4 mr-2" />NPL 검색
                  </Button>
                  <Button variant="ghost" size="sm" className="justify-start" onClick={() => { setActiveTab("npl-exchange"); setMenuOpen(false); }}>
                    <Banknote className="w-4 h-4 mr-2" />NPL 거래소
                  </Button>
                </div>
              </div>
              <div className="border-t border-border/50" />
              {/* 특수검색 */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-2">특수검색</p>
                <div className="grid grid-cols-3 gap-1">
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("new-auctions"); setMenuOpen(false); }}>경매신건</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("upcoming-auctions"); setMenuOpen(false); }}>예정물건</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>최근2주변동</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>공시1억이하</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>지분경매</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>법정지상권</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>유치권</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>감정1년후</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>HUG</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>인수조건변경</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("search"); setMenuOpen(false); }}>반값경매</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("public-sale-search"); setMenuOpen(false); }}>반값공매</Button>
                  <Button variant="ghost" size="sm" className="justify-start text-xs px-2" onClick={() => { setActiveTab("npl-search"); setMenuOpen(false); }}>반값NPL</Button>
                </div>
              </div>
              <div className="border-t border-border/50" />
              {/* AI 분석/상담 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
                  onClick={() => { setActiveTab("analysis"); setMenuOpen(false); }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />AI분석
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600"
                  onClick={() => { setInitialChatMessage(undefined); setActiveTab("chat"); setMenuOpen(false); }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />AI상담
                </Button>
              </div>
              {/* 관심 목록 */}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => { setActiveTab("favorites"); setMenuOpen(false); }}
              >
                <Heart className="w-4 h-4 mr-2" />
                관심 목록
                {favorites.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {favorites.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Filter Bar - only show on search tab (not on home) */}
        {activeTab === "search" && activeTab !== "home" && (
        <div className="flex items-center gap-3 px-4 py-2 border-t border-border/50">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode("map")}
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border" />

          {/* Quick Filters */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 bg-transparent">
                  <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                  필터
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => addFilter({ id: "seoul", label: "서울", type: "location" })}>
                  <MapPin className="w-4 h-4 mr-2" /> 서울 지역
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ id: "apt", label: "아파트", type: "type" })}>
                  <Building2 className="w-4 h-4 mr-2" /> 아파트만
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ id: "safe", label: "안전 80+", type: "safety" })}>
                  <TrendingUp className="w-4 h-4 mr-2" /> 안전 매물 (80점+)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addFilter({ id: "thisweek", label: "이번 주 입찰", type: "date" })}>
                  <Calendar className="w-4 h-4 mr-2" /> 이번 주 입찰
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Active Filters */}
            {activeFilters.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="h-8 px-3 gap-1.5 cursor-pointer hover:bg-secondary/80"
                onClick={() => removeFilter(filter.id)}
              >
                {filter.label}
                <X className="w-3 h-3" />
              </Badge>
            ))}

            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-muted-foreground"
                onClick={() => setActiveFilters([])}
              >
                초기화
              </Button>
            )}
          </div>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8">
                {sortBy}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("추천순")}>추천순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("안전점수순")}>안전점수순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("가격낮은순")}>가격낮은순</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("입찰임박순")}>입찰임박순</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Result Count */}
          <span className="text-sm text-muted-foreground whitespace-nowrap">{filteredProperties.length}건</span>
        </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto overflow-x-hidden ${isMobile ? "pb-20" : ""}`}>
        {activeTab === "home" ? (
          <LandingPage
            onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
            onSelectProperty={handlePropertyClick}
            onStartChat={(message) => {
              setInitialChatMessage(message)
              setActiveTab("chat")
            }}
            onFileUpload={(fileName) => {
              setUploadedFileName(fileName)
              setActiveTab("registry-analysis")
            }}
          />
        ) : activeTab === "registry-analysis" ? (
          <RegistryAnalysisPage
            fileName={uploadedFileName || undefined}
            onBack={() => setActiveTab("home")}
            onFindSimilar={() => setActiveTab("search")}
          />
        ) : activeTab === "chat" ? (
          <AIChatPage
            initialMessage={initialChatMessage}
            onSelectProperty={handlePropertyClick}
            onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
          />
        ) : activeTab === "dashboard" ? (
          <DashboardPage
            onNavigate={(tab) => setActiveTab(tab as ActiveTab)}
            onSelectProperty={handlePropertyClick}
          />
        ) : activeTab === "analysis" ? (
          <div className="p-6 max-w-7xl mx-auto">
            <AIAnalysisPage />
          </div>
        ) : activeTab === "favorites" ? (
          <div className="p-6 max-w-5xl mx-auto">
            <FavoritesPage onSelectProperty={handlePropertyClick} />
          </div>
        ) : activeTab === "notifications" ? (
          <NotificationsPage />
        ) : activeTab === "profile" ? (
          <ProfilePage />
        ) : activeTab === "service-intro" ? (
          <ServiceIntroPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "notices" ? (
          <NoticesPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "new-auctions" ? (
          <NewAuctionsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} onSelectProperty={(id) => {
            const property = auctionProperties.find((p) => p.id === id)
            if (property) handlePropertyClick(property)
          }} />
        ) : activeTab === "upcoming-auctions" ? (
          <UpcomingAuctionsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} onSelectProperty={(id) => {
            const property = auctionProperties.find((p) => p.id === id)
            if (property) handlePropertyClick(property)
          }} />
        ) : activeTab === "auction-calendar" ? (
          <AuctionCalendarPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} onSelectProperty={(id) => {
            const property = auctionProperties.find((p) => p.id === id)
            if (property) handlePropertyClick(property)
          }} />
        ) : activeTab === "auction-results" ? (
          <AuctionResultsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} onSelectProperty={(id) => {
            const property = auctionProperties.find((p) => p.id === id)
            if (property) handlePropertyClick(property)
          }} />
        ) : activeTab === "court-search" ? (
          <CourtSearchPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "location-search" ? (
          <LocationSearchPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "special-properties" ? (
          <SpecialPropertiesPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} onSelectProperty={(id) => {
            const property = auctionProperties.find((p) => p.id === id)
            if (property) handlePropertyClick(property)
          }} />
        ) : activeTab === "public-sale-search" ? (
          <PublicSaleSearchPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "public-sale-calendar" ? (
          <PublicSaleCalendarPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "public-sale-results" ? (
          <PublicSaleResultsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "combined-search" ? (
          <CombinedSearchPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "public-sale-map" ? (
          <PublicSaleMapPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "combined-map" ? (
          <CombinedMapPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "npl-search" ? (
          <NplSearchPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "npl-exchange" ? (
          <NplExchangePage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "recent-views" ? (
          <RecentViewsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "payment-history" ? (
          <PaymentHistoryPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "coupons" ? (
          <CouponsPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "faq" ? (
          <FaqPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "inquiry" ? (
          <InquiryPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "service-guide" ? (
          <ServiceGuidePage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "login" ? (
          <LoginPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "register" ? (
          <RegisterPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : activeTab === "forgot-password" ? (
          <ForgotPasswordPage onNavigate={(tab) => setActiveTab(tab as ActiveTab)} />
        ) : viewMode === "map" ? (
          <div className={`flex ${isMobile ? "h-[calc(100vh-140px)]" : "h-[calc(100vh-120px)]"}`}>
            <div className="flex-1">
              <MapView
                properties={filteredProperties}
                onPropertyClick={handlePropertyClick}
                selectedPropertyId={selectedProperty?.id}
                onBoundsChange={(bounds) => {
                  console.log("Map bounds changed:", bounds)
                }}
              />
            </div>
            {!isMobile && (
              <div className="w-96 border-l border-border overflow-y-auto bg-card">
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground">매물 목록 ({filteredProperties.length})</h3>
                  {filteredProperties.map((property) => (
                    <PropertyListItem
                      key={property.id}
                      property={property}
                      onClick={() => handlePropertyClick(property)}
                      onFavorite={() => toggleFavorite(property.id)}
                      isFavorite={favorites.includes(property.id)}
                      isSelected={selectedProperty?.id === property.id}
                      compact
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="p-3 md:p-4 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {filteredProperties.map((property) => (
              <PropertyGridItem
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
                onFavorite={() => toggleFavorite(property.id)}
                isFavorite={favorites.includes(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-5xl mx-auto p-3 md:p-4 space-y-3">
            {filteredProperties.map((property) => (
              <PropertyListItem
                key={property.id}
                property={property}
                onClick={() => handlePropertyClick(property)}
                onFavorite={() => toggleFavorite(property.id)}
                isFavorite={favorites.includes(property.id)}
                isSelected={selectedProperty?.id === property.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} onCommand={handleCommand} />

      {/* Floating Chat */}
      <FloatingChat
        onFilterChange={(filters) => {
          if (filters.location === "서울") {
            addFilter({ id: "seoul", label: "서울", type: "location" })
          }
          if (filters.type === "아파트") {
            addFilter({ id: "apt", label: "아파트", type: "type" })
          }
        }}
        onPropertySelect={(id) => {
          const property = auctionProperties.find((p) => p.id === id)
          if (property) handlePropertyClick(property)
        }}
      />

      {/* Property Detail Panel */}
      <PropertySlidePanel
        property={selectedProperty}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onFavorite={toggleFavorite}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
      />

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur border-t border-border safe-area-pb">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "home" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-medium">홈</span>
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "search" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-medium">탐색</span>
            </button>
            <button
              onClick={() => {
                setInitialChatMessage(undefined)
                setActiveTab("chat")
              }}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "chat" ? "text-violet-600 dark:text-violet-400" : "text-violet-500 dark:text-violet-400"
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-[10px] font-medium">AI 상담</span>
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "favorites" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-medium">관심</span>
              {favorites.length > 0 && (
                <span className="absolute -top-0.5 right-2 min-w-[16px] h-4 px-1 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "profile" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">내 정보</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

// Property List Item Component
function PropertyListItem({
  property,
  onClick,
  onFavorite,
  isFavorite,
  isSelected,
  compact,
}: {
  property: AuctionProperty
  onClick: () => void
  onFavorite: () => void
  isFavorite: boolean
  isSelected?: boolean
  compact?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={`group bg-card border rounded-xl p-4 cursor-pointer transition-all hover:border-primary/50 ${
        isSelected ? "border-primary ring-1 ring-primary/20" : "border-border"
      } ${compact ? "p-3" : ""}`}
    >
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div
          className={`relative rounded-lg overflow-hidden bg-secondary shrink-0 ${compact ? "w-20 h-20" : "w-28 h-28"}`}
        >
          <img
            src={property.image || "/placeholder.svg?height=112&width=112&query=apartment"}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-1.5 left-1.5">
            <Badge
              className={`text-xs ${
                property.riskScore >= 80
                  ? "bg-primary/90"
                  : property.riskScore >= 60
                    ? "bg-warning/90"
                    : "bg-destructive/90"
              }`}
            >
              {property.riskScore}점
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`font-semibold truncate ${compact ? "text-sm" : ""}`}>{property.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{property.address}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onFavorite()
              }}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
            </Button>
          </div>

          <div className={`flex items-center gap-4 ${compact ? "mt-2" : "mt-3"}`}>
            <div>
              <p className="text-xs text-muted-foreground">최저입찰가</p>
              <p className={`font-bold text-primary ${compact ? "text-sm" : ""}`}>
                {(property.minimumBidPrice / 100000000).toFixed(1)}억
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">감정가</p>
              <p className={`font-semibold ${compact ? "text-sm" : ""}`}>
                {(property.appraisalPrice / 100000000).toFixed(1)}억
              </p>
            </div>
            {!compact && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground">입찰일</p>
                  <p className="font-medium text-sm">{property.auctionDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">유찰</p>
                  <p className="font-medium text-sm">{property.failedCount}회</p>
                </div>
              </>
            )}
          </div>

          {!compact && (
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs">
                {property.propertyType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {property.area}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {property.court}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Property Grid Item Component
function PropertyGridItem({
  property,
  onClick,
  onFavorite,
  isFavorite,
}: {
  property: AuctionProperty
  onClick: () => void
  onFavorite: () => void
  isFavorite: boolean
}) {
  return (
    <div
      onClick={onClick}
      className="group bg-card border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:border-primary/50 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-40 bg-secondary">
        <img
          src={property.image || "/placeholder.svg?height=160&width=320&query=apartment building"}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />

        <div className="absolute top-2 left-2">
          <Badge
            className={`${
              property.riskScore >= 80
                ? "bg-primary/90"
                : property.riskScore >= 60
                  ? "bg-warning/90"
                  : "bg-destructive/90"
            }`}
          >
            AI {property.riskScore}점
          </Badge>
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-card/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onFavorite()
          }}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
        </Button>

        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white font-bold text-lg">{(property.minimumBidPrice / 100000000).toFixed(1)}억</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{property.title}</h3>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{property.address}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {property.propertyType}
            </Badge>
            <span className="text-xs text-muted-foreground">{property.auctionDate}</span>
          </div>
          <span className="text-xs text-muted-foreground">유찰 {property.failedCount}회</span>
        </div>
      </div>
    </div>
  )
}
