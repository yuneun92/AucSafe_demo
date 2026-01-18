// 모의 경매 매물 데이터
export interface AuctionProperty {
  id: string
  caseNumber: string
  title: string
  address: string
  propertyType: string
  area: string
  appraisalPrice: number
  minimumBidPrice: number
  marketPrice: number
  auctionDate: string
  bidCount: number
  failedCount: number
  riskScore: number
  recommendScore: number
  priceDropRate: number
  occupancyStatus: string
  rights: string[]
  location: string
  court: string
  coordinates: { lat: number; lng: number }
  image: string
  images: string[]
  description: string
  registryIssues: string[]
  nearbyFacilities: string[]
  priceHistory: { date: string; price: number }[]
}

export const auctionProperties: AuctionProperty[] = [
  {
    id: "1",
    caseNumber: "2024타경12345",
    title: "역삼동 OO아파트 102동",
    address: "서울시 강남구 역삼동 123-45 OO아파트 102동 1502호",
    propertyType: "아파트",
    area: "84.5㎡",
    appraisalPrice: 1250000000,
    minimumBidPrice: 875000000,
    marketPrice: 1400000000,
    auctionDate: "2025-02-15",
    bidCount: 3,
    failedCount: 2,
    riskScore: 85,
    recommendScore: 92,
    priceDropRate: 30,
    occupancyStatus: "공실",
    rights: ["근저당권", "전세권"],
    location: "서울 강남구",
    court: "서울중앙지방법원",
    coordinates: { lat: 37.5012, lng: 127.0396 },
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop"],
    description: "역삼역 도보 5분 거리 프리미엄 아파트. 남향 배치로 채광 우수.",
    registryIssues: ["말소기준권리 이후 전입 세입자 없음"],
    nearbyFacilities: ["역삼역 500m", "스타벅스 100m", "이마트 800m"],
    priceHistory: [
      { date: "2025-01", price: 1250000000 },
      { date: "2025-02", price: 1000000000 },
      { date: "2025-03", price: 875000000 },
    ],
  },
  {
    id: "2",
    caseNumber: "2024타경23456",
    title: "상암동 OO오피스텔",
    address: "서울시 마포구 상암동 456-78 OO오피스텔 801호",
    propertyType: "오피스텔",
    area: "42.3㎡",
    appraisalPrice: 380000000,
    minimumBidPrice: 266000000,
    marketPrice: 420000000,
    auctionDate: "2025-02-20",
    bidCount: 5,
    failedCount: 4,
    riskScore: 65,
    recommendScore: 78,
    priceDropRate: 30,
    occupancyStatus: "임차인 거주",
    rights: ["근저당권", "가압류"],
    location: "서울 마포구",
    court: "서울서부지방법원",
    coordinates: { lat: 37.5791, lng: 126.8893 },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"],
    description: "디지털미디어시티 인근 역세권 오피스텔. 투자 수익률 높음.",
    registryIssues: ["임차인 대항력 확인 필요", "가압류 말소 가능성 높음"],
    nearbyFacilities: ["DMC역 300m", "CGV 500m", "홈플러스 1km"],
    priceHistory: [
      { date: "2025-01", price: 380000000 },
      { date: "2025-02", price: 320000000 },
      { date: "2025-03", price: 266000000 },
    ],
  },
  {
    id: "3",
    caseNumber: "2024타경34567",
    title: "매탄동 OO빌라",
    address: "경기도 수원시 영통구 매탄동 789-12 OO빌라 301호",
    propertyType: "빌라",
    area: "68.2㎡",
    appraisalPrice: 285000000,
    minimumBidPrice: 199500000,
    marketPrice: 310000000,
    auctionDate: "2025-02-25",
    bidCount: 2,
    failedCount: 1,
    riskScore: 78,
    recommendScore: 85,
    priceDropRate: 30,
    occupancyStatus: "공실",
    rights: ["근저당권"],
    location: "경기 수원시",
    court: "수원지방법원",
    coordinates: { lat: 37.2636, lng: 127.0286 },
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400&h=300&fit=crop"],
    description: "삼성전자 인근 실거주 적합 물건. 주차 2대 가능.",
    registryIssues: ["권리관계 깨끗함"],
    nearbyFacilities: ["영통역 700m", "삼성전자 1km", "이마트 500m"],
    priceHistory: [
      { date: "2025-01", price: 285000000 },
      { date: "2025-02", price: 228000000 },
      { date: "2025-03", price: 199500000 },
    ],
  },
  {
    id: "4",
    caseNumber: "2024타경45678",
    title: "잠실동 OO아파트 105동",
    address: "서울시 송파구 잠실동 234-56 OO아파트 105동 2001호",
    propertyType: "아파트",
    area: "112.8㎡",
    appraisalPrice: 1850000000,
    minimumBidPrice: 1295000000,
    marketPrice: 2100000000,
    auctionDate: "2025-03-01",
    bidCount: 7,
    failedCount: 0,
    riskScore: 92,
    recommendScore: 95,
    priceDropRate: 30,
    occupancyStatus: "공실",
    rights: ["근저당권"],
    location: "서울 송파구",
    court: "서울동부지방법원",
    coordinates: { lat: 37.5113, lng: 127.0858 },
    image: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=400&h=300&fit=crop"],
    description: "잠실 롯데월드타워 조망 가능한 프리미엄 대형 평수.",
    registryIssues: ["권리관계 깨끗함", "명도 소송 진행 중"],
    nearbyFacilities: ["잠실역 400m", "롯데월드 600m", "석촌호수 800m"],
    priceHistory: [
      { date: "2025-01", price: 1850000000 },
      { date: "2025-02", price: 1480000000 },
      { date: "2025-03", price: 1295000000 },
    ],
  },
  {
    id: "5",
    caseNumber: "2024타경56789",
    title: "성수동 OO지식산업센터",
    address: "서울시 성동구 성수동 567-89 OO지식산업센터 1205호",
    propertyType: "상가",
    area: "56.4㎡",
    appraisalPrice: 520000000,
    minimumBidPrice: 364000000,
    marketPrice: 580000000,
    auctionDate: "2025-03-05",
    bidCount: 4,
    failedCount: 3,
    riskScore: 55,
    recommendScore: 72,
    priceDropRate: 30,
    occupancyStatus: "임차인 거주",
    rights: ["근저당권", "임차권"],
    location: "서울 성동구",
    court: "서울동부지방법원",
    coordinates: { lat: 37.5443, lng: 127.0557 },
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"],
    description: "성수 IT밸리 핵심 위치. 스타트업 임대 수요 높음.",
    registryIssues: ["임차인 보증금 반환 의무 승계"],
    nearbyFacilities: ["성수역 200m", "서울숲 500m", "카페거리 300m"],
    priceHistory: [
      { date: "2025-01", price: 520000000 },
      { date: "2025-02", price: 416000000 },
      { date: "2025-03", price: 364000000 },
    ],
  },
  {
    id: "6",
    caseNumber: "2024타경67890",
    title: "송도동 OO아파트",
    address: "인천시 연수구 송도동 123-45 OO아파트 2003호",
    propertyType: "아파트",
    area: "95.2㎡",
    appraisalPrice: 720000000,
    minimumBidPrice: 504000000,
    marketPrice: 800000000,
    auctionDate: "2025-03-10",
    bidCount: 1,
    failedCount: 0,
    riskScore: 88,
    recommendScore: 88,
    priceDropRate: 30,
    occupancyStatus: "공실",
    rights: ["근저당권"],
    location: "인천 연수구",
    court: "인천지방법원",
    coordinates: { lat: 37.3815, lng: 126.6564 },
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop",
    images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop"],
    description: "송도 국제업무지구 인근, 바다 조망 가능한 고층 아파트.",
    registryIssues: ["권리관계 깨끗함"],
    nearbyFacilities: ["인천대입구역 400m", "센트럴파크 600m", "트리플스트리트 500m"],
    priceHistory: [
      { date: "2025-01", price: 720000000 },
      { date: "2025-02", price: 576000000 },
      { date: "2025-03", price: 504000000 },
    ],
  },
]

export interface InvestorProfile {
  riskTolerance: "conservative" | "moderate" | "aggressive"
  investmentGoal: "residence" | "rental" | "resale"
  budget: { min: number; max: number }
  preferredAreas: string[]
  preferredTypes: string[]
  experienceLevel: "beginner" | "intermediate" | "expert"
}

export const defaultProfile: InvestorProfile = {
  riskTolerance: "moderate",
  investmentGoal: "rental",
  budget: { min: 200000000, max: 800000000 },
  preferredAreas: ["강남구", "마포구", "송파구"],
  preferredTypes: ["아파트", "오피스텔"],
  experienceLevel: "beginner",
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  suggestions?: string[]
}

export const sampleChatHistory: ChatMessage[] = [
  {
    id: "1",
    role: "assistant",
    content: "안녕하세요! AucSafe AI 어시스턴트입니다. 부동산 경매에 대해 궁금한 점이나 원하시는 조건을 말씀해 주세요.",
    timestamp: new Date(),
    suggestions: ["5억 이하 강남 아파트 찾아줘", "초보자가 피해야 할 경매 물건은?", "수익률 좋은 오피스텔 추천해줘"],
  },
]
