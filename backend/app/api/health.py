from fastapi import APIRouter

from app.core.config import settings
from app.core.qdrant import check_health as qdrant_health
from app.core.redis import check_health as redis_health

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    qdrant_ok = await qdrant_health()
    redis_ok = await redis_health()

    all_healthy = qdrant_ok and redis_ok

    return {
        "status": "ok" if all_healthy else "degraded",
        "version": settings.app_version,
        "environment": settings.app_env,
        "services": {
            "qdrant": "ok" if qdrant_ok else "unavailable",
            "redis": "ok" if redis_ok else "unavailable",
        },
    }
