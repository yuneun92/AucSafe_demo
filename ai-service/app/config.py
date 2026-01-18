"""
AI Service Configuration
"""
from typing import List, Literal
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    PROJECT_NAME: str = "AucSafe AI Service"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001

    # LLM Provider
    LLM_PROVIDER: Literal["openai", "anthropic"] = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"

    # Embedding
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536

    # Vector Store (Chroma / Pinecone / Qdrant)
    VECTOR_STORE_TYPE: Literal["chroma", "pinecone", "qdrant"] = "chroma"
    CHROMA_PERSIST_DIR: str = "./data/chroma"
    PINECONE_API_KEY: str = ""
    PINECONE_ENVIRONMENT: str = ""
    PINECONE_INDEX_NAME: str = "aucsafe"
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_COLLECTION_NAME: str = "aucsafe"

    # Graph Database (Neo4j)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "password"

    # RAG Settings
    RAG_TOP_K: int = 5
    RAG_SCORE_THRESHOLD: float = 0.7

    # Graph RAG Settings
    GRAPH_RAG_MAX_DEPTH: int = 2
    GRAPH_RAG_MAX_NODES: int = 10

    # Retrieval Mode
    RETRIEVAL_MODE: Literal["rag", "graph", "hybrid"] = "hybrid"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
