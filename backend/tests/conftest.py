"""
Pytest Configuration and Fixtures
테스트용 데이터베이스, 세션, 클라이언트 설정
"""
import asyncio
from datetime import datetime, timedelta
from typing import AsyncGenerator, Generator
from uuid import uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import event, String
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy.dialects.postgresql import UUID as PG_UUID

from app.db.session import Base, get_db
from app.main import app
from app.models.property import Property, PropertyRight, Tenant, PropertyType, PropertyStatus, RightType
from app.models.user import User
from app.core.security import get_password_hash, create_access_token


# 테스트용 SQLite 인메모리 데이터베이스
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


# SQLite에서 UUID 바인딩을 위한 어댑터 등록
import sqlite3
from uuid import UUID as PyUUID


def adapt_uuid(uuid_obj):
    """UUID를 SQLite에 저장할 수 있는 문자열로 변환"""
    return str(uuid_obj)


def convert_uuid(s):
    """SQLite에서 가져온 문자열을 UUID로 변환"""
    return PyUUID(s.decode()) if isinstance(s, bytes) else PyUUID(s)


# SQLite 어댑터 등록
sqlite3.register_adapter(PyUUID, adapt_uuid)
sqlite3.register_converter("UUID", convert_uuid)


# SQLite에서 UUID 타입 호환성 처리
# PostgreSQL UUID를 SQLite에서 CHAR(36)으로 매핑
from sqlalchemy import TypeDecorator
from sqlalchemy.dialects.postgresql import UUID


# 테스트 시 UUID 타입을 SQLite 호환 타입으로 교체
@event.listens_for(Base.metadata, "before_create")
def receive_before_create(target, connection, **kw):
    """테이블 생성 전 UUID 타입을 String으로 변환"""
    if connection.dialect.name == "sqlite":
        for table in target.tables.values():
            for column in table.columns:
                if isinstance(column.type, PG_UUID):
                    column.type = String(36)


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def async_engine():
    """Create async engine for tests."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(async_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create async session for tests."""
    async_session_maker = async_sessionmaker(
        async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

    async with async_session_maker() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create async test client."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create test user."""
    user = User(
        id=uuid4(),
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        name="테스트 사용자",
        phone="010-1234-5678",
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_headers(test_user: User) -> dict:
    """Create auth headers with JWT token."""
    access_token = create_access_token(subject=str(test_user.id))
    return {"Authorization": f"Bearer {access_token}"}


@pytest_asyncio.fixture
async def sample_property(db_session: AsyncSession) -> Property:
    """Create sample property for tests."""
    prop = Property(
        id=uuid4(),
        case_number="2024타경12345",
        title="서울 강남구 역삼동 아파트",
        address="서울특별시 강남구 역삼동 123-45 래미안아파트 101동 1001호",
        location="서울시 강남구",
        property_type=PropertyType.APARTMENT,
        area="84.5㎡ (25.6평)",
        area_size=25.6,
        appraisal_price=1200000000,
        minimum_bid_price=960000000,
        market_price=1300000000,
        court="서울중앙지방법원",
        auction_date=datetime.utcnow() + timedelta(days=14),
        auction_round=1,
        failed_count=0,
        risk_score=85,
        status=PropertyStatus.SCHEDULED,
        images=["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
        image="https://example.com/image1.jpg",
        latitude=37.5012,
        longitude=127.0396,
        description="역삼역 도보 5분 거리의 로열층 아파트입니다.",
        build_year=2015,
        floor="10",
        total_floors=25,
        direction="남향",
    )
    db_session.add(prop)
    await db_session.commit()
    await db_session.refresh(prop)
    return prop


@pytest_asyncio.fixture
async def sample_property_with_rights(db_session: AsyncSession, sample_property: Property) -> Property:
    """Create sample property with rights and tenants."""
    # 권리 정보 추가 (근저당권 - 말소기준권리)
    right1 = PropertyRight(
        id=uuid4(),
        property_id=sample_property.id,
        right_type=RightType.COLLATERAL_MORTGAGE,
        registration_date=datetime(2020, 3, 15),
        holder="국민은행",
        amount=800000000,
        is_baseline_right=True,
        will_be_deleted=True,
        section="eul",
        rank=1,
    )

    # 추가 근저당권
    right2 = PropertyRight(
        id=uuid4(),
        property_id=sample_property.id,
        right_type=RightType.COLLATERAL_MORTGAGE,
        registration_date=datetime(2021, 6, 20),
        holder="신한은행",
        amount=200000000,
        is_baseline_right=False,
        will_be_deleted=True,
        section="eul",
        rank=2,
    )

    # 가압류 (인수해야 할 권리)
    right3 = PropertyRight(
        id=uuid4(),
        property_id=sample_property.id,
        right_type=RightType.PROVISIONAL_SEIZURE,
        registration_date=datetime(2019, 1, 10),
        holder="김철수",
        amount=50000000,
        is_baseline_right=False,
        will_be_deleted=False,
        section="gap",
        rank=1,
    )

    # 임차인 정보 (인수해야 할 임차인)
    tenant1 = Tenant(
        id=uuid4(),
        property_id=sample_property.id,
        move_in_date=datetime(2019, 6, 1),
        deposit=300000000,
        monthly_rent=0,
        has_opposition_right=True,
        will_be_assumed=True,
        priority="SENIOR",
    )

    # 임차인 (소멸되는 임차인)
    tenant2 = Tenant(
        id=uuid4(),
        property_id=sample_property.id,
        move_in_date=datetime(2022, 1, 1),
        deposit=50000000,
        monthly_rent=1000000,
        has_opposition_right=False,
        will_be_assumed=False,
        priority="JUNIOR",
    )

    db_session.add_all([right1, right2, right3, tenant1, tenant2])
    await db_session.commit()
    await db_session.refresh(sample_property)

    return sample_property


@pytest_asyncio.fixture
async def multiple_properties(db_session: AsyncSession) -> list[Property]:
    """Create multiple properties for list/search tests."""
    properties = []

    # 서울 강남구 아파트
    prop1 = Property(
        id=uuid4(),
        case_number="2024타경10001",
        title="강남 아파트 1",
        address="서울특별시 강남구 삼성동 100",
        location="서울시 강남구",
        property_type=PropertyType.APARTMENT,
        area="59㎡ (17.8평)",
        area_size=17.8,
        appraisal_price=800000000,
        minimum_bid_price=640000000,
        court="서울중앙지방법원",
        auction_date=datetime.utcnow() + timedelta(days=7),
        risk_score=90,
        status=PropertyStatus.SCHEDULED,
    )

    # 서울 강남구 오피스텔
    prop2 = Property(
        id=uuid4(),
        case_number="2024타경10002",
        title="강남 오피스텔",
        address="서울특별시 강남구 역삼동 200",
        location="서울시 강남구",
        property_type=PropertyType.OFFICETEL,
        area="33㎡ (10평)",
        area_size=10.0,
        appraisal_price=400000000,
        minimum_bid_price=320000000,
        court="서울중앙지방법원",
        auction_date=datetime.utcnow() + timedelta(days=10),
        risk_score=75,
        status=PropertyStatus.SCHEDULED,
    )

    # 서울 서초구 빌라
    prop3 = Property(
        id=uuid4(),
        case_number="2024타경10003",
        title="서초 빌라",
        address="서울특별시 서초구 서초동 300",
        location="서울시 서초구",
        property_type=PropertyType.VILLA,
        area="66㎡ (20평)",
        area_size=20.0,
        appraisal_price=500000000,
        minimum_bid_price=400000000,
        court="서울중앙지방법원",
        auction_date=datetime.utcnow() + timedelta(days=3),
        risk_score=60,
        status=PropertyStatus.SCHEDULED,
    )

    # 경기도 성남시 아파트
    prop4 = Property(
        id=uuid4(),
        case_number="2024타경10004",
        title="분당 아파트",
        address="경기도 성남시 분당구 정자동 400",
        location="경기도 성남시",
        property_type=PropertyType.APARTMENT,
        area="84㎡ (25.4평)",
        area_size=25.4,
        appraisal_price=700000000,
        minimum_bid_price=560000000,
        court="수원지방법원 성남지원",
        auction_date=datetime.utcnow() + timedelta(days=21),
        risk_score=80,
        failed_count=2,
        status=PropertyStatus.SCHEDULED,
    )

    # 완료된 경매 (검색에서 제외되어야 함 - CANCELLED 상태)
    prop5 = Property(
        id=uuid4(),
        case_number="2024타경10005",
        title="취소된 매물",
        address="서울특별시 강남구 논현동 500",
        location="서울시 강남구",
        property_type=PropertyType.APARTMENT,
        area="100㎡ (30평)",
        area_size=30.0,
        appraisal_price=1000000000,
        minimum_bid_price=800000000,
        court="서울중앙지방법원",
        auction_date=datetime.utcnow() - timedelta(days=7),
        risk_score=70,
        status=PropertyStatus.CANCELLED,
    )

    properties = [prop1, prop2, prop3, prop4, prop5]
    db_session.add_all(properties)
    await db_session.commit()

    for prop in properties:
        await db_session.refresh(prop)

    return properties
