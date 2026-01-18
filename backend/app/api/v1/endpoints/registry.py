"""
Registry Document Analysis Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.security import get_current_user
from app.schemas.registry import RegistryDocumentResponse, RegistryAnalysisResponse
from app.services.registry_service import RegistryService

router = APIRouter()


@router.post("/upload", response_model=RegistryDocumentResponse)
async def upload_registry_document(
    file: UploadFile = File(..., description="등기부등본 파일 (PDF, PNG, JPG)"),
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    등기부등본 파일 업로드 및 분석 요청

    지원 형식: PDF, PNG, JPG, JPEG
    """
    # 파일 형식 검증
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="지원하지 않는 파일 형식입니다. PDF, PNG, JPG 파일만 업로드 가능합니다."
        )

    service = RegistryService(db)
    document = await service.upload_and_analyze(
        user_id=current_user["id"],
        file=file,
        background_tasks=background_tasks,
    )
    return document


@router.get("", response_model=List[RegistryDocumentResponse])
async def list_registry_documents(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    내 등기부등본 분석 목록
    """
    service = RegistryService(db)
    documents = await service.get_user_documents(current_user["id"])
    return documents


@router.get("/{document_id}", response_model=RegistryDocumentResponse)
async def get_registry_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    등기부등본 분석 결과 조회
    """
    service = RegistryService(db)
    document = await service.get_document(document_id, current_user["id"])
    if not document:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")
    return document


@router.get("/{document_id}/analysis", response_model=RegistryAnalysisResponse)
async def get_registry_analysis(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    등기부등본 상세 분석 결과
    """
    service = RegistryService(db)
    analysis = await service.get_analysis(document_id, current_user["id"])
    if not analysis:
        raise HTTPException(status_code=404, detail="분석 결과를 찾을 수 없습니다")
    return analysis


@router.delete("/{document_id}")
async def delete_registry_document(
    document_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    등기부등본 분석 기록 삭제
    """
    service = RegistryService(db)
    deleted = await service.delete_document(document_id, current_user["id"])
    if not deleted:
        raise HTTPException(status_code=404, detail="문서를 찾을 수 없습니다")
    return {"message": "삭제되었습니다"}
