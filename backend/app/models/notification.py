"""
Notification Model
"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
import enum

from app.db.session import Base


class NotificationType(str, enum.Enum):
    AUCTION_REMINDER = "AUCTION_REMINDER"
    PRICE_CHANGE = "PRICE_CHANGE"
    NEW_MATCH = "NEW_MATCH"
    SYSTEM = "SYSTEM"
    ANALYSIS_COMPLETE = "ANALYSIS_COMPLETE"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=True)

    read = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
