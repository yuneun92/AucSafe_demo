"""
Properties API Integration Tests
매물 API 통합 테스트
"""
import pytest
from httpx import AsyncClient

from app.models.property import Property


class TestListPropertiesAPI:
    """GET /api/v1/properties 테스트"""

    @pytest.mark.asyncio
    async def test_list_properties(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """매물 목록 조회"""
        response = await client.get("/api/v1/properties")

        assert response.status_code == 200
        data = response.json()

        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
        assert "pages" in data

        # CANCELLED 제외 4개
        assert data["total"] == 4
        assert len(data["items"]) == 4

    @pytest.mark.asyncio
    async def test_list_properties_with_location_filter(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """지역 필터 테스트"""
        response = await client.get("/api/v1/properties?location=강남구")

        assert response.status_code == 200
        data = response.json()

        assert data["total"] == 2
        for item in data["items"]:
            assert "강남구" in item["location"]

    @pytest.mark.asyncio
    async def test_list_properties_with_property_type_filter(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """매물 유형 필터 테스트"""
        response = await client.get("/api/v1/properties?property_types=아파트,오피스텔")

        assert response.status_code == 200
        data = response.json()

        for item in data["items"]:
            assert item["property_type"] in ["아파트", "오피스텔"]

    @pytest.mark.asyncio
    async def test_list_properties_with_price_range(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """가격 범위 필터 테스트"""
        response = await client.get(
            "/api/v1/properties?price_min=400000000&price_max=600000000"
        )

        assert response.status_code == 200
        data = response.json()

        for item in data["items"]:
            assert 400000000 <= item["minimum_bid_price"] <= 600000000

    @pytest.mark.asyncio
    async def test_list_properties_with_risk_score_filter(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """안전점수 필터 테스트"""
        response = await client.get("/api/v1/properties?risk_score_min=80")

        assert response.status_code == 200
        data = response.json()

        for item in data["items"]:
            assert item["risk_score"] >= 80

    @pytest.mark.asyncio
    async def test_list_properties_sorting(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """정렬 테스트"""
        response = await client.get(
            "/api/v1/properties?sort_by=price&sort_order=asc"
        )

        assert response.status_code == 200
        data = response.json()

        prices = [item["minimum_bid_price"] for item in data["items"]]
        assert prices == sorted(prices)

    @pytest.mark.asyncio
    async def test_list_properties_pagination(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """페이징 테스트"""
        response = await client.get("/api/v1/properties?page=1&limit=2")

        assert response.status_code == 200
        data = response.json()

        assert len(data["items"]) == 2
        assert data["page"] == 1
        assert data["limit"] == 2
        assert data["pages"] == 2  # 4개 / 2개씩 = 2페이지

    @pytest.mark.asyncio
    async def test_list_properties_invalid_page(self, client: AsyncClient):
        """잘못된 페이지 번호"""
        response = await client.get("/api/v1/properties?page=0")

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_list_properties_invalid_limit(self, client: AsyncClient):
        """잘못된 페이지 크기"""
        response = await client.get("/api/v1/properties?limit=200")

        assert response.status_code == 422  # Max is 100


class TestGetPropertyDetailAPI:
    """GET /api/v1/properties/{property_id} 테스트"""

    @pytest.mark.asyncio
    async def test_get_property_detail(
        self, client: AsyncClient, sample_property: Property
    ):
        """매물 상세 조회"""
        response = await client.get(f"/api/v1/properties/{sample_property.id}")

        assert response.status_code == 200
        data = response.json()

        assert data["id"] == str(sample_property.id)
        assert data["case_number"] == sample_property.case_number
        assert data["title"] == sample_property.title
        assert "rights" in data
        assert "tenants" in data

    @pytest.mark.asyncio
    async def test_get_property_detail_not_found(self, client: AsyncClient):
        """존재하지 않는 매물 조회"""
        from uuid import uuid4

        response = await client.get(f"/api/v1/properties/{uuid4()}")

        assert response.status_code == 404
        assert "찾을 수 없습니다" in response.json()["detail"]

    @pytest.mark.asyncio
    async def test_get_property_detail_invalid_uuid(self, client: AsyncClient):
        """잘못된 UUID 형식"""
        response = await client.get("/api/v1/properties/invalid-uuid")

        assert response.status_code == 404


class TestGetRecommendedAPI:
    """GET /api/v1/properties/recommended 테스트"""

    @pytest.mark.asyncio
    async def test_get_recommended(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """추천 매물 조회"""
        response = await client.get("/api/v1/properties/recommended")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        # 안전점수 높은 순 정렬 확인
        if len(data) >= 2:
            assert data[0]["risk_score"] >= data[1]["risk_score"]

    @pytest.mark.asyncio
    async def test_get_recommended_with_limit(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """추천 매물 개수 제한"""
        response = await client.get("/api/v1/properties/recommended?limit=2")

        assert response.status_code == 200
        data = response.json()

        assert len(data) <= 2


class TestGetUpcomingAuctionsAPI:
    """GET /api/v1/properties/upcoming 테스트"""

    @pytest.mark.asyncio
    async def test_get_upcoming_auctions(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """다가오는 경매 조회"""
        response = await client.get("/api/v1/properties/upcoming?days=7")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)


class TestGetPropertyByCaseNumberAPI:
    """GET /api/v1/properties/case/{case_number} 테스트"""

    @pytest.mark.asyncio
    async def test_get_by_case_number(
        self, client: AsyncClient, sample_property: Property
    ):
        """사건번호로 조회"""
        response = await client.get(
            f"/api/v1/properties/case/{sample_property.case_number}"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["case_number"] == sample_property.case_number

    @pytest.mark.asyncio
    async def test_get_by_case_number_not_found(self, client: AsyncClient):
        """존재하지 않는 사건번호"""
        response = await client.get("/api/v1/properties/case/9999타경99999")

        assert response.status_code == 404


class TestGetRightsAnalysisAPI:
    """GET /api/v1/properties/{property_id}/rights-analysis 테스트"""

    @pytest.mark.asyncio
    async def test_get_rights_analysis(
        self, client: AsyncClient, sample_property_with_rights: Property
    ):
        """권리분석 조회"""
        response = await client.get(
            f"/api/v1/properties/{sample_property_with_rights.id}/rights-analysis"
        )

        assert response.status_code == 200
        data = response.json()

        assert data["property_id"] == str(sample_property_with_rights.id)
        assert "baseline_right" in data
        assert "gap_rights" in data
        assert "eul_rights" in data
        assert "risk_factors" in data
        assert "safe_factors" in data

    @pytest.mark.asyncio
    async def test_get_rights_analysis_not_found(self, client: AsyncClient):
        """존재하지 않는 매물 권리분석"""
        from uuid import uuid4

        response = await client.get(f"/api/v1/properties/{uuid4()}/rights-analysis")

        assert response.status_code == 404


class TestGetSimilarPropertiesAPI:
    """GET /api/v1/properties/{property_id}/similar 테스트"""

    @pytest.mark.asyncio
    async def test_get_similar(
        self, client: AsyncClient, multiple_properties: list[Property]
    ):
        """유사 매물 조회"""
        property_id = multiple_properties[0].id
        response = await client.get(f"/api/v1/properties/{property_id}/similar")

        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        # 자기 자신 제외
        for item in data:
            assert item["id"] != str(property_id)


class TestCreatePropertyAPI:
    """POST /api/v1/properties 테스트"""

    @pytest.mark.asyncio
    async def test_create_property_unauthorized(self, client: AsyncClient):
        """인증 없이 매물 생성 시도"""
        response = await client.post(
            "/api/v1/properties",
            json={
                "case_number": "2024타경77777",
                "title": "테스트",
                "address": "서울시 강남구",
                "location": "서울시 강남구",
                "property_type": "아파트",
                "area": "84㎡",
                "area_size": 25.4,
                "appraisal_price": 1000000000,
                "minimum_bid_price": 800000000,
                "court": "서울중앙지방법원",
                "auction_date": "2025-06-01",
            },
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_create_property_authorized(
        self, client: AsyncClient, auth_headers: dict
    ):
        """인증 후 매물 생성"""
        response = await client.post(
            "/api/v1/properties",
            headers=auth_headers,
            json={
                "case_number": "2024타경77777",
                "title": "API 테스트 매물",
                "address": "서울특별시 강남구 테스트동 123",
                "location": "서울시 강남구",
                "property_type": "아파트",
                "area": "84㎡ (25.4평)",
                "area_size": 25.4,
                "appraisal_price": 1000000000,
                "minimum_bid_price": 800000000,
                "court": "서울중앙지방법원",
                "auction_date": "2025-06-01",
            },
        )

        assert response.status_code == 201
        data = response.json()

        assert data["case_number"] == "2024타경77777"
        assert data["title"] == "API 테스트 매물"

    @pytest.mark.asyncio
    async def test_create_property_validation_error(
        self, client: AsyncClient, auth_headers: dict
    ):
        """필수 필드 누락"""
        response = await client.post(
            "/api/v1/properties",
            headers=auth_headers,
            json={
                "title": "불완전한 매물",
            },
        )

        assert response.status_code == 422


class TestUpdatePropertyAPI:
    """PUT /api/v1/properties/{property_id} 테스트"""

    @pytest.mark.asyncio
    async def test_update_property_unauthorized(
        self, client: AsyncClient, sample_property: Property
    ):
        """인증 없이 매물 수정 시도"""
        response = await client.put(
            f"/api/v1/properties/{sample_property.id}",
            json={"title": "수정된 제목"},
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_update_property_authorized(
        self, client: AsyncClient, auth_headers: dict, sample_property: Property
    ):
        """인증 후 매물 수정"""
        response = await client.put(
            f"/api/v1/properties/{sample_property.id}",
            headers=auth_headers,
            json={
                "title": "API로 수정된 제목",
                "risk_score": 92,
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert data["title"] == "API로 수정된 제목"
        assert data["risk_score"] == 92

    @pytest.mark.asyncio
    async def test_update_property_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        """존재하지 않는 매물 수정"""
        from uuid import uuid4

        response = await client.put(
            f"/api/v1/properties/{uuid4()}",
            headers=auth_headers,
            json={"title": "수정"},
        )

        assert response.status_code == 404


class TestDeletePropertyAPI:
    """DELETE /api/v1/properties/{property_id} 테스트"""

    @pytest.mark.asyncio
    async def test_delete_property_unauthorized(
        self, client: AsyncClient, sample_property: Property
    ):
        """인증 없이 매물 삭제 시도"""
        response = await client.delete(f"/api/v1/properties/{sample_property.id}")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_delete_property_authorized(
        self, client: AsyncClient, auth_headers: dict, sample_property: Property
    ):
        """인증 후 매물 삭제"""
        response = await client.delete(
            f"/api/v1/properties/{sample_property.id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

        # 삭제 후 검색에서 제외 확인
        list_response = await client.get("/api/v1/properties")
        ids = [item["id"] for item in list_response.json()["items"]]
        assert str(sample_property.id) not in ids

    @pytest.mark.asyncio
    async def test_delete_property_not_found(
        self, client: AsyncClient, auth_headers: dict
    ):
        """존재하지 않는 매물 삭제"""
        from uuid import uuid4

        response = await client.delete(
            f"/api/v1/properties/{uuid4()}",
            headers=auth_headers,
        )

        assert response.status_code == 404


class TestUpdateRiskScoreAPI:
    """PATCH /api/v1/properties/{property_id}/risk-score 테스트"""

    @pytest.mark.asyncio
    async def test_update_risk_score_unauthorized(
        self, client: AsyncClient, sample_property: Property
    ):
        """인증 없이 안전점수 업데이트"""
        response = await client.patch(
            f"/api/v1/properties/{sample_property.id}/risk-score?risk_score=90"
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_update_risk_score_authorized(
        self, client: AsyncClient, auth_headers: dict, sample_property: Property
    ):
        """인증 후 안전점수 업데이트"""
        response = await client.patch(
            f"/api/v1/properties/{sample_property.id}/risk-score?risk_score=95",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()

        assert data["risk_score"] == 95

    @pytest.mark.asyncio
    async def test_update_risk_score_invalid_value(
        self, client: AsyncClient, auth_headers: dict, sample_property: Property
    ):
        """범위 초과 안전점수"""
        response = await client.patch(
            f"/api/v1/properties/{sample_property.id}/risk-score?risk_score=150",
            headers=auth_headers,
        )

        assert response.status_code == 422  # Validation error (max 100)
