import hashlib
import uuid
from datetime import datetime, timezone

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.api_key import APIKey
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User

security_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id = uuid.UUID(payload["sub"])
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_api_key_auth(
    kb_id: uuid.UUID,
    x_pragmara_key: str = Header(..., alias="X-Pragmara-Key"),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeBase:
    key_hash = hashlib.sha256(x_pragmara_key.encode()).hexdigest()

    result = await db.execute(
        select(APIKey).where(
            APIKey.key_hash == key_hash,
            APIKey.is_active.is_(True),
        )
    )
    api_key = result.scalar_one_or_none()

    if api_key is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked API key",
        )

    if api_key.kb_id != kb_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key does not belong to this knowledge base",
        )

    api_key.last_used_at = datetime.now(timezone.utc)

    kb = await db.get(KnowledgeBase, kb_id)
    if kb is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    return kb
