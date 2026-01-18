"""
Registry Schemas
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class RegistryDocumentResponse(BaseModel):
    id: str
    file_name: str
    status: str
    property_address: Optional[str] = None
    created_at: datetime
    analyzed_at: Optional[datetime] = None


class RightItemResponse(BaseModel):
    type: str
    registration_date: str
    holder: str
    amount: Optional[int] = None
    is_baseline_right: bool
    will_be_deleted: bool
    section: str
    rank: int


class RegistryAnalysisResponse(BaseModel):
    property_info: dict
    owner_info: dict
    gap_section: List[RightItemResponse]
    eul_section: List[RightItemResponse]
    baseline_right: Optional[RightItemResponse] = None
    safety_score: int
    risk_summary: List[str]
    safe_summary: List[str]
