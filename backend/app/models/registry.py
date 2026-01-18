"""
Registry Document Model
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, JSON, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base


class RegistryStatus(str, enum.Enum):
    PENDING = "PENDING"
    ANALYZING = "ANALYZING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class RegistryDocument(Base):
    __tablename__ = "registry_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)  # S3 URL
    file_type = Column(String(50), nullable=False)  # "pdf", "image"
    file_size = Column(Integer, nullable=True)

    status = Column(Enum(RegistryStatus), default=RegistryStatus.PENDING)
    property_address = Column(String(500), nullable=True)

    # AI 분석 결과
    analysis_result = Column(JSON, nullable=True)
    raw_text = Column(Text, nullable=True)  # OCR 결과

    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    analyzed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="registry_documents")
