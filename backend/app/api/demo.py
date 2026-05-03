import asyncio
import json
import logging

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import StreamingResponse

from app.core.config import settings
from app.core.embedding_cache import cache_embedding, get_cached_embedding
from app.core.redis import get_redis
from app.services.ingestion.embedder import EmbeddingService
from app.services.retrieval.hybrid_search import HybridSearcher
from app.services.retrieval.llm_streamer import LLMStreamer
from app.services.retrieval.prompt_builder import PromptBuilder
from app.services.retrieval.reranker import Reranker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/demo", tags=["Demo"])

DEMO_RATE_LIMIT = 20
DEMO_RATE_WINDOW = 86400


async def _check_demo_rate_limit(ip: str) -> None:
    redis = await get_redis()
    if not redis:
        return

    key = f"demo:rate:{ip}"
    count = await redis.get(key)

    if count and int(count) >= DEMO_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demo limit reached (20 queries/day). Sign up for unlimited access.",
        )

    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, DEMO_RATE_WINDOW)
    await pipe.execute()


@router.post("/query")
async def demo_query(request: Request) -> StreamingResponse:
    demo_kb_id = settings.demo_kb_id
    if not demo_kb_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Demo is not configured",
        )

    client_ip = request.headers.get("X-Forwarded-For", request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    await _check_demo_rate_limit(client_ip)

    body = await request.json()
    question = body.get("question", "").strip()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required",
        )

    if len(question) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question too long (max 500 characters)",
        )

    cached = await get_cached_embedding(question)
    if cached:
        query_embedding = cached
    else:
        embedder = EmbeddingService()
        query_embedding = await embedder.embed_query(question)
        await cache_embedding(question, query_embedding)

    searcher = HybridSearcher()
    search_results = searcher.search(
        kb_id=demo_kb_id,
        query_embedding=query_embedding,
        top_k=10,
    )

    if not search_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo knowledge base has no indexed documents.",
        )

    reranker = Reranker()
    search_results = await reranker.rerank(question, search_results, top_k=5)

    prompt_builder = PromptBuilder()
    prompt, used_citations = prompt_builder.build(question, search_results)

    streamer = LLMStreamer()

    async def event_generator():
        async for event in streamer.stream(prompt, used_citations):
            yield event

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
