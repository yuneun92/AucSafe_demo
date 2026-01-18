"""
Bid Calculator Schemas
"""
from pydantic import BaseModel
from typing import Optional, List


class BidCalculationRequest(BaseModel):
    appraisal_price: int  # 감정가
    minimum_bid_price: int  # 최저입찰가
    market_price: Optional[int] = None  # 시세
    assumed_deposits: int = 0  # 인수 보증금
    assumed_rights: int = 0  # 인수 권리금액
    expected_rent: Optional[int] = None  # 예상 월세


class CostBreakdown(BaseModel):
    bid_price: int
    acquisition_tax: int  # 취득세
    registration_tax: int  # 등록면허세
    judicial_fee: int  # 법무사 비용
    assumed_deposits: int  # 인수 보증금
    other_costs: int  # 기타 비용
    total: int


class RecommendedBidRange(BaseModel):
    min: int
    max: int
    optimal: int


class ROISimulationItem(BaseModel):
    bid_price: int
    total_cost: int
    expected_profit: int
    roi_percentage: float


class BidCalculationResponse(BaseModel):
    recommended_bid_range: RecommendedBidRange
    total_investment_cost: CostBreakdown
    roi_simulation: List[ROISimulationItem]
