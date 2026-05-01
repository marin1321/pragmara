import logging
from dataclasses import dataclass

from qdrant_client.models import Filter, FieldCondition, MatchValue

from app.core.qdrant import get_qdrant_client
from app.services.ingestion.indexer import COLLECTION_NAME

logger = logging.getLogger(__name__)


@dataclass
class SearchResult:
    text: str
    score: float
    source: str
    page: int | None
    section: str | None
    chunk_index: int
    doc_id: str


class HybridSearcher:
    def __init__(self):
        self.collection_name = COLLECTION_NAME

    def search(
        self,
        kb_id: str,
        query_embedding: list[float],
        top_k: int = 10,
    ) -> list[SearchResult]:
        client = get_qdrant_client()

        try:
            results = client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                query_filter=Filter(
                    must=[
                        FieldCondition(key="kb_id", match=MatchValue(value=kb_id)),
                    ]
                ),
                limit=top_k,
                with_payload=True,
            )

            search_results = []
            for hit in results:
                payload = hit.payload or {}
                search_results.append(SearchResult(
                    text=payload.get("text", ""),
                    score=hit.score,
                    source=payload.get("source", ""),
                    page=payload.get("page"),
                    section=payload.get("section"),
                    chunk_index=payload.get("chunk_index", 0),
                    doc_id=payload.get("doc_id", ""),
                ))

            logger.info(f"Search in KB {kb_id}: {len(search_results)} results (top score: {search_results[0].score:.3f})" if search_results else f"Search in KB {kb_id}: 0 results")
            return search_results

        finally:
            client.close()
