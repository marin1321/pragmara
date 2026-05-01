from fastapi import APIRouter

from app.core.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health")
async def health_check() -> dict:
    return {
        "status": "ok",
        "version": settings.app_version,
        "environment": settings.app_env,
    }
