"""
services/memory-service/karma_graph.py
Karma Memory Graph — persistent context layer.
Combines Qdrant vector store (long-term) + Redis cache (short-term).

Two operations:
  remember(text, metadata) — store a decision, code, or context
  recall(query, k)         — retrieve the most relevant past context
"""

import os
import json
import logging
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

load_dotenv()
logger = logging.getLogger(__name__)

COLLECTION_NAME = "karma_memory"
VECTOR_SIZE = 1536  # OpenAI text-embedding-3-small


class KarmaMemoryGraph:
    """
    Long-term memory using Qdrant vector DB.
    Agents call remember() to store context and recall() to fetch it.
    """

    def __init__(self):
        qdrant_url = os.getenv("QDRANT_URL", ":memory:")

        # Local in-memory for dev, hosted URL for prod
        if qdrant_url == ":memory:":
            self.client = QdrantClient(":memory:")
        else:
            self.client = QdrantClient(
                url=qdrant_url,
                api_key=os.getenv("QDRANT_API_KEY")
            )

        # Create collection if it doesn't exist
        existing = [c.name for c in self.client.get_collections().collections]
        if COLLECTION_NAME not in existing:
            self.client.create_collection(
                COLLECTION_NAME,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
            )
            logger.info(f"Created Qdrant collection: {COLLECTION_NAME}")

        self.embeddings = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=os.getenv("OPENAI_API_KEY")
        )

        self.store = Qdrant(
            client=self.client,
            collection_name=COLLECTION_NAME,
            embeddings=self.embeddings,
        )

    def remember(self, text: str, metadata: dict | None = None) -> None:
        """Store any text with optional metadata tags."""
        self.store.add_texts([text], metadatas=[metadata or {}])
        logger.debug(f"Stored memory: {text[:60]}...")

    def recall(self, query: str, k: int = 5) -> list[str]:
        """Return top-k most relevant stored memories as plain strings."""
        docs = self.store.similarity_search(query, k=k)
        return [doc.page_content for doc in docs]

    def remember_state(self, stage: str, data: dict) -> None:
        """Convenience: store a whole agent state snapshot."""
        text = f"Stage: {stage}\n" + "\n".join(f"{k}: {v}" for k, v in data.items())
        self.remember(text, metadata={"stage": stage})


class KarmaCache:
    """
    Short-term context cache using Redis.
    Used for fast retrieval of the current project's active context.
    Falls back gracefully if Redis is unavailable.
    """

    def __init__(self):
        try:
            import redis
            self.r = redis.Redis(
                host=os.getenv("REDIS_HOST", "localhost"),
                port=int(os.getenv("REDIS_PORT", 6379)),
                password=os.getenv("REDIS_PASSWORD") or None,
                decode_responses=True,
                socket_connect_timeout=2,
            )
            self.r.ping()
            self.available = True
            logger.info("Redis cache connected")
        except Exception as e:
            logger.warning(f"Redis unavailable, running without cache: {e}")
            self._fallback = {}
            self.available = False

    def set(self, key: str, value: dict, ttl: int = 3600) -> None:
        if self.available:
            self.r.setex(key, ttl, json.dumps(value))
        else:
            self._fallback[key] = value

    def get(self, key: str) -> dict | None:
        if self.available:
            val = self.r.get(key)
            return json.loads(val) if val else None
        return self._fallback.get(key)

    def delete(self, key: str) -> None:
        if self.available:
            self.r.delete(key)
        elif key in self._fallback:
            del self._fallback[key]


memory_graph = KarmaMemoryGraph()
karma_cache = KarmaCache()