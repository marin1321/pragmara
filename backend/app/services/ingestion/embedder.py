import asyncio
import logging

import voyageai

from app.core.config import settings

logger = logging.getLogger(__name__)

MODEL = "voyage-3-lite"
BATCH_SIZE = 128
MAX_RETRIES = 3
BASE_DELAY = 2.0  # seconds


class EmbeddingService:
    def __init__(self):
        self.client = voyageai.Client(api_key=settings.voyage_api_key)

    async def embed_texts(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []

        all_embeddings: list[list[float]] = []

        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            embeddings = await self._embed_batch_with_retry(batch)
            all_embeddings.extend(embeddings)

        logger.info(f"Embedded {len(texts)} texts in {len(range(0, len(texts), BATCH_SIZE))} batches")
        return all_embeddings

    async def embed_query(self, text: str) -> list[float]:
        result = await self._embed_batch_with_retry([text], input_type="query")
        return result[0]

    async def _embed_batch_with_retry(
        self,
        texts: list[str],
        input_type: str = "document",
    ) -> list[list[float]]:
        for attempt in range(MAX_RETRIES):
            try:
                result = await asyncio.to_thread(
                    self.client.embed,
                    texts,
                    model=MODEL,
                    input_type=input_type,
                )
                return result.embeddings

            except Exception as e:
                error_str = str(e)
                is_rate_limit = "429" in error_str or "rate" in error_str.lower()

                if is_rate_limit and attempt < MAX_RETRIES - 1:
                    delay = BASE_DELAY * (2 ** attempt)
                    logger.warning(
                        f"Rate limited by Voyage AI. Retrying in {delay}s "
                        f"(attempt {attempt + 1}/{MAX_RETRIES})"
                    )
                    await asyncio.sleep(delay)
                    continue

                if attempt == MAX_RETRIES - 1:
                    logger.error(f"Embedding failed after {MAX_RETRIES} attempts: {e}")
                    raise

                raise

        raise RuntimeError("Unexpected: exceeded retry loop without returning or raising")
