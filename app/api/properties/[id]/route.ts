import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse, PropertyDetail } from "@/lib/types/api"

// Mock data import
import { auctionProperties } from "@/lib/mock-data"

// GET: 매물 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const property = auctionProperties.find(p => p.id === id)

    if (!property) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "매물을 찾을 수 없습니다",
        },
      }, { status: 404 })
    }

    // 상세 정보 추가 (실제로는 DB에서 조회)
    const propertyDetail: PropertyDetail = {
      ...property,
      coordinates: { lat: 37.5665, lng: 126.9780 }, // Mock coordinates
      status: "SCHEDULED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: "경매 물건 상세 설명",
      buildYear: 2015,
      floor: "5층",
      totalFloors: 20,
      direction: "남향",
      rights: [
        {
          id: "r1",
          type: "근저당권",
          registrationDate: "2020-03-15",
          holder: "○○은행",
          amount: 300000000,
          isBaselineRight: true,
          willBeDeleted: true,
          section: "eul",
          rank: 1,
        },
        {
          id: "r2",
          type: "전세권",
          registrationDate: "2021-06-20",
          holder: "김○○",
          amount: 200000000,
          isBaselineRight: false,
          willBeDeleted: true,
          section: "eul",
          rank: 2,
        },
      ],
      tenants: [
        {
          id: "t1",
          moveInDate: "2021-07-01",
          deposit: 200000000,
          hasOppositionRight: false,
          willBeAssumed: false,
          priority: "JUNIOR",
        },
      ],
      priceHistory: [
        {
          date: "2024-01-15",
          round: 1,
          minimumBidPrice: property.appraisalPrice,
          bidCount: 0,
          result: "FAILED",
        },
        {
          date: "2024-02-15",
          round: 2,
          minimumBidPrice: Math.floor(property.appraisalPrice * 0.8),
          bidCount: 0,
          result: "FAILED",
        },
      ],
      aiAnalysis: {
        safetyScore: property.riskScore,
        investmentScore: 78,
        summary: "권리관계가 비교적 깨끗하고 시세 대비 저렴한 물건입니다.",
        riskPoints: [
          "유찰 횟수가 많아 잔금 대출에 주의가 필요합니다",
        ],
        safePoints: [
          "말소기준권리 이후 설정된 권리만 있어 안전합니다",
          "임차인 보증금이 낙찰 시 소멸됩니다",
        ],
        baselineRightExplanation: "2020년 3월 설정된 ○○은행 근저당권이 말소기준권리입니다. 이후 설정된 전세권은 낙찰 시 자동 소멸됩니다.",
        recommendedBidPrice: {
          min: Math.floor(property.minimumBidPrice * 0.95),
          max: Math.floor(property.minimumBidPrice * 1.1),
          optimal: property.minimumBidPrice,
        },
        totalInvestmentCost: {
          bidPrice: property.minimumBidPrice,
          acquisitionTax: Math.floor(property.minimumBidPrice * 0.046),
          registrationTax: Math.floor(property.minimumBidPrice * 0.02),
          judicialFee: 500000,
          assumedDeposits: 0,
          otherCosts: 1000000,
          total: Math.floor(property.minimumBidPrice * 1.076 + 1500000),
        },
        recommendation: "RECOMMENDED",
        detailedAnalysis: {
          rightsAnalysis: "근저당권과 전세권이 설정되어 있으나, 모두 말소기준권리 이후 설정되어 낙찰 시 소멸됩니다.",
          tenantAnalysis: "임차인이 있으나 대항력이 없어 명도에 큰 어려움은 없을 것으로 예상됩니다.",
          marketAnalysis: "해당 지역 시세 대비 약 30% 저렴한 가격으로 투자 매력이 있습니다.",
          locationAnalysis: "지하철역 도보 10분, 학군 양호, 편의시설 접근성 좋음",
        },
      },
    } as PropertyDetail

    return NextResponse.json<ApiResponse<PropertyDetail>>({
      success: true,
      data: propertyDetail,
    })
  } catch (error) {
    console.error("Property Detail API Error:", error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "매물 조회 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}

// PUT: 매물 수정 (관리자용)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json()

    // TODO: 인증 확인
    // TODO: 입력 검증
    // TODO: DB 업데이트

    return NextResponse.json<ApiResponse<PropertyDetail>>({
      success: true,
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString(),
      } as PropertyDetail,
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "매물 수정 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}

// DELETE: 매물 삭제 (관리자용)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // TODO: 인증 확인
    // TODO: DB 삭제

    return NextResponse.json<ApiResponse<{ deleted: boolean }>>({
      success: true,
      data: { deleted: true },
    })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "매물 삭제 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}
