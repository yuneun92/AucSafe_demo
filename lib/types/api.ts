// API 공통 타입 정의

// 공통 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    hasMore?: boolean
  }
}

// 인증 관련
export interface User {
  id: string
  email: string
  name: string
  phone?: string
  profileImage?: string
  membershipTier: "FREE" | "BASIC" | "PREMIUM"
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

// 매물 관련
export interface Property {
  id: string
  caseNumber: string
  title: string
  address: string
  location: string
  propertyType: "아파트" | "오피스텔" | "빌라" | "상가" | "토지" | "기타"
  area: string
  areaSize: number // 평수
  appraisalPrice: number
  minimumBidPrice: number
  marketPrice?: number
  court: string
  auctionDate: string
  auctionRound: number
  failedCount: number
  riskScore: number
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  images: string[]
  image: string
  coordinates: {
    lat: number
    lng: number
  }
  createdAt: string
  updatedAt: string
}

export interface PropertyDetail extends Property {
  description?: string
  buildYear?: number
  floor?: string
  totalFloors?: number
  direction?: string
  parkingCount?: number
  managementFee?: number
  rights: RightItem[]
  tenants: TenantInfo[]
  priceHistory: PriceHistoryItem[]
  aiAnalysis?: AIAnalysisResult
}

// 권리 분석 관련
export interface RightItem {
  id: string
  type: "저당권" | "전세권" | "가압류" | "가등기" | "지상권" | "임차권" | "근저당권"
  registrationDate: string
  holder: string
  amount?: number
  isBaselineRight: boolean // 말소기준권리 여부
  willBeDeleted: boolean // 낙찰 시 소멸 여부
  section: "gap" | "eul" // 갑구/을구
  rank: number // 순위
  note?: string
}

export interface TenantInfo {
  id: string
  moveInDate: string
  deposit: number
  monthlyRent?: number
  hasOppositionRight: boolean // 대항력 여부
  willBeAssumed: boolean // 인수 여부
  priority: "SENIOR" | "JUNIOR" // 선순위/후순위
}

export interface PriceHistoryItem {
  date: string
  round: number
  minimumBidPrice: number
  bidCount: number
  highestBid?: number
  result: "FAILED" | "SOLD" | "CANCELLED"
}

// AI 분석 결과
export interface AIAnalysisResult {
  safetyScore: number
  investmentScore: number
  summary: string
  riskPoints: string[]
  safePoints: string[]
  baselineRightExplanation: string
  recommendedBidPrice: {
    min: number
    max: number
    optimal: number
  }
  totalInvestmentCost: {
    bidPrice: number
    acquisitionTax: number
    registrationTax: number
    judicialFee: number
    assumedDeposits: number
    otherCosts: number
    total: number
  }
  recommendation: "HIGHLY_RECOMMENDED" | "RECOMMENDED" | "CAUTION" | "NOT_RECOMMENDED"
  detailedAnalysis: {
    rightsAnalysis: string
    tenantAnalysis: string
    marketAnalysis: string
    locationAnalysis: string
  }
}

// 등기부등본 분석
export interface RegistryDocument {
  id: string
  fileName: string
  uploadedAt: string
  status: "PENDING" | "ANALYZING" | "COMPLETED" | "FAILED"
  propertyAddress?: string
  analysisResult?: RegistryAnalysisResult
}

export interface RegistryAnalysisResult {
  propertyInfo: {
    address: string
    propertyType: string
    area: string
    landArea?: string
    structure?: string
  }
  ownerInfo: {
    name: string
    share: string
    acquisitionDate: string
    acquisitionCause: string
  }
  gapSection: RightItem[] // 갑구
  eulSection: RightItem[] // 을구
  baselineRight?: RightItem
  safetyScore: number
  riskSummary: string[]
  safeSummary: string[]
}

// 입찰가 계산기
export interface BidCalculationRequest {
  appraisalPrice: number
  minimumBidPrice: number
  marketPrice?: number
  assumedDeposits: number
  assumedRights: number
}

export interface BidCalculationResult {
  recommendedBidRange: {
    min: number
    max: number
    optimal: number
  }
  totalInvestmentCost: {
    bidPrice: number
    acquisitionTax: number
    registrationTax: number
    judicialFee: number
    assumedDeposits: number
    otherCosts: number
    total: number
  }
  expectedReturn: {
    rentalYield: number
    capitalGain: number
    totalReturn: number
  }
  breakdownByBidPrice: Array<{
    bidPrice: number
    totalCost: number
    expectedProfit: number
    roi: number
  }>
}

// 관심 목록
export interface FavoriteItem {
  id: string
  propertyId: string
  property: Property
  addedAt: string
  memo?: string
  alertEnabled: boolean
}

// 알림
export interface Notification {
  id: string
  type: "AUCTION_REMINDER" | "PRICE_CHANGE" | "NEW_MATCH" | "SYSTEM" | "ANALYSIS_COMPLETE"
  title: string
  message: string
  propertyId?: string
  read: boolean
  createdAt: string
}

// AI 챗봇
export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
  attachments?: ChatAttachment[]
  cards?: ChatCard[]
  suggestions?: string[]
}

export interface ChatAttachment {
  type: "property" | "document" | "image"
  id: string
  data: any
}

export interface ChatCard {
  type: "property" | "analysis" | "tip" | "warning" | "calculation"
  data: any
}

export interface ChatSession {
  id: string
  userId: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// 네이버 부동산 연동
export interface NaverLandArticle {
  articleNo: string
  articleName: string
  realEstateTypeName: string
  tradeTypeName: string
  floorInfo: string
  dealOrWarrantPrc: string
  areaName: string
  area1: number
  area2: number
  direction: string
  articleConfirmYmd: string
  articleFeatureDesc?: string
  tagList: string[]
  buildingName?: string
  cpName: string
  cpPcArticleUrl?: string
  latitude?: number
  longitude?: number
}

export interface NaverLandComplex {
  complexNo: number
  complexName: string
  cortarAddress: string
  detailAddress?: string
  totalHouseholdCount: number
  totalBuildingCount: number
  highFloor: number
  lowFloor: number
  useApproveYmd: string
  latitude: number
  longitude: number
}

// 검색 필터
export interface PropertySearchFilter {
  location?: string
  propertyTypes?: string[]
  priceMin?: number
  priceMax?: number
  areaMin?: number
  areaMax?: number
  riskScoreMin?: number
  auctionDateFrom?: string
  auctionDateTo?: string
  failedCountMin?: number
  failedCountMax?: number
  courts?: string[]
  sortBy?: "price" | "date" | "riskScore" | "failedCount"
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

// 지역 코드
export interface RegionCode {
  code: string
  name: string
  level: 1 | 2 | 3 // 시/도, 구/군, 동
  parentCode?: string
  children?: RegionCode[]
}
