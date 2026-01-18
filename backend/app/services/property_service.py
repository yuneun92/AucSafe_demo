"""
Property Service
매물 검색, 조회, 추천, 권리분석 서비스
"""
from datetime import datetime
from typing import List, Optional, Tuple
from uuid import UUID

from sqlalchemy import select, func, or_, and_, desc, asc, cast, String
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.property import Property, PropertyRight, Tenant, PriceHistory, PropertyType, PropertyStatus
from app.schemas.property import (
    PropertySearchParams,
    PropertyResponse,
    PropertyDetailResponse,
    RightResponse,
    TenantResponse,
    AIAnalysisResponse,
    PropertyCreate,
    PropertyUpdate,
)


class PropertyService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def search_properties(
        self, params: PropertySearchParams
    ) -> Tuple[List[PropertyResponse], int]:
        """
        매물 검색 (필터링, 정렬, 페이징)

        Args:
            params: 검색 파라미터 (지역, 가격, 면적, 안전점수 등)

        Returns:
            (매물 목록, 전체 개수)
        """
        # 기본 쿼리 생성
        query = select(Property).where(Property.status != PropertyStatus.CANCELLED)
        count_query = select(func.count(Property.id)).where(
            Property.status != PropertyStatus.CANCELLED
        )

        # 필터 조건 적용
        filters = []

        # 지역 필터
        if params.location:
            filters.append(Property.location.ilike(f"%{params.location}%"))

        # 매물 유형 필터
        if params.property_types:
            type_conditions = []
            for pt in params.property_types:
                try:
                    property_type = PropertyType(pt)
                    type_conditions.append(Property.property_type == property_type)
                except ValueError:
                    continue
            if type_conditions:
                filters.append(or_(*type_conditions))

        # 가격 필터 (최저입찰가 기준)
        if params.price_min is not None:
            filters.append(Property.minimum_bid_price >= params.price_min)
        if params.price_max is not None:
            filters.append(Property.minimum_bid_price <= params.price_max)

        # 면적 필터 (평수 기준)
        if params.area_min is not None:
            filters.append(Property.area_size >= params.area_min)
        if params.area_max is not None:
            filters.append(Property.area_size <= params.area_max)

        # 안전점수 필터
        if params.risk_score_min is not None:
            filters.append(Property.risk_score >= params.risk_score_min)

        # 경매 날짜 필터
        if params.auction_date_from:
            try:
                date_from = datetime.strptime(params.auction_date_from, "%Y-%m-%d")
                filters.append(Property.auction_date >= date_from)
            except ValueError:
                pass
        if params.auction_date_to:
            try:
                date_to = datetime.strptime(params.auction_date_to, "%Y-%m-%d")
                filters.append(Property.auction_date <= date_to)
            except ValueError:
                pass

        # 담당법원 필터
        if params.court:
            filters.append(Property.court.ilike(f"%{params.court}%"))

        # 필터 적용
        if filters:
            query = query.where(and_(*filters))
            count_query = count_query.where(and_(*filters))

        # 전체 개수 조회
        total_result = await self.db.execute(count_query)
        total = total_result.scalar() or 0

        # 정렬 적용
        sort_column = self._get_sort_column(params.sort_by)
        if params.sort_order == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # 페이징 적용
        offset = (params.page - 1) * params.limit
        query = query.offset(offset).limit(params.limit)

        # 쿼리 실행
        result = await self.db.execute(query)
        properties = result.scalars().all()

        # 응답 변환
        responses = [self._to_property_response(p) for p in properties]

        return responses, total

    async def get_by_id(self, property_id: str) -> Optional[PropertyDetailResponse]:
        """
        매물 상세 조회

        Args:
            property_id: 매물 ID

        Returns:
            매물 상세 정보 (없으면 None)
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return None

        query = (
            select(Property)
            .options(
                selectinload(Property.rights),
                selectinload(Property.tenants),
            )
            .where(cast(Property.id, String) == str(uuid_id))
        )

        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return None

        return self._to_property_detail_response(property_obj)

    async def get_recommended(
        self, user_id: Optional[str] = None, limit: int = 10
    ) -> List[PropertyResponse]:
        """
        AI 추천 매물 조회

        현재 구현:
        - 안전점수 높은 순
        - 경매 예정일이 가까운 순
        - 유찰 횟수가 많은 순 (가격 메리트)

        TODO: 사용자 선호도 기반 개인화 추천

        Args:
            user_id: 사용자 ID (개인화 추천용, 선택)
            limit: 반환할 매물 수

        Returns:
            추천 매물 목록
        """
        query = (
            select(Property)
            .where(
                and_(
                    Property.status == PropertyStatus.SCHEDULED,
                    Property.auction_date >= datetime.utcnow(),
                )
            )
            .order_by(
                desc(Property.risk_score),  # 안전점수 높은 순
                asc(Property.auction_date),  # 경매일 가까운 순
                desc(Property.failed_count),  # 유찰 횟수 많은 순
            )
            .limit(limit)
        )

        result = await self.db.execute(query)
        properties = result.scalars().all()

        return [self._to_property_response(p) for p in properties]

    async def get_rights_analysis(self, property_id: str) -> Optional[dict]:
        """
        매물 권리분석 조회

        말소기준권리 판단 및 인수/소멸 권리 분석

        Args:
            property_id: 매물 ID

        Returns:
            권리분석 결과 딕셔너리
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return None

        query = (
            select(Property)
            .options(
                selectinload(Property.rights),
                selectinload(Property.tenants),
            )
            .where(cast(Property.id, String) == str(uuid_id))
        )

        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return None

        # 권리 분석
        rights = property_obj.rights
        tenants = property_obj.tenants

        # 말소기준권리 찾기
        baseline_right = next((r for r in rights if r.is_baseline_right), None)

        # 갑구/을구 분리
        gap_rights = [r for r in rights if r.section == "gap"]
        eul_rights = [r for r in rights if r.section == "eul"]

        # 소멸/인수 권리 분리
        will_be_deleted = [r for r in rights if r.will_be_deleted]
        will_be_assumed = [r for r in rights if not r.will_be_deleted]

        # 인수해야 할 임차인
        assumed_tenants = [t for t in tenants if t.will_be_assumed]
        total_assumed_deposit = sum(t.deposit for t in assumed_tenants)

        # 위험 요소 분석
        risk_factors = []
        if assumed_tenants:
            risk_factors.append(
                f"인수해야 할 임차인 {len(assumed_tenants)}명 (보증금 합계: {total_assumed_deposit:,}원)"
            )
        if any(r.right_type.value == "가압류" for r in will_be_assumed):
            risk_factors.append("인수해야 할 가압류가 있습니다")
        if any(r.right_type.value == "가등기" for r in will_be_assumed):
            risk_factors.append("인수해야 할 가등기가 있습니다")

        # 안전 요소 분석
        safe_factors = []
        if baseline_right:
            safe_factors.append(
                f"말소기준권리 확인됨: {baseline_right.right_type.value} ({baseline_right.registration_date.strftime('%Y-%m-%d')})"
            )
        if not assumed_tenants:
            safe_factors.append("인수해야 할 임차인이 없습니다")
        if len(will_be_deleted) > 0:
            safe_factors.append(f"낙찰 시 소멸되는 권리 {len(will_be_deleted)}개")

        return {
            "property_id": property_id,
            "baseline_right": (
                {
                    "type": baseline_right.right_type.value,
                    "registration_date": baseline_right.registration_date.isoformat(),
                    "holder": baseline_right.holder,
                    "amount": baseline_right.amount,
                }
                if baseline_right
                else None
            ),
            "gap_rights": [self._to_right_response(r) for r in gap_rights],
            "eul_rights": [self._to_right_response(r) for r in eul_rights],
            "will_be_deleted": [self._to_right_response(r) for r in will_be_deleted],
            "will_be_assumed": [self._to_right_response(r) for r in will_be_assumed],
            "tenants": [self._to_tenant_response(t) for t in tenants],
            "assumed_tenants": [self._to_tenant_response(t) for t in assumed_tenants],
            "total_assumed_deposit": total_assumed_deposit,
            "risk_factors": risk_factors,
            "safe_factors": safe_factors,
            "risk_score": property_obj.risk_score,
        }

    async def get_similar(
        self, property_id: str, limit: int = 5
    ) -> List[PropertyResponse]:
        """
        유사 매물 추천

        동일 지역, 유사 가격대, 동일 유형의 매물 추천

        Args:
            property_id: 기준 매물 ID
            limit: 반환할 매물 수

        Returns:
            유사 매물 목록
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return []

        # 기준 매물 조회
        base_query = select(Property).where(cast(Property.id, String) == str(uuid_id))
        result = await self.db.execute(base_query)
        base_property = result.scalar_one_or_none()

        if not base_property:
            return []

        # 유사 매물 검색 조건
        # - 동일 지역 (시/구 기준)
        # - 가격대 ±30%
        # - 동일 매물 유형
        price_min = int(base_property.minimum_bid_price * 0.7)
        price_max = int(base_property.minimum_bid_price * 1.3)

        # 지역에서 시/구 추출 (예: "서울시 강남구" -> "강남구")
        location_parts = base_property.location.split()
        location_keyword = location_parts[-1] if location_parts else base_property.location

        query = (
            select(Property)
            .where(
                and_(
                    cast(Property.id, String) != str(uuid_id),  # 자기 자신 제외
                    Property.status == PropertyStatus.SCHEDULED,
                    Property.property_type == base_property.property_type,
                    Property.location.ilike(f"%{location_keyword}%"),
                    Property.minimum_bid_price >= price_min,
                    Property.minimum_bid_price <= price_max,
                )
            )
            .order_by(
                desc(Property.risk_score),
                asc(Property.auction_date),
            )
            .limit(limit)
        )

        result = await self.db.execute(query)
        properties = result.scalars().all()

        # 결과가 부족하면 조건 완화하여 추가 검색
        if len(properties) < limit:
            remaining = limit - len(properties)
            existing_ids = [str(p.id) for p in properties] + [str(uuid_id)]

            fallback_query = (
                select(Property)
                .where(
                    and_(
                        cast(Property.id, String).not_in(existing_ids),
                        Property.status == PropertyStatus.SCHEDULED,
                        Property.property_type == base_property.property_type,
                    )
                )
                .order_by(
                    desc(Property.risk_score),
                    asc(Property.auction_date),
                )
                .limit(remaining)
            )

            fallback_result = await self.db.execute(fallback_query)
            properties.extend(fallback_result.scalars().all())

        return [self._to_property_response(p) for p in properties]

    async def create(self, data: PropertyCreate) -> PropertyDetailResponse:
        """
        매물 생성

        Args:
            data: 매물 생성 데이터

        Returns:
            생성된 매물 상세 정보
        """
        property_obj = Property(
            case_number=data.case_number,
            title=data.title,
            address=data.address,
            location=data.location,
            property_type=PropertyType(data.property_type),
            area=data.area,
            area_size=data.area_size,
            appraisal_price=data.appraisal_price,
            minimum_bid_price=data.minimum_bid_price,
            market_price=data.market_price,
            court=data.court,
            auction_date=datetime.strptime(data.auction_date, "%Y-%m-%d"),
            auction_round=data.auction_round or 1,
            failed_count=data.failed_count or 0,
            risk_score=data.risk_score or 50,
            status=PropertyStatus(data.status) if data.status else PropertyStatus.SCHEDULED,
            images=data.images or [],
            image=data.image,
            latitude=data.latitude,
            longitude=data.longitude,
            description=data.description,
            build_year=data.build_year,
            floor=data.floor,
            total_floors=data.total_floors,
            direction=data.direction,
        )

        self.db.add(property_obj)
        await self.db.commit()
        await self.db.refresh(property_obj)

        # 관계를 로드하기 위해 다시 조회
        return await self.get_by_id(str(property_obj.id))

    async def update(
        self, property_id: str, data: PropertyUpdate
    ) -> Optional[PropertyDetailResponse]:
        """
        매물 수정

        Args:
            property_id: 매물 ID
            data: 수정할 데이터

        Returns:
            수정된 매물 상세 정보 (없으면 None)
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return None

        query = select(Property).where(cast(Property.id, String) == str(uuid_id))
        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return None

        # 업데이트할 필드만 적용
        update_data = data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            if field == "property_type" and value:
                setattr(property_obj, field, PropertyType(value))
            elif field == "status" and value:
                setattr(property_obj, field, PropertyStatus(value))
            elif field == "auction_date" and value:
                setattr(property_obj, field, datetime.strptime(value, "%Y-%m-%d"))
            else:
                setattr(property_obj, field, value)

        property_obj.updated_at = datetime.utcnow()

        await self.db.commit()

        # 관계를 로드하기 위해 다시 조회
        return await self.get_by_id(property_id)

    async def delete(self, property_id: str) -> bool:
        """
        매물 삭제 (soft delete - 상태를 CANCELLED로 변경)

        Args:
            property_id: 매물 ID

        Returns:
            삭제 성공 여부
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return False

        query = select(Property).where(cast(Property.id, String) == str(uuid_id))
        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return False

        property_obj.status = PropertyStatus.CANCELLED
        property_obj.updated_at = datetime.utcnow()

        await self.db.commit()

        return True

    async def get_by_case_number(self, case_number: str) -> Optional[PropertyDetailResponse]:
        """
        사건번호로 매물 조회

        Args:
            case_number: 사건번호

        Returns:
            매물 상세 정보 (없으면 None)
        """
        query = (
            select(Property)
            .options(
                selectinload(Property.rights),
                selectinload(Property.tenants),
            )
            .where(Property.case_number == case_number)
        )

        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return None

        return self._to_property_detail_response(property_obj)

    async def get_upcoming_auctions(
        self, days: int = 7, limit: int = 20
    ) -> List[PropertyResponse]:
        """
        다가오는 경매 매물 조회

        Args:
            days: 앞으로 n일 이내의 경매
            limit: 반환할 매물 수

        Returns:
            경매 예정 매물 목록
        """
        from datetime import timedelta

        now = datetime.utcnow()
        end_date = now + timedelta(days=days)

        query = (
            select(Property)
            .where(
                and_(
                    Property.status == PropertyStatus.SCHEDULED,
                    Property.auction_date >= now,
                    Property.auction_date <= end_date,
                )
            )
            .order_by(asc(Property.auction_date))
            .limit(limit)
        )

        result = await self.db.execute(query)
        properties = result.scalars().all()

        return [self._to_property_response(p) for p in properties]

    async def update_risk_score(self, property_id: str, risk_score: int) -> bool:
        """
        매물 안전점수 업데이트

        Args:
            property_id: 매물 ID
            risk_score: 새로운 안전점수 (0-100)

        Returns:
            업데이트 성공 여부
        """
        try:
            uuid_id = UUID(property_id)
        except ValueError:
            return False

        query = select(Property).where(cast(Property.id, String) == str(uuid_id))
        result = await self.db.execute(query)
        property_obj = result.scalar_one_or_none()

        if not property_obj:
            return False

        property_obj.risk_score = max(0, min(100, risk_score))
        property_obj.updated_at = datetime.utcnow()

        await self.db.commit()

        return True

    # ================== Helper Methods ==================

    def _get_sort_column(self, sort_by: str):
        """정렬 컬럼 매핑"""
        sort_map = {
            "date": Property.auction_date,
            "price": Property.minimum_bid_price,
            "area": Property.area_size,
            "risk_score": Property.risk_score,
            "created": Property.created_at,
        }
        return sort_map.get(sort_by, Property.auction_date)

    def _to_property_response(self, property_obj: Property) -> PropertyResponse:
        """Property 모델을 PropertyResponse로 변환"""
        return PropertyResponse(
            id=str(property_obj.id),
            case_number=property_obj.case_number,
            title=property_obj.title,
            address=property_obj.address,
            location=property_obj.location,
            property_type=property_obj.property_type.value,
            area=property_obj.area,
            appraisal_price=property_obj.appraisal_price,
            minimum_bid_price=property_obj.minimum_bid_price,
            market_price=property_obj.market_price,
            court=property_obj.court,
            auction_date=property_obj.auction_date.strftime("%Y-%m-%d"),
            failed_count=property_obj.failed_count,
            risk_score=property_obj.risk_score,
            image=property_obj.image,
        )

    def _to_property_detail_response(
        self, property_obj: Property
    ) -> PropertyDetailResponse:
        """Property 모델을 PropertyDetailResponse로 변환"""
        rights = getattr(property_obj, "rights", []) or []
        tenants = getattr(property_obj, "tenants", []) or []

        ai_analysis = None
        if property_obj.ai_analysis:
            try:
                ai_analysis = AIAnalysisResponse(**property_obj.ai_analysis)
            except Exception:
                pass

        return PropertyDetailResponse(
            id=str(property_obj.id),
            case_number=property_obj.case_number,
            title=property_obj.title,
            address=property_obj.address,
            location=property_obj.location,
            property_type=property_obj.property_type.value,
            area=property_obj.area,
            appraisal_price=property_obj.appraisal_price,
            minimum_bid_price=property_obj.minimum_bid_price,
            market_price=property_obj.market_price,
            court=property_obj.court,
            auction_date=property_obj.auction_date.strftime("%Y-%m-%d"),
            failed_count=property_obj.failed_count,
            risk_score=property_obj.risk_score,
            image=property_obj.image,
            images=property_obj.images or [],
            description=property_obj.description,
            build_year=property_obj.build_year,
            floor=property_obj.floor,
            total_floors=property_obj.total_floors,
            direction=property_obj.direction,
            latitude=property_obj.latitude,
            longitude=property_obj.longitude,
            rights=[self._to_right_response(r) for r in rights],
            tenants=[self._to_tenant_response(t) for t in tenants],
            ai_analysis=ai_analysis,
        )

    def _to_right_response(self, right: PropertyRight) -> RightResponse:
        """PropertyRight 모델을 RightResponse로 변환"""
        return RightResponse(
            id=str(right.id),
            type=right.right_type.value,
            registration_date=right.registration_date.strftime("%Y-%m-%d"),
            holder=right.holder,
            amount=right.amount,
            is_baseline_right=right.is_baseline_right,
            will_be_deleted=right.will_be_deleted,
            section=right.section,
            rank=right.rank,
        )

    def _to_tenant_response(self, tenant: Tenant) -> TenantResponse:
        """Tenant 모델을 TenantResponse로 변환"""
        return TenantResponse(
            id=str(tenant.id),
            move_in_date=tenant.move_in_date.strftime("%Y-%m-%d"),
            deposit=tenant.deposit,
            monthly_rent=tenant.monthly_rent,
            has_opposition_right=tenant.has_opposition_right,
            will_be_assumed=tenant.will_be_assumed,
            priority=tenant.priority,
        )
