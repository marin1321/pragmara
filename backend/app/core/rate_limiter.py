import logging
import time

from app.core.redis import get_redis

logger = logging.getLogger(__name__)

DEFAULT_LIMIT = 100
DEFAULT_WINDOW = 60


class RateLimitExceeded(Exception):
    def __init__(self, limit: int, window: int, retry_after: int):
        self.limit = limit
        self.window = window
        self.retry_after = retry_after
        super().__init__(
            f"Rate limit exceeded. You can make {limit} queries per minute."
        )


async def check_rate_limit(
    key_id: str,
    limit: int = DEFAULT_LIMIT,
    window_seconds: int = DEFAULT_WINDOW,
) -> dict:
    redis = get_redis()
    now = time.time()
    window_start = now - window_seconds
    redis_key = f"rate_limit:{key_id}"

    pipe = redis.pipeline()
    pipe.zremrangebyscore(redis_key, 0, window_start)
    pipe.zadd(redis_key, {str(now): now})
    pipe.zcard(redis_key)
    pipe.expire(redis_key, window_seconds)
    results = await pipe.execute()

    current_count = results[2]

    remaining = max(0, limit - current_count)
    reset_at = int(now + window_seconds)

    headers = {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(remaining),
        "X-RateLimit-Reset": str(reset_at),
    }

    if current_count > limit:
        raise RateLimitExceeded(
            limit=limit,
            window=window_seconds,
            retry_after=window_seconds,
        )

    return headers
