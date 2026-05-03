from datetime import date, datetime

from pydantic import BaseModel


class DailyMetric(BaseModel):
    date: date
    query_count: int
    total_input_tokens: int
    total_output_tokens: int
    avg_faithfulness: float | None
    avg_relevance: float | None
    avg_context_precision: float | None
    avg_latency_ms: float | None


class OverviewMetrics(BaseModel):
    total_queries: int
    total_input_tokens: int
    total_output_tokens: int
    avg_faithfulness: float | None
    avg_relevance: float | None
    avg_context_precision: float | None
    p50_latency_ms: int | None
    p95_latency_ms: int | None


class AnalyticsResponse(BaseModel):
    overview: OverviewMetrics
    daily: list[DailyMetric]


class RecentQuery(BaseModel):
    id: str
    question: str
    answer: str | None
    model: str
    faithfulness_score: float | None
    relevance_score: float | None
    context_precision_score: float | None
    latency_ms: int | None
    created_at: datetime

    class Config:
        from_attributes = True


class RecentQueriesResponse(BaseModel):
    items: list[RecentQuery]
    total: int
