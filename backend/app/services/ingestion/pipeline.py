import logging
import traceback
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import async_session_factory
from app.models.document import Document
from app.models.ingestion_job import IngestionJob
from app.models.knowledge_base import KnowledgeBase
from app.services.ingestion.chunker import TextChunker
from app.services.ingestion.cleaner import TextCleaner
from app.services.ingestion.embedder import EmbeddingService
from app.services.ingestion.indexer import QdrantIndexer
from app.services.ingestion.parser import DocumentParser

logger = logging.getLogger(__name__)


class IngestionPipeline:
    def __init__(self):
        self.parser = DocumentParser()
        self.cleaner = TextCleaner()
        self.chunker = TextChunker()
        self.embedder = EmbeddingService()
        self.indexer = QdrantIndexer()

    async def run(self, document_id: str) -> None:
        async with async_session_factory() as db:
            try:
                job = await self._get_job(db, document_id)
                doc = await self._get_document(db, document_id)

                if not job or not doc:
                    logger.error(f"Document or job not found: {document_id}")
                    return

                await self._update_job(db, job, status="processing", progress=0.0)

                # Stage 1: Parse
                await self._update_job(db, job, progress=10.0)
                parsed = self._parse_document(doc)

                # Stage 2: Clean
                await self._update_job(db, job, progress=25.0)
                for page in parsed.pages:
                    page.text = self.cleaner.clean(page.text)

                # Stage 3: Chunk
                await self._update_job(db, job, progress=40.0)
                pages_data = [
                    {"text": p.text, "page_number": p.page_number, "section": p.section}
                    for p in parsed.pages
                    if p.text.strip()
                ]
                chunks = self.chunker.chunk_document(pages_data)

                if not chunks:
                    raise ValueError("No chunks produced from document")

                # Stage 4: Embed
                await self._update_job(db, job, progress=60.0)
                texts = [c.text for c in chunks]
                embeddings = await self.embedder.embed_texts(texts)

                # Stage 5: Index
                await self._update_job(db, job, progress=80.0)
                chunk_dicts = [
                    {
                        "text": c.text,
                        "token_count": c.token_count,
                        "chunk_index": c.chunk_index,
                        "page": c.source_page,
                        "section": c.source_section,
                    }
                    for c in chunks
                ]
                self.indexer.index_chunks(
                    kb_id=str(doc.kb_id),
                    doc_id=str(doc.id),
                    chunks=chunk_dicts,
                    embeddings=embeddings,
                    source=doc.name,
                )

                # Stage 6: Update records
                total_tokens = sum(c.token_count for c in chunks)
                doc.status = "indexed"
                doc.chunk_count = len(chunks)
                doc.token_count = total_tokens

                # Update KB stats
                kb = await db.get(KnowledgeBase, doc.kb_id)
                if kb:
                    kb.doc_count = kb.doc_count + 1
                    kb.chunk_count = kb.chunk_count + len(chunks)
                    kb.total_tokens = kb.total_tokens + total_tokens

                await self._update_job(
                    db, job, status="completed", progress=100.0,
                    completed_at=datetime.now(timezone.utc),
                )
                await db.commit()

                logger.info(
                    f"Ingestion complete for doc {document_id}: "
                    f"{len(chunks)} chunks, {total_tokens} tokens"
                )

            except Exception as e:
                logger.error(f"Ingestion failed for doc {document_id}: {e}")
                logger.error(traceback.format_exc())

                async with async_session_factory() as error_db:
                    job = await self._get_job(error_db, document_id)
                    doc = await self._get_document(error_db, document_id)
                    if job:
                        job.status = "failed"
                        job.error_message = str(e)[:500]
                        job.completed_at = datetime.now(timezone.utc)
                    if doc:
                        doc.status = "failed"
                        doc.error_message = str(e)[:500]
                    await error_db.commit()

    def _parse_document(self, doc: Document):
        if doc.source_type == "pdf":
            return self.parser.parse_pdf(doc.source_path)
        elif doc.source_type == "url":
            return self.parser.parse_url(doc.source_path)
        elif doc.source_type == "markdown":
            return self.parser.parse_markdown(doc.source_path)
        else:
            raise ValueError(f"Unsupported source type: {doc.source_type}")

    async def _get_job(self, db: AsyncSession, document_id: str) -> IngestionJob | None:
        result = await db.execute(
            select(IngestionJob).where(IngestionJob.document_id == document_id)
        )
        return result.scalar_one_or_none()

    async def _get_document(self, db: AsyncSession, document_id: str) -> Document | None:
        result = await db.execute(
            select(Document).where(Document.id == document_id)
        )
        return result.scalar_one_or_none()

    async def _update_job(
        self,
        db: AsyncSession,
        job: IngestionJob,
        status: str | None = None,
        progress: float | None = None,
        completed_at: datetime | None = None,
    ) -> None:
        if status:
            job.status = status
        if progress is not None:
            job.progress_pct = progress
        if completed_at:
            job.completed_at = completed_at
        if status == "processing" and not job.started_at:
            job.started_at = datetime.now(timezone.utc)
        await db.commit()
