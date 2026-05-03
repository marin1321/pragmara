import logging
import os
from contextlib import asynccontextmanager
from collections.abc import AsyncGenerator

import sentry_sdk
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration

from app.core.config import settings
from app.core.redis import close_redis
from app.api import api_router

logger = logging.getLogger(__name__)


def _init_sentry() -> None:
    if settings.sentry_dsn:
        sentry_sdk.init(
            dsn=settings.sentry_dsn,
            environment=settings.app_env,
            release=f"pragmara-api@{settings.app_version}",
            traces_sample_rate=0.2 if settings.app_env == "production" else 1.0,
            integrations=[FastApiIntegration(), SqlalchemyIntegration()],
            send_default_pii=False,
        )
        logger.info("Sentry initialized")


def _init_langsmith() -> None:
    if settings.langsmith_api_key:
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.langsmith_api_key
        os.environ["LANGCHAIN_PROJECT"] = settings.langsmith_project
        logger.info(f"LangSmith tracing enabled (project: {settings.langsmith_project})")


def _configure_logging() -> None:
    log_level = logging.DEBUG if settings.is_development else logging.INFO
    log_format = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"

    if settings.app_env == "production":
        log_format = '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'

    logging.basicConfig(level=log_level, format=log_format, force=True)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    _configure_logging()
    _init_sentry()
    _init_langsmith()
    logger.info(f"Pragmara API v{settings.app_version} started ({settings.app_env})")
    yield
    await close_redis()
    logger.info("Pragmara API shutting down")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    allowed_origins = [settings.frontend_url]
    if settings.app_env == "production":
        allowed_origins.extend([
            "https://pragmara.vercel.app",
            "https://pragmara-app.vercel.app",
        ])

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router)

    return app


app = create_app()
