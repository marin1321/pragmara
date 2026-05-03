import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select, cast, Date
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.models.knowledge_base import KnowledgeBase
from app.models.query import Query as QueryModel
from app.models.user import User
from app.schemas.analytics import (
    AnalyticsResponse,
    DailyMetric,
    OverviewMetrics,
    RecentQueriesResponse,
    RecentQuery,
)

router = APIRouter(prefix="/v1/kb/{kb_id}/analytics", tags=["Analytics"])


async def _verify_kb_ownership(
    kb_id: uuid.UUID, user: User, db: AsyncSession
) -> None:
    result = await db.execute(
        select(KnowledgeBase).where(
            KnowledgeBase.id == kb_id,
            KnowledgeBase.user_id == user.id,
        )
    )
    if result.scalar_one_or_none() is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge base not found",
        )


@router.get("", response_model=AnalyticsResponse)
async def get_analytics(
    kb_id: uuid.UUID,
    days: int = Query(default=30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsResponse:
    await _verify_kb_ownership(kb_id, current_user, db)

    since = datetime.now(timezone.utc) - timedelta(days=days)

    overview_result = await db.execute(
        select(
            func.count(QueryModel.id).label("total_queries"),
            func.coalesce(func.sum(QueryModel.input_tokens), 0).label("total_input_tokens"),
            func.coalesce(func.sum(QueryModel.output_tokens), 0).label("total_output_tokens"),
            func.avg(QueryModel.faithfulness_score).label("avg_faithfulness"),
            func.avg(QueryModel.relevance_score).label("avg_relevance"),
            func.avg(QueryModel.context_precision_score).label("avg_context_precision"),
        ).where(
            QueryModel.kb_id == kb_id,
            QueryModel.created_at >= since,
        )
    )
    overview_row = overview_result.one()

    latency_result = await db.execute(
        select(QueryModel.latency_ms)
        .where(
            QueryModel.kb_id == kb_id,
            QueryModel.created_at >= since,
            QueryModel.latency_ms.isnot(None),
        )
        .order_by(QueryModel.latency_ms)
    )
    latencies = [row[0] for row in latency_result.all()]

    p50 = _percentile(latencies, 50) if latencies else None
    p95 = _percentile(latencies, 95) if latencies else None

    overview = OverviewMetrics(
        total_queries=overview_row.total_queries,
        total_input_tokens=overview_row.total_input_tokens,
        total_output_tokens=overview_row.total_output_tokens,
        avg_faithfulness=_round_or_none(overview_row.avg_faithfulness),
        avg_relevance=_round_or_none(overview_row.avg_relevance),
        avg_context_precision=_round_or_none(overview_row.avg_context_precision),
        p50_latency_ms=p50,
        p95_latency_ms=p95,
    )

    daily_result = await db.execute(
        select(
            cast(QueryModel.created_at, Date).label("day"),
            func.count(QueryModel.id).label("query_count"),
            func.coalesce(func.sum(QueryModel.input_tokens), 0).label("total_input_tokens"),
            func.coalesce(func.sum(QueryModel.output_tokens), 0).label("total_output_tokens"),
            func.avg(QueryModel.faithfulness_score).label("avg_faithfulness"),
            func.avg(QueryModel.relevance_score).label("avg_relevance"),
            func.avg(QueryModel.context_precision_score).label("avg_context_precision"),
            func.avg(QueryModel.latency_ms).label("avg_latency_ms"),
        )
        .where(
            QueryModel.kb_id == kb_id,
            QueryModel.created_at >= since,
        )
        .group_by("day")
        .order_by("day")
    )

    daily = [
        DailyMetric(
            date=row.day,
            query_count=row.query_count,
            total_input_tokens=row.total_input_tokens,
            total_output_tokens=row.total_output_tokens,
            avg_faithfulness=_round_or_none(row.avg_faithfulness),
            avg_relevance=_round_or_none(row.avg_relevance),
            avg_context_precision=_round_or_none(row.avg_context_precision),
            avg_latency_ms=_round_or_none(row.avg_latency_ms),
        )
        for row in daily_result.all()
    ]

    return AnalyticsResponse(overview=overview, daily=daily)


@router.get("/recent", response_model=RecentQueriesResponse)
async def get_recent_queries(
    kb_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RecentQueriesResponse:
    await _verify_kb_ownership(kb_id, current_user, db)

    result = await db.execute(
        select(QueryModel)
        .where(QueryModel.kb_id == kb_id)
        .order_by(QueryModel.created_at.desc())
        .limit(10)
    )
    queries = result.scalars().all()

    return RecentQueriesResponse(
        items=[RecentQuery.model_validate(q) for q in queries],
        total=len(queries),
    )


def _round_or_none(value: float | None, decimals: int = 3) -> float | None:
    if value is None:
        return None
    return round(float(value), decimals)


def _percentile(sorted_values: list[int], pct: int) -> int:
    if not sorted_values:
        return 0
    idx = int(len(sorted_values) * pct / 100)
    idx = min(idx, len(sorted_values) - 1)
    return sorted_values[idx]
