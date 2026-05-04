import logging
import time

import redis.asyncio as aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

redis_client: aioredis.Redis | None = None
_last_failure: float = 0
_RETRY_COOLDOWN = 30


async def get_redis() -> aioredis.Redis | None:
    global redis_client, _last_failure
    if redis_client is not None:
        return redis_client

    if time.time() - _last_failure < _RETRY_COOLDOWN:
        return None

    try:
        kwargs: dict = {
            "decode_responses": True,
            "socket_connect_timeout": 5,
        }
        if settings.redis_url.startswith("rediss://"):
            kwargs["ssl_cert_reqs"] = "none"

        client = aioredis.from_url(settings.redis_url, **kwargs)
        await client.ping()
        redis_client = client
        return redis_client
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
        _last_failure = time.time()
        return None


async def close_redis() -> None:
    global redis_client
    if redis_client is not None:
        try:
            await redis_client.aclose()
        except Exception:
            pass
        redis_client = None


async def check_health() -> bool:
    try:
        client = await get_redis()
        if client is None:
            return False
        await client.ping()
        return True
    except Exception:
        return False
