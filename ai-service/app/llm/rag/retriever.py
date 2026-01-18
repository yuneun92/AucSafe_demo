"""
RAG Retriever - Document retrieval using vector similarity
"""
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

from .embeddings import EmbeddingService
from .vector_store import VectorStore, Document, SearchResult


@dataclass
class RetrievalResult:
    """Result from RAG retrieval"""
    documents: List[Document]
    scores: List[float]
    query: str
    context: str  # Combined context from documents


class RAGRetriever:
    """RAG Retriever for document-based retrieval"""

    def __init__(
        self,
        embedding_service: EmbeddingService,
        vector_store: VectorStore,
        top_k: int = 5,
        score_threshold: float = 0.7
    ):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        self.top_k = top_k
        self.score_threshold = score_threshold

    async def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        filter: Optional[Dict[str, Any]] = None,
        score_threshold: Optional[float] = None
    ) -> RetrievalResult:
        """Retrieve relevant documents for a query"""
        k = top_k or self.top_k
        threshold = score_threshold or self.score_threshold

        # Generate query embedding
        query_embedding = await self.embedding_service.embed_text(query)

        # Search vector store
        search_results = await self.vector_store.search(
            query_embedding=query_embedding.embedding,
            top_k=k,
            filter=filter
        )

        # Filter by score threshold
        filtered_results = [
            r for r in search_results
            if r.score >= threshold
        ]

        # Extract documents and scores
        documents = [r.document for r in filtered_results]
        scores = [r.score for r in filtered_results]

        # Build combined context
        context = self._build_context(documents)

        return RetrievalResult(
            documents=documents,
            scores=scores,
            query=query,
            context=context
        )

    def _build_context(self, documents: List[Document]) -> str:
        """Build combined context from retrieved documents"""
        if not documents:
            return ""

        context_parts = []
        for i, doc in enumerate(documents, 1):
            # Add document with metadata context
            metadata_str = ""
            if doc.metadata:
                relevant_keys = ["title", "source", "type", "category"]
                meta_items = [
                    f"{k}: {v}"
                    for k, v in doc.metadata.items()
                    if k in relevant_keys and v
                ]
                if meta_items:
                    metadata_str = f" ({', '.join(meta_items)})"

            context_parts.append(f"[문서 {i}{metadata_str}]\n{doc.content}")

        return "\n\n".join(context_parts)

    async def add_documents(
        self,
        documents: List[Dict[str, Any]]
    ) -> List[str]:
        """Add documents to the vector store with embeddings"""
        if not documents:
            return []

        # Extract texts for embedding
        texts = [doc.get("content", "") for doc in documents]

        # Generate embeddings
        embeddings = await self.embedding_service.embed_texts(texts)

        # Create Document objects
        doc_objects = []
        for i, doc in enumerate(documents):
            doc_objects.append(Document(
                id=doc.get("id", f"doc_{i}"),
                content=doc.get("content", ""),
                metadata=doc.get("metadata", {}),
                embedding=embeddings[i].embedding if i < len(embeddings) else None
            ))

        # Add to vector store
        return await self.vector_store.add_documents(doc_objects)

    async def delete_documents(self, ids: List[str]) -> bool:
        """Delete documents from the vector store"""
        return await self.vector_store.delete(ids)
