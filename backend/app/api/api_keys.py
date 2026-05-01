import hashlib
import secrets
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.api_key import APIKey
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.api_key import APIKeyCreate, APIKeyCreated, APIKeyListResponse, APIKeyResponse

router = APIRouter(prefix="/v1/kb/{kb_id}/keys", tags=["API Keys"])

KEY_PREFIX = "pgm_"


def _generate_api_key() -> str:
    return KEY_PREFIX + secrets.token_urlsafe(32)


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


async def _get_user_kb(kb_id: uuid.UUID, user: User, db: AsyncSession) -> KnowledgeBase:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == user.id,
        )
    )
    kb = result.scalar_one_or_none()
    if kb is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge base not found")
    return kb


@router.post("", response_model=APIKeyCreated, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    kb_id: uuid.UUID,
    body: APIKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIKeyCreated:
    await _get_user_kb(kb_id, current_user, db)

    raw_key = _generate_api_key()
    key_hash = _hash_key(raw_key)

    api_key = APIKey(
        kb_id=kb_id,
        name=body.name,
        key_hash=key_hash,
    )
    db.add(api_key)
    await db.flush()
    await db.refresh(api_key)

    return APIKeyCreated(
        id=str(api_key.id),
        name=api_key.name,
        key=raw_key,
    )


@router.get("", response_model=APIKeyListResponse)
async def list_api_keys(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> APIKeyListResponse:
    await _get_user_kb(kb_id, current_user, db)

    result = await db.execute(
        select(APIKey)
        .where(APIKey.kb_id == kb_id, APIKey.is_active == True)
        .order_by(APIKey.created_at.desc())
    )
    keys = result.scalars().all()

    return APIKeyListResponse(
        items=[APIKeyResponse.model_validate(k) for k in keys],
        total=len(keys),
    )


@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_api_key(
    kb_id: uuid.UUID,
    key_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_user_kb(kb_id, current_user, db)

    result = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.kb_id == kb_id)
    )
    api_key = result.scalar_one_or_none()
    if api_key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")

    api_key.is_active = False
