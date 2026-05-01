import logging
import uuid

from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue

from app.core.qdrant import get_qdrant_client

logger = logging.getLogger(__name__)

COLLECTION_NAME = "pragmara-vectors"


class QdrantIndexer:
    def __init__(self):
        self.collection_name = COLLECTION_NAME

    def index_chunks(
        self,
        kb_id: str,
        doc_id: str,
        chunks: list[dict],
        embeddings: list[list[float]],
        source: str,
    ) -> int:
        if len(chunks) != len(embeddings):
            raise ValueError(
                f"Chunks ({len(chunks)}) and embeddings ({len(embeddings)}) count mismatch"
            )

        client = get_qdrant_client()

        try:
            self._delete_document_points(client, kb_id, doc_id)

            points = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                point_id = str(uuid.uuid4())
                points.append(PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload={
                        "kb_id": kb_id,
                        "doc_id": doc_id,
                        "source": source,
                        "page": chunk.get("page"),
                        "section": chunk.get("section"),
                        "chunk_index": chunk.get("chunk_index", i),
                        "text": chunk.get("text", ""),
                        "token_count": chunk.get("token_count", 0),
                    },
                ))

            batch_size = 100
            for i in range(0, len(points), batch_size):
                batch = points[i : i + batch_size]
                client.upsert(
                    collection_name=self.collection_name,
                    points=batch,
                )

            logger.info(
                f"Indexed {len(points)} chunks for doc {doc_id} in KB {kb_id}"
            )
            return len(points)

        finally:
            client.close()

    def delete_document(self, kb_id: str, doc_id: str) -> None:
        client = get_qdrant_client()
        try:
            self._delete_document_points(client, kb_id, doc_id)
            logger.info(f"Deleted all points for doc {doc_id} in KB {kb_id}")
        finally:
            client.close()

    def _delete_document_points(self, client: QdrantClient, kb_id: str, doc_id: str) -> None:
        client.delete(
            collection_name=self.collection_name,
            points_selector=Filter(
                must=[
                    FieldCondition(key="kb_id", match=MatchValue(value=kb_id)),
                    FieldCondition(key="doc_id", match=MatchValue(value=doc_id)),
                ]
            ),
        )

    def get_document_count(self, kb_id: str) -> int:
        client = get_qdrant_client()
        try:
            result = client.count(
                collection_name=self.collection_name,
                count_filter=Filter(
                    must=[
                        FieldCondition(key="kb_id", match=MatchValue(value=kb_id)),
                    ]
                ),
            )
            return result.count
        finally:
            client.close()
