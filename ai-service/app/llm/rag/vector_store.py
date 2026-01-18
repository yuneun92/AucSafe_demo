"""
Vector Store implementations for RAG
"""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class Document:
    """Document with embedding"""
    id: str
    content: str
    metadata: Dict[str, Any]
    embedding: Optional[List[float]] = None


@dataclass
class SearchResult:
    """Search result from vector store"""
    document: Document
    score: float


class VectorStore(ABC):
    """Abstract base class for vector stores"""

    @abstractmethod
    async def add_documents(self, documents: List[Document]) -> List[str]:
        """Add documents to the vector store"""
        pass

    @abstractmethod
    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        """Search for similar documents"""
        pass

    @abstractmethod
    async def delete(self, ids: List[str]) -> bool:
        """Delete documents by IDs"""
        pass

    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[Document]:
        """Get document by ID"""
        pass


class ChromaVectorStore(VectorStore):
    """Chroma vector store implementation"""

    def __init__(self, persist_dir: str, collection_name: str = "aucsafe"):
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self._client = None
        self._collection = None

    @property
    def client(self):
        if self._client is None:
            import chromadb
            from chromadb.config import Settings
            self._client = chromadb.PersistentClient(
                path=self.persist_dir,
                settings=Settings(anonymized_telemetry=False)
            )
        return self._client

    @property
    def collection(self):
        if self._collection is None:
            self._collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        return self._collection

    async def add_documents(self, documents: List[Document]) -> List[str]:
        if not documents:
            return []

        ids = [doc.id for doc in documents]
        embeddings = [doc.embedding for doc in documents if doc.embedding]
        contents = [doc.content for doc in documents]
        metadatas = [doc.metadata for doc in documents]

        self.collection.add(
            ids=ids,
            embeddings=embeddings if embeddings else None,
            documents=contents,
            metadatas=metadatas,
        )

        return ids

    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=filter,
            include=["documents", "metadatas", "distances"]
        )

        search_results = []
        if results and results["ids"] and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                # Chroma returns distances, convert to similarity score
                distance = results["distances"][0][i] if results["distances"] else 0
                score = 1 - distance  # Convert distance to similarity

                document = Document(
                    id=doc_id,
                    content=results["documents"][0][i] if results["documents"] else "",
                    metadata=results["metadatas"][0][i] if results["metadatas"] else {},
                )

                search_results.append(SearchResult(document=document, score=score))

        return search_results

    async def delete(self, ids: List[str]) -> bool:
        try:
            self.collection.delete(ids=ids)
            return True
        except Exception:
            return False

    async def get_by_id(self, id: str) -> Optional[Document]:
        results = self.collection.get(ids=[id], include=["documents", "metadatas"])

        if results and results["ids"]:
            return Document(
                id=id,
                content=results["documents"][0] if results["documents"] else "",
                metadata=results["metadatas"][0] if results["metadatas"] else {},
            )
        return None


class QdrantVectorStore(VectorStore):
    """Qdrant vector store implementation"""

    def __init__(
        self,
        url: str,
        collection_name: str = "aucsafe",
        vector_size: int = 1536
    ):
        self.url = url
        self.collection_name = collection_name
        self.vector_size = vector_size
        self._client = None

    @property
    def client(self):
        if self._client is None:
            from qdrant_client import QdrantClient
            self._client = QdrantClient(url=self.url)
            self._ensure_collection()
        return self._client

    def _ensure_collection(self):
        from qdrant_client.models import Distance, VectorParams

        collections = self._client.get_collections().collections
        if not any(c.name == self.collection_name for c in collections):
            self._client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )

    async def add_documents(self, documents: List[Document]) -> List[str]:
        from qdrant_client.models import PointStruct

        points = []
        ids = []

        for doc in documents:
            if doc.embedding:
                point_id = hash(doc.id) % (2**63)  # Convert string ID to integer
                points.append(PointStruct(
                    id=point_id,
                    vector=doc.embedding,
                    payload={
                        "doc_id": doc.id,
                        "content": doc.content,
                        **doc.metadata
                    }
                ))
                ids.append(doc.id)

        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )

        return ids

    async def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filter: Optional[Dict[str, Any]] = None
    ) -> List[SearchResult]:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        qdrant_filter = None
        if filter:
            conditions = [
                FieldCondition(key=k, match=MatchValue(value=v))
                for k, v in filter.items()
            ]
            qdrant_filter = Filter(must=conditions)

        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding,
            limit=top_k,
            query_filter=qdrant_filter,
        )

        search_results = []
        for result in results:
            payload = result.payload or {}
            document = Document(
                id=payload.get("doc_id", str(result.id)),
                content=payload.get("content", ""),
                metadata={k: v for k, v in payload.items() if k not in ["doc_id", "content"]},
            )
            search_results.append(SearchResult(document=document, score=result.score))

        return search_results

    async def delete(self, ids: List[str]) -> bool:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        try:
            for doc_id in ids:
                self.client.delete(
                    collection_name=self.collection_name,
                    points_selector=Filter(
                        must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))]
                    )
                )
            return True
        except Exception:
            return False

    async def get_by_id(self, id: str) -> Optional[Document]:
        from qdrant_client.models import Filter, FieldCondition, MatchValue

        results = self.client.scroll(
            collection_name=self.collection_name,
            scroll_filter=Filter(
                must=[FieldCondition(key="doc_id", match=MatchValue(value=id))]
            ),
            limit=1,
        )

        if results and results[0]:
            point = results[0][0]
            payload = point.payload or {}
            return Document(
                id=id,
                content=payload.get("content", ""),
                metadata={k: v for k, v in payload.items() if k not in ["doc_id", "content"]},
            )
        return None


class VectorStoreFactory:
    """Factory for creating vector store instances"""

    @staticmethod
    def create(
        store_type: str,
        **kwargs
    ) -> VectorStore:
        if store_type == "chroma":
            return ChromaVectorStore(
                persist_dir=kwargs.get("persist_dir", "./data/chroma"),
                collection_name=kwargs.get("collection_name", "aucsafe"),
            )
        elif store_type == "qdrant":
            return QdrantVectorStore(
                url=kwargs.get("url", "http://localhost:6333"),
                collection_name=kwargs.get("collection_name", "aucsafe"),
                vector_size=kwargs.get("vector_size", 1536),
            )
        else:
            raise ValueError(f"Unknown vector store type: {store_type}")
