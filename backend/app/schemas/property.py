"""
Property Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class PropertySearchParams(BaseModel):
    location: Optional[str] = None
    property_types: Optional[List[str]] = None
    price_min: Optional[int] = None
    price_max: Optional[int] = None
    area_min: Optional[int] = None
    area_max: Optional[int] = None
    risk_score_min: Optional[int] = None
    auction_date_from: Optional[str] = None
    auction_date_to: Optional[str] = None
    court: Optional[str] = None
    sort_by: str = "date"
    sort_order: str = "desc"
    page: int = 1
    limit: int = 20


class PropertyResponse(BaseModel):
    id: str
    case_number: str
    title: str
    address: str
    location: str
    property_type: str
    area: str
    appraisal_price: int
    minimum_bid_price: int
    market_price: Optional[int] = None
    court: str
    auction_date: str
    failed_count: int
    risk_score: int
    image: Optional[str] = None


class RightResponse(BaseModel):
    id: str
    type: str
    registration_date: str
    holder: str
    amount: Optional[int] = None
    is_baseline_right: bool
    will_be_deleted: bool
    section: str
    rank: int


class TenantResponse(BaseModel):
    id: str
    move_in_date: str
    deposit: int
    monthly_rent: Optional[int] = None
    has_opposition_right: bool
    will_be_assumed: bool
    priority: str


class AIAnalysisResponse(BaseModel):
    safety_score: int
    investment_score: int
    summary: str
    risk_points: List[str]
    safe_points: List[str]
    baseline_right_explanation: str
    recommendation: str


class PropertyDetailResponse(PropertyResponse):
    images: List[str] = []
    description: Optional[str] = None
    build_year: Optional[int] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    direction: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rights: List[RightResponse] = []
    tenants: List[TenantResponse] = []
    ai_analysis: Optional[AIAnalysisResponse] = None


class PropertyCreate(BaseModel):
    """매물 생성 스키마"""
    case_number: str
    title: str
    address: str
    location: str
    property_type: str  # PropertyType enum value
    area: str
    area_size: float

    appraisal_price: int
    minimum_bid_price: int
    market_price: Optional[int] = None

    court: str
    auction_date: str  # YYYY-MM-DD format
    auction_round: Optional[int] = 1
    failed_count: Optional[int] = 0

    risk_score: Optional[int] = 50
    status: Optional[str] = None  # PropertyStatus enum value

    images: Optional[List[str]] = None
    image: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    description: Optional[str] = None
    build_year: Optional[int] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    direction: Optional[str] = None


class PropertyUpdate(BaseModel):
    """매물 수정 스키마"""
    title: Optional[str] = None
    address: Optional[str] = None
    location: Optional[str] = None
    property_type: Optional[str] = None
    area: Optional[str] = None
    area_size: Optional[float] = None

    appraisal_price: Optional[int] = None
    minimum_bid_price: Optional[int] = None
    market_price: Optional[int] = None

    court: Optional[str] = None
    auction_date: Optional[str] = None
    auction_round: Optional[int] = None
    failed_count: Optional[int] = None

    risk_score: Optional[int] = None
    status: Optional[str] = None

    images: Optional[List[str]] = None
    image: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    description: Optional[str] = None
    build_year: Optional[int] = None
    floor: Optional[str] = None
    total_floors: Optional[int] = None
    direction: Optional[str] = None


class PropertyListResponse(BaseModel):
    """매물 목록 응답 (페이징 포함)"""
    items: List[PropertyResponse]
    total: int
    page: int
    limit: int
    pages: int


class RightsAnalysisResponse(BaseModel):
    """권리분석 응답"""
    property_id: str
    baseline_right: Optional[dict] = None
    gap_rights: List[RightResponse] = []
    eul_rights: List[RightResponse] = []
    will_be_deleted: List[RightResponse] = []
    will_be_assumed: List[RightResponse] = []
    tenants: List[TenantResponse] = []
    assumed_tenants: List[TenantResponse] = []
    total_assumed_deposit: int = 0
    risk_factors: List[str] = []
    safe_factors: List[str] = []
    risk_score: int
