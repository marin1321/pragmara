from fastapi import APIRouter

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.knowledge_bases import router as kb_router
from app.api.documents import router as documents_router
from app.api.query import router as query_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(kb_router)
api_router.include_router(documents_router)
api_router.include_router(query_router)
