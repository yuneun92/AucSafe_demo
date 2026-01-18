"""
Bid Calculator Endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.bid_calculator import BidCalculationRequest, BidCalculationResponse
from app.services.bid_calculator_service import BidCalculatorService

router = APIRouter()


@router.post("/calculate", response_model=BidCalculationResponse)
async def calculate_bid(
    request: BidCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    입찰가 계산

    감정가, 최저입찰가, 시세, 인수 보증금 등을 바탕으로
    적정 입찰가 범위와 총 투자비용을 계산합니다.
    """
    service = BidCalculatorService()
    result = service.calculate(request)
    return result


@router.post("/roi-simulation")
async def simulate_roi(
    request: BidCalculationRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    수익률 시뮬레이션

    다양한 입찰가에 따른 예상 수익률을 시뮬레이션합니다.
    """
    service = BidCalculatorService()
    result = service.simulate_roi(request)
    return result


@router.get("/tax-rates")
async def get_tax_rates():
    """
    현재 적용되는 세율 정보
    """
    return {
        "acquisition_tax": {
            "rate": 0.046,
            "description": "취득세 4.6% (지방교육세, 농어촌특별세 포함)",
        },
        "registration_tax": {
            "rate": 0.02,
            "description": "등록면허세 2%",
        },
        "judicial_scrivener_fee": {
            "base": 300000,
            "rate": 0.001,
            "description": "법무사 비용 (기본 30만원 + 낙찰가의 0.1%)",
        },
        "stamp_tax": {
            "amount": 150000,
            "description": "인지세 15만원",
        },
    }
