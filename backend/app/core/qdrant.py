import logging

from qdrant_client import QdrantClient
from qdrant_client.http.exceptions import UnexpectedResponse
from qdrant_client.models import Distance, VectorParams

from app.core.config import settings

logger = logging.getLogger(__name__)

VECTOR_SIZE = 512  # voyage-3-lite embedding dimension


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(
        url=settings.qdrant_url,
        api_key=settings.qdrant_api_key or None,
    )


async def create_collection(collection_name: str) -> bool:
    client = get_qdrant_client()
    try:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE,
            ),
        )
        logger.info(f"Created Qdrant collection: {collection_name}")
        return True
    except UnexpectedResponse as e:
        if "already exists" in str(e):
            logger.warning(f"Collection already exists: {collection_name}")
            return True
        logger.error(f"Failed to create collection {collection_name}: {e}")
        raise
    finally:
        client.close()


async def delete_collection(collection_name: str) -> bool:
    client = get_qdrant_client()
    try:
        client.delete_collection(collection_name=collection_name)
        logger.info(f"Deleted Qdrant collection: {collection_name}")
        return True
    except UnexpectedResponse as e:
        if "not found" in str(e).lower():
            logger.warning(f"Collection not found (already deleted): {collection_name}")
            return True
        logger.error(f"Failed to delete collection {collection_name}: {e}")
        raise
    finally:
        client.close()


async def check_health() -> bool:
    client = get_qdrant_client()
    try:
        client.get_collections()
        return True
    except Exception:
        return False
    finally:
        client.close()
