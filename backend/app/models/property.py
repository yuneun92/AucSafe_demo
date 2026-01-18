"""
Property Models
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, Text, ForeignKey, Enum, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base


class PropertyType(str, enum.Enum):
    APARTMENT = "아파트"
    OFFICETEL = "오피스텔"
    VILLA = "빌라"
    COMMERCIAL = "상가"
    LAND = "토지"
    OTHER = "기타"


class PropertyStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class RightType(str, enum.Enum):
    MORTGAGE = "저당권"
    LEASE = "전세권"
    PROVISIONAL_SEIZURE = "가압류"
    PROVISIONAL_REGISTRATION = "가등기"
    SUPERFICIES = "지상권"
    LEASEHOLD = "임차권"
    COLLATERAL_MORTGAGE = "근저당권"


class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    address = Column(String(500), nullable=False)
    location = Column(String(200), nullable=False)  # 지역 (서울시 강남구)
    property_type = Column(Enum(PropertyType), nullable=False)
    area = Column(String(50), nullable=False)  # "84.5㎡ (25.6평)"
    area_size = Column(Float, nullable=False)  # 평수

    appraisal_price = Column(Integer, nullable=False)  # 감정가
    minimum_bid_price = Column(Integer, nullable=False)  # 최저입찰가
    market_price = Column(Integer, nullable=True)  # 시세

    court = Column(String(100), nullable=False)  # 담당법원
    auction_date = Column(DateTime, nullable=False)
    auction_round = Column(Integer, default=1)
    failed_count = Column(Integer, default=0)  # 유찰 횟수

    risk_score = Column(Integer, default=50)  # AI 안전점수 (0-100)
    status = Column(Enum(PropertyStatus), default=PropertyStatus.SCHEDULED)

    images = Column(JSON, default=list)  # 이미지 URL 목록
    image = Column(String(500), nullable=True)  # 대표 이미지

    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    description = Column(Text, nullable=True)
    build_year = Column(Integer, nullable=True)
    floor = Column(String(20), nullable=True)
    total_floors = Column(Integer, nullable=True)
    direction = Column(String(20), nullable=True)

    ai_analysis = Column(JSON, nullable=True)  # AI 분석 결과 JSON

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    rights = relationship("PropertyRight", back_populates="property", cascade="all, delete-orphan")
    tenants = relationship("Tenant", back_populates="property", cascade="all, delete-orphan")
    price_history = relationship("PriceHistory", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")


class PropertyRight(Base):
    """권리 정보 (갑구/을구)"""
    __tablename__ = "property_rights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)

    right_type = Column(Enum(RightType), nullable=False)
    registration_date = Column(DateTime, nullable=False)
    holder = Column(String(200), nullable=False)  # 권리자
    amount = Column(Integer, nullable=True)  # 채권액

    is_baseline_right = Column(Boolean, default=False)  # 말소기준권리 여부
    will_be_deleted = Column(Boolean, default=True)  # 낙찰 시 소멸 여부
    section = Column(String(10), nullable=False)  # "gap" or "eul"
    rank = Column(Integer, nullable=False)  # 순위
    note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="rights")


class Tenant(Base):
    """임차인 정보"""
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)

    move_in_date = Column(DateTime, nullable=False)
    deposit = Column(Integer, nullable=False)  # 보증금
    monthly_rent = Column(Integer, nullable=True)  # 월세

    has_opposition_right = Column(Boolean, default=False)  # 대항력 여부
    will_be_assumed = Column(Boolean, default=False)  # 인수 여부
    priority = Column(String(20), nullable=False)  # "SENIOR" or "JUNIOR"

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="tenants")


class PriceHistory(Base):
    """입찰 이력"""
    __tablename__ = "price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id = Column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)

    auction_date = Column(DateTime, nullable=False)
    round = Column(Integer, nullable=False)
    minimum_bid_price = Column(Integer, nullable=False)
    bid_count = Column(Integer, default=0)
    highest_bid = Column(Integer, nullable=True)
    result = Column(String(20), nullable=False)  # "FAILED", "SOLD", "CANCELLED"

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    property = relationship("Property", back_populates="price_history")
