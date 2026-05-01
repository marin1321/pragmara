import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.ingestion.embedder import EmbeddingService
from app.services.retrieval.hybrid_search import HybridSearcher
from app.services.retrieval.llm_streamer import LLMStreamer
from app.services.retrieval.prompt_builder import PromptBuilder
from app.services.usage import UsageTracker

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

    # Embed the query
    embedder = EmbeddingService()
    query_embedding = await embedder.embed_query(question)

    # Search for relevant chunks
    searcher = HybridSearcher()
    search_results = searcher.search(
        kb_id=str(kb_id),
        query_embedding=query_embedding,
        top_k=max_results,
    )

    if not search_results:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No indexed documents found for this knowledge base. Upload documents first.",
        )

    # Build prompt with context
    prompt_builder = PromptBuilder()
    prompt, used_citations = prompt_builder.build(question, search_results)

    # Stream LLM response
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
