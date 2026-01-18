"""
Registry Document Service
"""
from typing import List, Optional
from fastapi import UploadFile, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.schemas.registry import RegistryDocumentResponse, RegistryAnalysisResponse
from app.core.config import settings


class RegistryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def upload_and_analyze(
        self,
        user_id: str,
        file: UploadFile,
        background_tasks: Optional[BackgroundTasks] = None,
    ) -> RegistryDocumentResponse:
        """Upload file and start analysis"""
        # 1. Upload file to S3
        file_url = await self._upload_to_s3(file)

        # 2. Create document record
        document_id = "doc-123"  # TODO: Create in DB

        # 3. Start background analysis
        if background_tasks:
            background_tasks.add_task(self._analyze_document, document_id, file_url)

        return RegistryDocumentResponse(
            id=document_id,
            file_name=file.filename,
            status="ANALYZING",
            created_at="2024-01-01T00:00:00Z",
        )

    async def _upload_to_s3(self, file: UploadFile) -> str:
        """Upload file to S3"""
        # TODO: Implement S3 upload
        return f"https://s3.amazonaws.com/{settings.S3_BUCKET_NAME}/{file.filename}"

    async def _analyze_document(self, document_id: str, file_url: str):
        """Background task: Analyze document with AI service"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{settings.AI_SERVICE_URL}/api/v1/registry/analyze",
                    json={"document_id": document_id, "file_url": file_url},
                    timeout=120.0,
                )
                result = response.json()

            # TODO: Update document with analysis result
        except Exception as e:
            # TODO: Update document with error status
            print(f"Analysis failed: {e}")

    async def get_user_documents(self, user_id: str) -> List[RegistryDocumentResponse]:
        """Get all documents for user"""
        # TODO: Implement DB query
        return []

    async def get_document(self, document_id: str, user_id: str) -> Optional[RegistryDocumentResponse]:
        """Get document by ID"""
        # TODO: Implement DB query
        return None

    async def get_analysis(self, document_id: str, user_id: str) -> Optional[RegistryAnalysisResponse]:
        """Get analysis result"""
        # TODO: Implement DB query
        return None

    async def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete document"""
        # TODO: Implement DB delete
        return True
