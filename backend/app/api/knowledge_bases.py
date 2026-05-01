import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.core.qdrant import create_collection, delete_collection
from app.core.utils import generate_collection_name, slugify
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.knowledge_base import KBCreate, KBListResponse, KBResponse, KBUpdate

router = APIRouter(prefix="/v1/kb", tags=["Knowledge Bases"])


@router.get("", response_model=KBListResponse)
async def list_knowledge_bases(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KBListResponse:
    result = await db.execute(
        select(KnowledgeBase)
        .where(KnowledgeBase.user_id == current_user.id)
        .order_by(KnowledgeBase.created_at.desc())
    )
    kbs = result.scalars().all()

    return KBListResponse(
        items=[KBResponse.model_validate(kb) for kb in kbs],
        total=len(kbs),
    )


@router.post("", response_model=KBResponse, status_code=status.HTTP_201_CREATED)
async def create_knowledge_base(
    body: KBCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeBase:
    slug = slugify(body.name)

    existing = await db.execute(
        select(KnowledgeBase).where(KnowledgeBase.slug == slug)
    )
    if existing.scalar_one_or_none() is not None:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"

    collection_name = generate_collection_name(slug)

    kb = KnowledgeBase(
        user_id=current_user.id,
        name=body.name,
        description=body.description,
        slug=slug,
        qdrant_collection=collection_name,
    )
    db.add(kb)
    await db.flush()
    await db.refresh(kb)

    await create_collection(collection_name)

    return kb


@router.get("/{kb_id}", response_model=KBResponse)
async def get_knowledge_base(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeBase:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == current_user.id,
        )
    )
    kb = result.scalar_one_or_none()

    if kb is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    return kb


@router.patch("/{kb_id}", response_model=KBResponse)
async def update_knowledge_base(
    kb_id: uuid.UUID,
    body: KBUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> KnowledgeBase:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == current_user.id,
        )
    )
    kb = result.scalar_one_or_none()

    if kb is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    if body.name is not None:
        kb.name = body.name
    if body.description is not None:
        kb.description = body.description

    await db.flush()
    await db.refresh(kb)

    return kb


@router.delete("/{kb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_knowledge_base(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == current_user.id,
        )
    )
    kb = result.scalar_one_or_none()

    if kb is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )

    await delete_collection(kb.qdrant_collection)
    await db.delete(kb)
