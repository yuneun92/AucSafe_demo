import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse, Property, PropertySearchFilter } from "@/lib/types/api"

// Mock data import - 실제 구현 시 DB 연동
import { auctionProperties } from "@/lib/mock-data"

// GET: 매물 목록 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // 필터 파라미터 파싱
  const filter: PropertySearchFilter = {
    location: searchParams.get("location") || undefined,
    propertyTypes: searchParams.get("propertyTypes")?.split(",") || undefined,
    priceMin: searchParams.get("priceMin") ? parseInt(searchParams.get("priceMin")!) : undefined,
    priceMax: searchParams.get("priceMax") ? parseInt(searchParams.get("priceMax")!) : undefined,
    areaMin: searchParams.get("areaMin") ? parseInt(searchParams.get("areaMin")!) : undefined,
    areaMax: searchParams.get("areaMax") ? parseInt(searchParams.get("areaMax")!) : undefined,
    riskScoreMin: searchParams.get("riskScoreMin") ? parseInt(searchParams.get("riskScoreMin")!) : undefined,
    auctionDateFrom: searchParams.get("auctionDateFrom") || undefined,
    auctionDateTo: searchParams.get("auctionDateTo") || undefined,
    courts: searchParams.get("courts")?.split(",") || undefined,
    sortBy: (searchParams.get("sortBy") as PropertySearchFilter["sortBy"]) || "date",
    sortOrder: (searchParams.get("sortOrder") as PropertySearchFilter["sortOrder"]) || "desc",
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "20"),
  }

  try {
    // 필터링 적용
    let filtered = [...auctionProperties]

    if (filter.location) {
      filtered = filtered.filter(p =>
        p.location?.includes(filter.location!) || p.address?.includes(filter.location!)
      )
    }

    if (filter.propertyTypes?.length) {
      filtered = filtered.filter(p => filter.propertyTypes!.includes(p.propertyType))
    }

    if (filter.priceMin !== undefined) {
      filtered = filtered.filter(p => p.minimumBidPrice >= filter.priceMin!)
    }

    if (filter.priceMax !== undefined) {
      filtered = filtered.filter(p => p.minimumBidPrice <= filter.priceMax!)
    }

    if (filter.riskScoreMin !== undefined) {
      filtered = filtered.filter(p => p.riskScore >= filter.riskScoreMin!)
    }

    if (filter.courts?.length) {
      filtered = filtered.filter(p => filter.courts!.includes(p.court))
    }

    // 정렬
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filter.sortBy) {
        case "price":
          comparison = a.minimumBidPrice - b.minimumBidPrice
          break
        case "riskScore":
          comparison = a.riskScore - b.riskScore
          break
        case "failedCount":
          comparison = a.failedCount - b.failedCount
          break
        case "date":
        default:
          comparison = new Date(a.auctionDate).getTime() - new Date(b.auctionDate).getTime()
      }
      return filter.sortOrder === "desc" ? -comparison : comparison
    })

    // 페이지네이션
    const total = filtered.length
    const page = filter.page || 1
    const limit = filter.limit || 20
    const startIndex = (page - 1) * limit
    const paginatedData = filtered.slice(startIndex, startIndex + limit)

    return NextResponse.json<ApiResponse<Property[]>>({
      success: true,
      data: paginatedData as unknown as Property[],
      meta: {
        page,
        limit,
        total,
        hasMore: startIndex + limit < total,
      },
    })
  } catch (error) {
    console.error("Properties API Error:", error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "매물 조회 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}

// POST: 매물 등록 (관리자용)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: 인증 확인
    // TODO: 입력 검증
    // TODO: DB 저장

    return NextResponse.json<ApiResponse<Property>>({
      success: true,
      data: {
        id: `prop-${Date.now()}`,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "매물 등록 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}
