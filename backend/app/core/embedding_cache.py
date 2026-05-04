import hashlib
import json
import logging

from app.core.redis import get_redis
from app.core.config import settings

logger = logging.getLogger(__name__)

CACHE_PREFIX = "emb_cache:"
DEFAULT_TTL = 3600


async def get_cached_embedding(text: str) -> list[float] | None:
    key = _cache_key(text)

    try:
        redis = await get_redis()
        cached = await redis.get(key)
        if cached:
            logger.debug(f"Embedding cache HIT: {key[:20]}...")
            return json.loads(cached)
    except Exception as e:
        logger.warning(f"Embedding cache read error: {e}")

    return None


async def cache_embedding(text: str, embedding: list[float]) -> None:
    key = _cache_key(text)
    ttl = getattr(settings, "embedding_cache_ttl", DEFAULT_TTL)

    try:
        redis = await get_redis()
        await redis.set(key, json.dumps(embedding), ex=ttl)
        logger.debug(f"Embedding cache SET: {key[:20]}... (TTL: {ttl}s)")
    except Exception as e:
        logger.warning(f"Embedding cache write error: {e}")


def _cache_key(text: str) -> str:
    text_hash = hashlib.sha256(text.encode()).hexdigest()[:16]
    return f"{CACHE_PREFIX}{text_hash}"
