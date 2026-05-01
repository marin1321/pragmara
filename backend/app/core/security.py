import secrets
import uuid
from datetime import datetime, timedelta, timezone

import jwt

from app.core.config import settings


def create_access_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def generate_magic_token() -> str:
    return secrets.token_urlsafe(32)
