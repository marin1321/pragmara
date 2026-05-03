from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Pragmara"
    app_version: str = "0.1.0"
    app_env: str = "development"
    app_debug: bool = False
    frontend_url: str = "http://localhost:3000"

    # Database
    database_url: str = "postgresql+asyncpg://pragmara:pragmara_dev@localhost:5432/pragmara"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Qdrant
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    # Auth
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_hours: int = 24
    magic_link_expire_minutes: int = 15

    # Email (Resend)
    resend_api_key: str = ""

    # AI Providers
    groq_api_key: str = ""
    voyage_api_key: str = ""

    # Cache
    embedding_cache_ttl: int = 3600

    # Observability
    langsmith_api_key: str = ""
    langsmith_project: str = "pragmara"
    sentry_dsn: str = ""

    @property
    def is_development(self) -> bool:
        return self.app_env == "development"


settings = Settings()
