"""
PropertyService Unit Tests
매물 서비스 단위 테스트
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property, PropertyType, PropertyStatus
from app.schemas.property import PropertySearchParams, PropertyCreate, PropertyUpdate
from app.services.property_service import PropertyService


class TestSearchProperties:
    """매물 검색 테스트"""

    @pytest.mark.asyncio
    async def test_search_all_properties(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """모든 매물 검색 (기본)"""
        service = PropertyService(db_session)
        params = PropertySearchParams()

        properties, total = await service.search_properties(params)

        # CANCELLED 상태 제외하고 4개
        assert total == 4
        assert len(properties) == 4

    @pytest.mark.asyncio
    async def test_search_by_location(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """지역으로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(location="강남구")

        properties, total = await service.search_properties(params)

        assert total == 2
        for prop in properties:
            assert "강남구" in prop.location

    @pytest.mark.asyncio
    async def test_search_by_property_type(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """매물 유형으로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(property_types=["아파트"])

        properties, total = await service.search_properties(params)

        assert total == 2
        for prop in properties:
            assert prop.property_type == "아파트"

    @pytest.mark.asyncio
    async def test_search_by_price_range(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """가격 범위로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(price_min=500000000, price_max=700000000)

        properties, total = await service.search_properties(params)

        for prop in properties:
            assert 500000000 <= prop.minimum_bid_price <= 700000000

    @pytest.mark.asyncio
    async def test_search_by_area_range(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """면적 범위로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(area_min=15, area_max=25)

        properties, total = await service.search_properties(params)

        # 17.8평, 20평이 해당됨
        assert total >= 2

    @pytest.mark.asyncio
    async def test_search_by_risk_score(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """안전점수 최소값으로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(risk_score_min=80)

        properties, total = await service.search_properties(params)

        for prop in properties:
            assert prop.risk_score >= 80

    @pytest.mark.asyncio
    async def test_search_by_court(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """법원으로 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(court="성남")

        properties, total = await service.search_properties(params)

        assert total == 1
        assert "성남" in properties[0].court

    @pytest.mark.asyncio
    async def test_search_sort_by_price_asc(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """가격 오름차순 정렬"""
        service = PropertyService(db_session)
        params = PropertySearchParams(sort_by="price", sort_order="asc")

        properties, total = await service.search_properties(params)

        prices = [p.minimum_bid_price for p in properties]
        assert prices == sorted(prices)

    @pytest.mark.asyncio
    async def test_search_sort_by_risk_score_desc(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """안전점수 내림차순 정렬"""
        service = PropertyService(db_session)
        params = PropertySearchParams(sort_by="risk_score", sort_order="desc")

        properties, total = await service.search_properties(params)

        scores = [p.risk_score for p in properties]
        assert scores == sorted(scores, reverse=True)

    @pytest.mark.asyncio
    async def test_search_pagination(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """페이징 테스트"""
        service = PropertyService(db_session)

        # 첫 페이지 (2개씩)
        params = PropertySearchParams(page=1, limit=2)
        properties, total = await service.search_properties(params)
        assert len(properties) == 2
        assert total == 4

        # 두 번째 페이지
        params = PropertySearchParams(page=2, limit=2)
        properties, total = await service.search_properties(params)
        assert len(properties) == 2

    @pytest.mark.asyncio
    async def test_search_combined_filters(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """복합 필터 검색"""
        service = PropertyService(db_session)
        params = PropertySearchParams(
            location="서울",
            property_types=["아파트"],
            risk_score_min=80,
        )

        properties, total = await service.search_properties(params)

        for prop in properties:
            assert "서울" in prop.location
            assert prop.property_type == "아파트"
            assert prop.risk_score >= 80


class TestGetPropertyById:
    """매물 상세 조회 테스트"""

    @pytest.mark.asyncio
    async def test_get_property_by_id(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """ID로 매물 조회"""
        service = PropertyService(db_session)

        result = await service.get_by_id(str(sample_property.id))

        assert result is not None
        assert result.id == str(sample_property.id)
        assert result.case_number == sample_property.case_number
        assert result.title == sample_property.title

    @pytest.mark.asyncio
    async def test_get_property_by_id_not_found(self, db_session: AsyncSession):
        """존재하지 않는 ID로 조회"""
        service = PropertyService(db_session)

        result = await service.get_by_id(str(uuid4()))

        assert result is None

    @pytest.mark.asyncio
    async def test_get_property_by_invalid_id(self, db_session: AsyncSession):
        """잘못된 ID 형식으로 조회"""
        service = PropertyService(db_session)

        result = await service.get_by_id("invalid-uuid")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_property_with_rights_and_tenants(
        self, db_session: AsyncSession, sample_property_with_rights: Property
    ):
        """권리정보와 임차인 정보 포함 조회"""
        service = PropertyService(db_session)

        result = await service.get_by_id(str(sample_property_with_rights.id))

        assert result is not None
        assert len(result.rights) == 3
        assert len(result.tenants) == 2


class TestGetRecommended:
    """AI 추천 매물 테스트"""

    @pytest.mark.asyncio
    async def test_get_recommended_properties(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """추천 매물 조회"""
        service = PropertyService(db_session)

        properties = await service.get_recommended(limit=3)

        assert len(properties) <= 3
        # 안전점수 높은 순으로 정렬되어야 함
        if len(properties) >= 2:
            assert properties[0].risk_score >= properties[1].risk_score

    @pytest.mark.asyncio
    async def test_get_recommended_excludes_past_auctions(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """과거 경매는 추천에서 제외"""
        service = PropertyService(db_session)

        properties = await service.get_recommended(limit=10)

        for prop in properties:
            # SCHEDULED 상태이고 미래 경매만 포함
            auction_date = datetime.strptime(prop.auction_date, "%Y-%m-%d")
            assert auction_date >= datetime.utcnow().replace(
                hour=0, minute=0, second=0, microsecond=0
            )


class TestRightsAnalysis:
    """권리분석 테스트"""

    @pytest.mark.asyncio
    async def test_get_rights_analysis(
        self, db_session: AsyncSession, sample_property_with_rights: Property
    ):
        """권리분석 조회"""
        service = PropertyService(db_session)

        analysis = await service.get_rights_analysis(str(sample_property_with_rights.id))

        assert analysis is not None
        assert analysis["property_id"] == str(sample_property_with_rights.id)

        # 말소기준권리 확인
        assert analysis["baseline_right"] is not None
        assert analysis["baseline_right"]["type"] == "근저당권"

        # 갑구/을구 분리 확인
        assert len(analysis["gap_rights"]) == 1  # 가압류
        assert len(analysis["eul_rights"]) == 2  # 근저당권 2개

        # 소멸/인수 권리 분류 확인
        assert len(analysis["will_be_deleted"]) == 2  # 근저당권 2개
        assert len(analysis["will_be_assumed"]) == 1  # 가압류

        # 임차인 정보 확인
        assert len(analysis["tenants"]) == 2
        assert len(analysis["assumed_tenants"]) == 1  # 인수해야 할 임차인
        assert analysis["total_assumed_deposit"] == 300000000

        # 위험/안전 요소 확인
        assert len(analysis["risk_factors"]) > 0
        assert len(analysis["safe_factors"]) > 0

    @pytest.mark.asyncio
    async def test_get_rights_analysis_not_found(self, db_session: AsyncSession):
        """존재하지 않는 매물 권리분석"""
        service = PropertyService(db_session)

        analysis = await service.get_rights_analysis(str(uuid4()))

        assert analysis is None


class TestGetSimilar:
    """유사 매물 추천 테스트"""

    @pytest.mark.asyncio
    async def test_get_similar_properties(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """유사 매물 추천"""
        service = PropertyService(db_session)
        # 강남 아파트 1의 유사 매물 조회
        base_property = multiple_properties[0]

        similar = await service.get_similar(str(base_property.id), limit=3)

        # 자기 자신은 제외
        for prop in similar:
            assert prop.id != str(base_property.id)

    @pytest.mark.asyncio
    async def test_get_similar_not_found(self, db_session: AsyncSession):
        """존재하지 않는 매물의 유사 매물"""
        service = PropertyService(db_session)

        similar = await service.get_similar(str(uuid4()))

        assert similar == []


class TestCreateProperty:
    """매물 생성 테스트"""

    @pytest.mark.asyncio
    async def test_create_property(self, db_session: AsyncSession):
        """매물 생성"""
        service = PropertyService(db_session)
        data = PropertyCreate(
            case_number="2024타경99999",
            title="테스트 매물",
            address="서울특별시 종로구 종로 100",
            location="서울시 종로구",
            property_type="아파트",
            area="66㎡ (20평)",
            area_size=20.0,
            appraisal_price=600000000,
            minimum_bid_price=480000000,
            court="서울중앙지방법원",
            auction_date="2025-06-15",
            risk_score=70,
        )

        result = await service.create(data)

        assert result is not None
        assert result.case_number == "2024타경99999"
        assert result.title == "테스트 매물"
        assert result.minimum_bid_price == 480000000

    @pytest.mark.asyncio
    async def test_create_property_with_optional_fields(self, db_session: AsyncSession):
        """선택 필드 포함 매물 생성"""
        service = PropertyService(db_session)
        data = PropertyCreate(
            case_number="2024타경88888",
            title="상세 매물",
            address="경기도 수원시 팔달구 100",
            location="경기도 수원시",
            property_type="빌라",
            area="50㎡ (15평)",
            area_size=15.0,
            appraisal_price=300000000,
            minimum_bid_price=240000000,
            court="수원지방법원",
            auction_date="2025-07-20",
            build_year=2010,
            floor="3",
            total_floors=5,
            direction="동향",
            description="역세권 빌라입니다.",
            latitude=37.2636,
            longitude=127.0286,
        )

        result = await service.create(data)

        assert result.build_year == 2010
        assert result.floor == "3"
        assert result.description == "역세권 빌라입니다."


class TestUpdateProperty:
    """매물 수정 테스트"""

    @pytest.mark.asyncio
    async def test_update_property(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """매물 수정"""
        service = PropertyService(db_session)
        data = PropertyUpdate(
            title="수정된 제목",
            minimum_bid_price=900000000,
            risk_score=95,
        )

        result = await service.update(str(sample_property.id), data)

        assert result is not None
        assert result.title == "수정된 제목"
        assert result.minimum_bid_price == 900000000
        assert result.risk_score == 95
        # 수정하지 않은 필드는 유지
        assert result.address == sample_property.address

    @pytest.mark.asyncio
    async def test_update_property_not_found(self, db_session: AsyncSession):
        """존재하지 않는 매물 수정"""
        service = PropertyService(db_session)
        data = PropertyUpdate(title="수정")

        result = await service.update(str(uuid4()), data)

        assert result is None


class TestDeleteProperty:
    """매물 삭제 테스트"""

    @pytest.mark.asyncio
    async def test_delete_property(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """매물 삭제 (soft delete)"""
        service = PropertyService(db_session)

        success = await service.delete(str(sample_property.id))

        assert success is True

        # 삭제 후 조회하면 CANCELLED 상태
        # 하지만 get_by_id는 상태와 관계없이 조회함
        result = await service.get_by_id(str(sample_property.id))
        # 검색에서는 제외됨
        params = PropertySearchParams()
        properties, total = await service.search_properties(params)
        ids = [p.id for p in properties]
        assert str(sample_property.id) not in ids

    @pytest.mark.asyncio
    async def test_delete_property_not_found(self, db_session: AsyncSession):
        """존재하지 않는 매물 삭제"""
        service = PropertyService(db_session)

        success = await service.delete(str(uuid4()))

        assert success is False


class TestGetByCaseNumber:
    """사건번호로 조회 테스트"""

    @pytest.mark.asyncio
    async def test_get_by_case_number(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """사건번호로 조회"""
        service = PropertyService(db_session)

        result = await service.get_by_case_number(sample_property.case_number)

        assert result is not None
        assert result.case_number == sample_property.case_number

    @pytest.mark.asyncio
    async def test_get_by_case_number_not_found(self, db_session: AsyncSession):
        """존재하지 않는 사건번호"""
        service = PropertyService(db_session)

        result = await service.get_by_case_number("9999타경99999")

        assert result is None


class TestGetUpcomingAuctions:
    """다가오는 경매 테스트"""

    @pytest.mark.asyncio
    async def test_get_upcoming_auctions(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """7일 이내 경매 조회"""
        service = PropertyService(db_session)

        properties = await service.get_upcoming_auctions(days=7)

        for prop in properties:
            auction_date = datetime.strptime(prop.auction_date, "%Y-%m-%d")
            assert auction_date <= datetime.utcnow() + timedelta(days=7)

    @pytest.mark.asyncio
    async def test_get_upcoming_auctions_sorted_by_date(
        self, db_session: AsyncSession, multiple_properties: list[Property]
    ):
        """경매일 순 정렬 확인"""
        service = PropertyService(db_session)

        properties = await service.get_upcoming_auctions(days=30)

        dates = [datetime.strptime(p.auction_date, "%Y-%m-%d") for p in properties]
        assert dates == sorted(dates)


class TestUpdateRiskScore:
    """안전점수 업데이트 테스트"""

    @pytest.mark.asyncio
    async def test_update_risk_score(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """안전점수 업데이트"""
        service = PropertyService(db_session)

        success = await service.update_risk_score(str(sample_property.id), 95)

        assert success is True

        result = await service.get_by_id(str(sample_property.id))
        assert result.risk_score == 95

    @pytest.mark.asyncio
    async def test_update_risk_score_bounds(
        self, db_session: AsyncSession, sample_property: Property
    ):
        """안전점수 범위 제한 (0-100)"""
        service = PropertyService(db_session)

        # 100 초과
        await service.update_risk_score(str(sample_property.id), 150)
        result = await service.get_by_id(str(sample_property.id))
        assert result.risk_score == 100

        # 0 미만
        await service.update_risk_score(str(sample_property.id), -10)
        result = await service.get_by_id(str(sample_property.id))
        assert result.risk_score == 0

    @pytest.mark.asyncio
    async def test_update_risk_score_not_found(self, db_session: AsyncSession):
        """존재하지 않는 매물 안전점수 업데이트"""
        service = PropertyService(db_session)

        success = await service.update_risk_score(str(uuid4()), 80)

        assert success is False
