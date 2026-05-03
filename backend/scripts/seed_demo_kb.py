"""
Seed script for the demo Knowledge Base.

Creates a demo user and KB, then ingests the sample documentation
from scripts/sample_docs/. Run this after database migrations.

Usage:
    cd backend
    python scripts/seed_demo_kb.py

The script outputs the DEMO_KB_ID to configure in your environment.
"""

import asyncio
import os
import sys
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.config import settings  # noqa: E402
from app.core.database import async_session_factory, engine  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.knowledge_base import KnowledgeBase  # noqa: E402
from app.models.document import Document  # noqa: E402
from app.services.ingestion.pipeline import IngestionPipeline  # noqa: E402

DEMO_EMAIL = "demo@pragmara.dev"
DEMO_KB_NAME = "Python & FastAPI Docs"
DEMO_KB_DESCRIPTION = "Sample documentation for demonstrating Pragmara's RAG capabilities"
SAMPLE_DOCS_DIR = Path(__file__).parent / "sample_docs"


async def get_or_create_demo_user(db) -> User:
    from sqlalchemy import select

    result = await db.execute(select(User).where(User.email == DEMO_EMAIL))
    user = result.scalar_one_or_none()

    if user:
        print(f"  Demo user already exists: {user.id}")
        return user

    user = User(
        id=uuid.uuid4(),
        email=DEMO_EMAIL,
        name="Demo User",
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    print(f"  Created demo user: {user.id}")
    return user


async def get_or_create_demo_kb(db, user_id: uuid.UUID) -> KnowledgeBase:
    from sqlalchemy import select

    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.user_id == user_id,
            KnowledgeBase.name == DEMO_KB_NAME,
        )
    )
    kb = result.scalar_one_or_none()

    if kb:
        print(f"  Demo KB already exists: {kb.id}")
        return kb

    kb = KnowledgeBase(
        id=uuid.uuid4(),
        user_id=user_id,
        name=DEMO_KB_NAME,
        description=DEMO_KB_DESCRIPTION,
    )
    db.add(kb)
    await db.commit()
    await db.refresh(kb)
    print(f"  Created demo KB: {kb.id}")
    return kb


async def ingest_sample_docs(db, kb: KnowledgeBase) -> None:
    md_files = sorted(SAMPLE_DOCS_DIR.glob("*.md"))

    if not md_files:
        print("  No sample documents found!")
        return

    for md_file in md_files:
        from sqlalchemy import select

        result = await db.execute(
            select(Document).where(
                Document.kb_id == kb.id,
                Document.name == md_file.name,
            )
        )
        existing = result.scalar_one_or_none()

        if existing and existing.status == "indexed":
            print(f"  Skipping {md_file.name} (already indexed)")
            continue

        if existing:
            await db.delete(existing)
            await db.commit()

        doc = Document(
            id=uuid.uuid4(),
            kb_id=kb.id,
            name=md_file.name,
            source_type="markdown",
            source_path=str(md_file),
            file_size=md_file.stat().st_size,
            status="pending",
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)

        print(f"  Ingesting {md_file.name}...")

        try:
            pipeline = IngestionPipeline()
            await pipeline.run(
                document_id=doc.id,
                kb_id=kb.id,
                file_path=str(md_file),
                source_type="markdown",
            )
            print(f"    ✓ {md_file.name} indexed successfully")
        except Exception as e:
            print(f"    ✗ {md_file.name} failed: {e}")


async def main():
    print("=" * 50)
    print("  Pragmara Demo KB Seeding Script")
    print("=" * 50)
    print()

    print("[1/3] Setting up demo user...")
    async with async_session_factory() as db:
        user = await get_or_create_demo_user(db)

    print("[2/3] Setting up demo KB...")
    async with async_session_factory() as db:
        kb = await get_or_create_demo_kb(db, user.id)

    print("[3/3] Ingesting sample documents...")
    async with async_session_factory() as db:
        await ingest_sample_docs(db, kb)

    print()
    print("=" * 50)
    print(f"  DEMO_KB_ID={kb.id}")
    print()
    print("  Add this to your .env file:")
    print(f"  DEMO_KB_ID={kb.id}")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
