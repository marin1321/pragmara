import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.query import Query


class UsageTracker:
    async def record_query(
        self,
        db: AsyncSession,
        kb_id: uuid.UUID,
        api_key_id: uuid.UUID | None,
        question: str,
        answer: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        latency_ms: int,
    ) -> Query:
        query = Query(
            kb_id=kb_id,
            api_key_id=api_key_id,
            question=question,
            answer=answer,
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            latency_ms=latency_ms,
        )
        db.add(query)
        await db.flush()
        return query
