import { NextRequest, NextResponse } from "next/server"
import type { ApiResponse, NaverLandArticle, NaverLandComplex } from "@/lib/types/api"

const NAVER_LAND_BASE = "https://new.land.naver.com"

// 네이버 부동산 API 호출을 위한 헤더
function getNaverHeaders(bearerToken?: string) {
  return {
    "accept": "application/json, text/plain, */*",
    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
    "authorization": bearerToken ? `Bearer ${bearerToken}` : "",
    "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "referer": "https://new.land.naver.com/",
  }
}

// 단지 검색
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const action = searchParams.get("action")
  const bearerToken = request.headers.get("x-naver-token") || process.env.NAVER_LAND_TOKEN

  try {
    switch (action) {
      case "search": {
        const keyword = searchParams.get("keyword")
        if (!keyword) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: "MISSING_KEYWORD", message: "검색어가 필요합니다" },
          }, { status: 400 })
        }
        const result = await searchComplex(keyword, bearerToken)
        return NextResponse.json<ApiResponse<any>>({ success: true, data: result })
      }

      case "complex": {
        const complexNo = searchParams.get("complexNo")
        if (!complexNo) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: "MISSING_COMPLEX_NO", message: "단지번호가 필요합니다" },
          }, { status: 400 })
        }
        const result = await getComplexInfo(parseInt(complexNo), bearerToken)
        return NextResponse.json<ApiResponse<NaverLandComplex>>({ success: true, data: result })
      }

      case "articles": {
        const complexNo = searchParams.get("complexNo")
        const page = parseInt(searchParams.get("page") || "1")
        const tradeType = searchParams.get("tradeType") || "A1"

        if (!complexNo) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: "MISSING_COMPLEX_NO", message: "단지번호가 필요합니다" },
          }, { status: 400 })
        }

        const result = await getArticlesByComplex(parseInt(complexNo), page, tradeType, bearerToken)
        return NextResponse.json<ApiResponse<NaverLandArticle[]>>({
          success: true,
          data: result.articleList || [],
          meta: {
            page,
            total: result.totalCount || 0,
            hasMore: result.isMoreData || false,
          },
        })
      }

      case "region": {
        const cortarNo = searchParams.get("cortarNo")
        const page = parseInt(searchParams.get("page") || "1")
        const tradeType = searchParams.get("tradeType") || "A1"
        const realEstateType = searchParams.get("realEstateType") || "APT"

        if (!cortarNo) {
          return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: { code: "MISSING_CORTAR_NO", message: "지역코드가 필요합니다" },
          }, { status: 400 })
        }

        const result = await getArticlesByRegion(cortarNo, page, tradeType, realEstateType, bearerToken)
        return NextResponse.json<ApiResponse<NaverLandArticle[]>>({
          success: true,
          data: result.articleList || [],
          meta: {
            page,
            total: result.totalCount || 0,
            hasMore: result.isMoreData || false,
          },
        })
      }

      default:
        return NextResponse.json<ApiResponse<null>>({
          success: false,
          error: { code: "INVALID_ACTION", message: "지원하지 않는 액션입니다" },
        }, { status: 400 })
    }
  } catch (error) {
    console.error("Naver Land API Error:", error)
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: {
        code: "API_ERROR",
        message: error instanceof Error ? error.message : "API 호출 중 오류가 발생했습니다",
      },
    }, { status: 500 })
  }
}

// 단지 검색
async function searchComplex(keyword: string, token?: string) {
  const url = `${NAVER_LAND_BASE}/api/search?keyword=${encodeURIComponent(keyword)}`
  const response = await fetch(url, { headers: getNaverHeaders(token) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// 단지 정보 조회
async function getComplexInfo(complexNo: number, token?: string) {
  const url = `${NAVER_LAND_BASE}/api/complexes/${complexNo}`
  const response = await fetch(url, { headers: getNaverHeaders(token) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// 단지별 매물 조회
async function getArticlesByComplex(
  complexNo: number,
  page: number,
  tradeType: string,
  token?: string
) {
  const params = new URLSearchParams({
    realEstateType: "APT:ABYG:JGC:PRE",
    tradeType,
    tag: "::::::::",
    rentPriceMin: "0",
    rentPriceMax: "900000000",
    priceMin: "0",
    priceMax: "900000000",
    areaMin: "0",
    areaMax: "900000000",
    showArticle: "false",
    sameAddressGroup: "true",
    priceType: "RETAIL",
    page: page.toString(),
    complexNo: complexNo.toString(),
    type: "list",
    order: "prc",
  })

  const url = `${NAVER_LAND_BASE}/api/articles/complex/${complexNo}?${params}`
  const response = await fetch(url, { headers: getNaverHeaders(token) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// 지역별 매물 조회
async function getArticlesByRegion(
  cortarNo: string,
  page: number,
  tradeType: string,
  realEstateType: string,
  token?: string
) {
  const params = new URLSearchParams({
    cortarNo,
    page: page.toString(),
    tradeType,
    realEstateType,
  })

  const url = `${NAVER_LAND_BASE}/api/articles?${params}`
  const response = await fetch(url, { headers: getNaverHeaders(token) })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
