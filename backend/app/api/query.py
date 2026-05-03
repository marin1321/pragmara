import asyncio
import json
import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, async_session_factory
from app.models.query import Query
from app.services.ingestion.embedder import EmbeddingService
from app.services.evaluation.scorer import EvaluationService
from app.services.retrieval.hybrid_search import HybridSearcher
from app.services.retrieval.llm_streamer import LLMStreamer
from app.services.retrieval.prompt_builder import PromptBuilder
from app.services.retrieval.reranker import Reranker

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/kb/{kb_id}", tags=["Query"])


@router.post("/query")
async def query_knowledge_base(
    kb_id: uuid.UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    body = await request.json()
    question = body.get("question", "").strip()

    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required",
        )

    max_results = body.get("max_results", 5)
    use_rerank = body.get("rerank", True)

    embedder = EmbeddingService()
    query_embedding = await embedder.embed_query(question)

    searcher = HybridSearcher()
    search_results = searcher.search(
        kb_id=str(kb_id),
        query_embedding=query_embedding,
        top_k=max_results * 2 if use_rerank else max_results,
    )

    if not search_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No indexed documents found for this knowledge base. Upload documents first.",
        )

    if use_rerank:
        reranker = Reranker()
        search_results = await reranker.rerank(question, search_results, top_k=max_results)

    prompt_builder = PromptBuilder()
    prompt, used_citations = prompt_builder.build(question, search_results)

    streamer = LLMStreamer()
    chunk_texts = [c.text for c in used_citations]
    context_text = "\n\n".join(chunk_texts)

    async def event_generator():
        full_answer = ""

        async for event in streamer.stream(prompt, used_citations):
            yield event
            try:
                parsed = json.loads(event.strip().removeprefix("data: "))
                if parsed.get("type") == "done":
                    full_answer = parsed.get("answer", "")
            except (json.JSONDecodeError, AttributeError):
                pass

        if full_answer:
            asyncio.create_task(
                _run_evaluation(
                    kb_id=kb_id,
                    question=question,
                    answer=full_answer,
                    context=context_text,
                    chunk_texts=chunk_texts,
                )
            )

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


async def _run_evaluation(
    kb_id: uuid.UUID,
    question: str,
    answer: str,
    context: str,
    chunk_texts: list[str],
) -> None:
    await asyncio.sleep(0.5)
    try:
        evaluator = EvaluationService()
        scores = await evaluator.evaluate(
            question=question,
            answer=answer,
            context=context,
            chunk_texts=chunk_texts,
        )

        async with async_session_factory() as db:
            query_record = Query(
                kb_id=kb_id,
                question=question,
                answer=answer,
                model="llama-3.3-70b-versatile",
                input_tokens=0,
                output_tokens=0,
                faithfulness_score=scores.get("faithfulness"),
                relevance_score=scores.get("relevance"),
                context_precision_score=scores.get("context_precision"),
            )
            db.add(query_record)
            await db.commit()

        logger.info(f"Evaluation complete for KB {kb_id}: {scores}")

    except Exception as e:
        logger.error(f"Evaluation failed: {e}")
