import asyncio
import tempfile
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.document import Document
from app.models.ingestion_job import IngestionJob
from app.models.knowledge_base import KnowledgeBase
from app.models.user import User
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    URLSubmission,
)
from app.services.ingestion.indexer import QdrantIndexer
from app.services.ingestion.pipeline import IngestionPipeline

router = APIRouter(prefix="/v1/kb/{kb_id}/documents", tags=["Documents"])

ALLOWED_EXTENSIONS = {".pdf", ".md", ".txt", ".markdown"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


async def _get_user_kb(
    kb_id: uuid.UUID,
    current_user: User,
    db: AsyncSession,
) -> KnowledgeBase:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == current_user.id,
        )
    )
    kb = result.scalar_one_or_none()
    if kb is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge base not found")
    return kb


@router.post("", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    kb_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    kb = await _get_user_kb(kb_id, current_user, db)

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: 50MB",
        )

    tmp_dir = Path(tempfile.mkdtemp())
    file_path = tmp_dir / file.filename
    file_path.write_bytes(content)

    source_type = "pdf" if ext == ".pdf" else "markdown"

    doc = Document(
        kb_id=kb.id,
        name=file.filename or "untitled",
        source_type=source_type,
        source_path=str(file_path),
        file_size=len(content),
    )
    db.add(doc)
    await db.flush()

    job = IngestionJob(document_id=doc.id)
    db.add(job)
    await db.flush()
    await db.refresh(doc)

    asyncio.create_task(_run_ingestion(str(doc.id)))

    return doc


@router.post("/url", response_model=DocumentResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_url(
    kb_id: uuid.UUID,
    body: URLSubmission,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    kb = await _get_user_kb(kb_id, current_user, db)

    doc = Document(
        kb_id=kb.id,
        name=body.url,
        source_type="url",
        source_path=body.url,
        file_size=None,
    )
    db.add(doc)
    await db.flush()

    job = IngestionJob(document_id=doc.id)
    db.add(job)
    await db.flush()
    await db.refresh(doc)

    asyncio.create_task(_run_ingestion(str(doc.id)))

    return doc


@router.get("", response_model=DocumentListResponse)
async def list_documents(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentListResponse:
    await _get_user_kb(kb_id, current_user, db)

    result = await db.execute(
        select(Document)
        .where(Document.kb_id == kb_id)
        .order_by(Document.created_at.desc())
    )
    docs = result.scalars().all()

    return DocumentListResponse(
        items=[DocumentResponse.model_validate(d) for d in docs],
        total=len(docs),
    )


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    kb_id: uuid.UUID,
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    await _get_user_kb(kb_id, current_user, db)

    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.kb_id == kb_id)
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    kb_id: uuid.UUID,
    doc_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> None:
    await _get_user_kb(kb_id, current_user, db)

    result = await db.execute(
        select(Document).where(Document.id == doc_id, Document.kb_id == kb_id)
    )
    doc = result.scalar_one_or_none()
    if doc is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    indexer = QdrantIndexer()
    indexer.delete_document(str(kb_id), str(doc_id))

    # Update KB stats
    kb = await db.get(KnowledgeBase, kb_id)
    if kb:
        kb.doc_count = max(0, kb.doc_count - 1)
        kb.chunk_count = max(0, kb.chunk_count - doc.chunk_count)
        kb.total_tokens = max(0, kb.total_tokens - doc.token_count)

    await db.delete(doc)


async def _run_ingestion(document_id: str) -> None:
    await asyncio.sleep(0.5)  # Allow DB transaction to commit
    pipeline = IngestionPipeline()
    await pipeline.run(document_id)
