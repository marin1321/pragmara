import asyncio
import logging
import time
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sentence_transformers import CrossEncoder

from app.services.retrieval.hybrid_search import SearchResult

logger = logging.getLogger(__name__)

MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-6-v2"
RERANK_TIMEOUT = 2.0

_model: "CrossEncoder | None" = None


def _get_model() -> "CrossEncoder":
    global _model
    if _model is None:
        from sentence_transformers import CrossEncoder

        logger.info(f"Loading cross-encoder model: {MODEL_NAME}")
        _model = CrossEncoder(MODEL_NAME)
        logger.info("Cross-encoder model loaded")
    return _model


class Reranker:
    async def rerank(
        self,
        query: str,
        results: list[SearchResult],
        top_k: int = 5,
    ) -> list[SearchResult]:
        if not results or len(results) <= 1:
            return results

        try:
            reranked = await asyncio.wait_for(
                asyncio.to_thread(self._rerank_sync, query, results, top_k),
                timeout=RERANK_TIMEOUT,
            )
            return reranked

        except asyncio.TimeoutError:
            logger.warning(
                f"Reranking timed out after {RERANK_TIMEOUT}s, "
                f"returning original results"
            )
            return results[:top_k]

        except Exception as e:
            logger.error(f"Reranking failed: {e}, returning original results")
            return results[:top_k]

    def _rerank_sync(
        self,
        query: str,
        results: list[SearchResult],
        top_k: int,
    ) -> list[SearchResult]:
        start = time.time()
        model = _get_model()

        pairs = [(query, r.text) for r in results]
        scores = model.predict(pairs)

        scored_results = list(zip(results, scores))
        scored_results.sort(key=lambda x: x[1], reverse=True)

        reranked = [r for r, _ in scored_results[:top_k]]

        elapsed_ms = int((time.time() - start) * 1000)
        logger.info(
            f"Reranked {len(results)} → {len(reranked)} results in {elapsed_ms}ms"
        )

        return reranked
