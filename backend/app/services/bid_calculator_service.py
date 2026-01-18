"""
Bid Calculator Service
"""
from typing import List
from app.schemas.bid_calculator import (
    BidCalculationRequest,
    BidCalculationResponse,
    CostBreakdown,
    RecommendedBidRange,
    ROISimulationItem,
)


class BidCalculatorService:
    # 세율 상수
    ACQUISITION_TAX_RATE = 0.046  # 취득세 4.6%
    REGISTRATION_TAX_RATE = 0.02  # 등록면허세 2%
    JUDICIAL_FEE_BASE = 300000  # 법무사 기본 비용
    JUDICIAL_FEE_RATE = 0.001  # 법무사 요율 0.1%
    STAMP_TAX = 150000  # 인지세
    OTHER_COSTS = 500000  # 기타 비용

    def calculate(self, request: BidCalculationRequest) -> BidCalculationResponse:
        """입찰가 계산"""
        # 권장 입찰가 범위 계산
        optimal_bid = request.minimum_bid_price
        min_bid = int(optimal_bid * 0.95)
        max_bid = int(optimal_bid * 1.15)

        if request.market_price:
            # 시세 대비 조정
            max_bid = min(max_bid, int(request.market_price * 0.85))

        recommended_range = RecommendedBidRange(
            min=min_bid,
            max=max_bid,
            optimal=optimal_bid,
        )

        # 총 투자비용 계산 (최적 입찰가 기준)
        cost_breakdown = self._calculate_costs(optimal_bid, request)

        # ROI 시뮬레이션
        roi_simulation = self._simulate_roi(request, min_bid, max_bid)

        return BidCalculationResponse(
            recommended_bid_range=recommended_range,
            total_investment_cost=cost_breakdown,
            roi_simulation=roi_simulation,
        )

    def _calculate_costs(
        self, bid_price: int, request: BidCalculationRequest
    ) -> CostBreakdown:
        """비용 상세 계산"""
        acquisition_tax = int(bid_price * self.ACQUISITION_TAX_RATE)
        registration_tax = int(bid_price * self.REGISTRATION_TAX_RATE)
        judicial_fee = self.JUDICIAL_FEE_BASE + int(bid_price * self.JUDICIAL_FEE_RATE)
        other_costs = self.STAMP_TAX + self.OTHER_COSTS

        total = (
            bid_price
            + acquisition_tax
            + registration_tax
            + judicial_fee
            + request.assumed_deposits
            + other_costs
        )

        return CostBreakdown(
            bid_price=bid_price,
            acquisition_tax=acquisition_tax,
            registration_tax=registration_tax,
            judicial_fee=judicial_fee,
            assumed_deposits=request.assumed_deposits,
            other_costs=other_costs,
            total=total,
        )

    def _simulate_roi(
        self, request: BidCalculationRequest, min_bid: int, max_bid: int
    ) -> List[ROISimulationItem]:
        """다양한 입찰가에 대한 ROI 시뮬레이션"""
        simulations = []
        step = (max_bid - min_bid) // 5

        for bid_price in range(min_bid, max_bid + 1, max(step, 1000000)):
            costs = self._calculate_costs(bid_price, request)

            # 예상 수익 계산 (시세 - 총비용)
            expected_sell_price = request.market_price or int(
                request.appraisal_price * 0.9
            )
            expected_profit = expected_sell_price - costs.total

            # ROI 계산
            roi = (expected_profit / costs.total) * 100 if costs.total > 0 else 0

            simulations.append(
                ROISimulationItem(
                    bid_price=bid_price,
                    total_cost=costs.total,
                    expected_profit=expected_profit,
                    roi_percentage=round(roi, 2),
                )
            )

        return simulations

    def simulate_roi(self, request: BidCalculationRequest) -> dict:
        """상세 ROI 시뮬레이션"""
        min_bid = int(request.minimum_bid_price * 0.9)
        max_bid = int(request.minimum_bid_price * 1.2)

        simulations = self._simulate_roi(request, min_bid, max_bid)

        # 월세 수익률 계산 (임대 시)
        rental_simulations = []
        if request.expected_rent:
            for sim in simulations:
                annual_rent = request.expected_rent * 12
                rental_yield = (annual_rent / sim.total_cost) * 100
                rental_simulations.append(
                    {
                        "bid_price": sim.bid_price,
                        "total_cost": sim.total_cost,
                        "annual_rent": annual_rent,
                        "rental_yield_percentage": round(rental_yield, 2),
                    }
                )

        return {
            "capital_gain_simulation": simulations,
            "rental_yield_simulation": rental_simulations,
        }
