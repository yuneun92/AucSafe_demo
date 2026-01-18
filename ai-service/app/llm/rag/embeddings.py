"""
Embedding Service for RAG
"""
from typing import List, Optional
from dataclasses import dataclass
import numpy as np


@dataclass
class EmbeddingResult:
    embedding: List[float]
    text: str
    model: str
    dimensions: int


class EmbeddingService:
    """Service for generating text embeddings"""

    def __init__(
        self,
        api_key: str,
        model: str = "text-embedding-3-small",
        dimensions: int = 1536
    ):
        self.api_key = api_key
        self.model = model
        self.dimensions = dimensions
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from openai import AsyncOpenAI
            self._client = AsyncOpenAI(api_key=self.api_key)
        return self._client

    async def embed_text(self, text: str) -> EmbeddingResult:
        """Generate embedding for a single text"""
        response = await self.client.embeddings.create(
            model=self.model,
            input=text,
            dimensions=self.dimensions,
        )

        return EmbeddingResult(
            embedding=response.data[0].embedding,
            text=text,
            model=self.model,
            dimensions=self.dimensions,
        )

    async def embed_texts(self, texts: List[str]) -> List[EmbeddingResult]:
        """Generate embeddings for multiple texts"""
        if not texts:
            return []

        response = await self.client.embeddings.create(
            model=self.model,
            input=texts,
            dimensions=self.dimensions,
        )

        results = []
        for i, embedding_data in enumerate(response.data):
            results.append(EmbeddingResult(
                embedding=embedding_data.embedding,
                text=texts[i],
                model=self.model,
                dimensions=self.dimensions,
            ))

        return results

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        a = np.array(vec1)
        b = np.array(vec2)
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
