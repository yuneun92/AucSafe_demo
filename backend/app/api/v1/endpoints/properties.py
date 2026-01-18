"""
Property Endpoints
매물 조회, 검색, 생성, 수정, 삭제 API
"""
from math import ceil
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_user
from app.db.session import get_db
from app.schemas.property import (
    PropertyResponse,
    PropertyDetailResponse,
    PropertySearchParams,
    PropertyCreate,
    PropertyUpdate,
    PropertyListResponse,
    RightsAnalysisResponse,
)
from app.services.property_service import PropertyService

router = APIRouter()


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    location: Optional[str] = Query(None, description="지역 필터 (예: 서울, 강남구)"),
    property_types: Optional[str] = Query(None, description="매물 유형 (콤마 구분: 아파트,오피스텔)"),
    price_min: Optional[int] = Query(None, ge=0, description="최소 가격 (원)"),
    price_max: Optional[int] = Query(None, ge=0, description="최대 가격 (원)"),
    area_min: Optional[int] = Query(None, ge=0, description="최소 면적 (평)"),
    area_max: Optional[int] = Query(None, ge=0, description="최대 면적 (평)"),
    risk_score_min: Optional[int] = Query(None, ge=0, le=100, description="최소 안전점수 (0-100)"),
    auction_date_from: Optional[str] = Query(None, description="경매 시작일 (YYYY-MM-DD)"),
    auction_date_to: Optional[str] = Query(None, description="경매 종료일 (YYYY-MM-DD)"),
    court: Optional[str] = Query(None, description="담당 법원"),
    sort_by: str = Query("date", description="정렬 기준 (date, price, area, risk_score, created)"),
    sort_order: str = Query("desc", description="정렬 순서 (asc, desc)"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(20, ge=1, le=100, description="페이지 크기"),
    db: AsyncSession = Depends(get_db),
):
    """
    매물 목록 조회 (필터링, 정렬, 페이징)

    다양한 조건으로 매물을 검색할 수 있습니다.

    - **location**: 지역 필터 (부분 일치 검색)
    - **property_types**: 매물 유형 필터 (아파트, 오피스텔, 빌라, 상가, 토지, 기타)
    - **price_min/max**: 최저입찰가 기준 가격 범위
    - **area_min/max**: 면적(평) 기준 범위
    - **risk_score_min**: 최소 안전점수 필터
    - **auction_date_from/to**: 경매 예정일 범위
    - **court**: 담당 법원 필터
    - **sort_by**: 정렬 기준
    - **sort_order**: 정렬 순서
    """
    service = PropertyService(db)
    params = PropertySearchParams(
        location=location,
        property_types=property_types.split(",") if property_types else None,
        price_min=price_min,
        price_max=price_max,
        area_min=area_min,
        area_max=area_max,
        risk_score_min=risk_score_min,
        auction_date_from=auction_date_from,
        auction_date_to=auction_date_to,
        court=court,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        limit=limit,
    )

    properties, total = await service.search_properties(params)

    return PropertyListResponse(
        items=properties,
        total=total,
        page=page,
        limit=limit,
        pages=ceil(total / limit) if total > 0 else 0,
    )


@router.get("/recommended", response_model=List[PropertyResponse])
async def get_recommended_properties(
    limit: int = Query(10, ge=1, le=50, description="반환할 매물 수"),
    db: AsyncSession = Depends(get_db),
):
    """
    AI 추천 매물 목록

    안전점수가 높고, 경매 예정일이 가까우며, 가격 메리트가 있는 매물을 추천합니다.
    """
    service = PropertyService(db)
    properties = await service.get_recommended(limit=limit)
    return properties


@router.get("/upcoming", response_model=List[PropertyResponse])
async def get_upcoming_auctions(
    days: int = Query(7, ge=1, le=30, description="앞으로 n일 이내의 경매"),
    limit: int = Query(20, ge=1, le=100, description="반환할 매물 수"),
    db: AsyncSession = Depends(get_db),
):
    """
    다가오는 경매 매물 조회

    지정된 기간 내에 경매 예정인 매물 목록을 반환합니다.
    """
    service = PropertyService(db)
    properties = await service.get_upcoming_auctions(days=days, limit=limit)
    return properties


@router.get("/case/{case_number}", response_model=PropertyDetailResponse)
async def get_property_by_case_number(
    case_number: str,
    db: AsyncSession = Depends(get_db),
):
    """
    사건번호로 매물 조회

    법원 사건번호를 통해 매물을 조회합니다.
    """
    service = PropertyService(db)
    property_detail = await service.get_by_case_number(case_number)
    if not property_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="해당 사건번호의 매물을 찾을 수 없습니다",
        )
    return property_detail


@router.get("/{property_id}", response_model=PropertyDetailResponse)
async def get_property_detail(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    매물 상세 조회

    매물 ID로 상세 정보를 조회합니다. 권리정보, 임차인 정보, AI 분석 결과를 포함합니다.
    """
    service = PropertyService(db)
    property_detail = await service.get_by_id(property_id)
    if not property_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매물을 찾을 수 없습니다",
        )
    return property_detail


@router.get("/{property_id}/rights-analysis", response_model=RightsAnalysisResponse)
async def get_rights_analysis(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    """
    매물 권리분석 조회

    말소기준권리, 인수/소멸 권리, 임차인 분석 등 상세 권리분석 결과를 반환합니다.

    반환 정보:
    - 말소기준권리 정보
    - 갑구/을구 권리 목록
    - 소멸/인수 권리 분류
    - 임차인 정보 및 인수해야 할 임차인
    - 위험/안전 요소 분석
    """
    service = PropertyService(db)
    analysis = await service.get_rights_analysis(property_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="권리분석 정보를 찾을 수 없습니다",
        )
    return analysis


@router.get("/{property_id}/similar", response_model=List[PropertyResponse])
async def get_similar_properties(
    property_id: str,
    limit: int = Query(5, ge=1, le=20, description="반환할 매물 수"),
    db: AsyncSession = Depends(get_db),
):
    """
    유사 매물 추천

    동일 지역, 유사 가격대, 동일 유형의 매물을 추천합니다.
    """
    service = PropertyService(db)
    properties = await service.get_similar(property_id, limit=limit)
    return properties


@router.post("", response_model=PropertyDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_property(
    data: PropertyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    매물 등록 (관리자 전용)

    새로운 매물을 등록합니다. 인증이 필요합니다.
    """
    service = PropertyService(db)
    try:
        property_detail = await service.create(data)
        return property_detail
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{property_id}", response_model=PropertyDetailResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    매물 수정 (관리자 전용)

    기존 매물 정보를 수정합니다. 인증이 필요합니다.
    """
    service = PropertyService(db)
    property_detail = await service.update(property_id, data)
    if not property_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매물을 찾을 수 없습니다",
        )
    return property_detail


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    매물 삭제 (관리자 전용)

    매물을 삭제합니다 (soft delete - 상태가 CANCELLED로 변경됨). 인증이 필요합니다.
    """
    service = PropertyService(db)
    success = await service.delete(property_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매물을 찾을 수 없습니다",
        )
    return None


@router.patch("/{property_id}/risk-score")
async def update_risk_score(
    property_id: str,
    risk_score: int = Query(..., ge=0, le=100, description="새로운 안전점수 (0-100)"),
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    """
    매물 안전점수 업데이트 (관리자 전용)

    AI 분석 결과에 따른 안전점수를 업데이트합니다. 인증이 필요합니다.
    """
    service = PropertyService(db)
    success = await service.update_risk_score(property_id, risk_score)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="매물을 찾을 수 없습니다",
        )
    return {"message": "안전점수가 업데이트되었습니다", "risk_score": risk_score}
