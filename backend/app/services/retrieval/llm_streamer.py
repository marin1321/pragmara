import json
import logging
from collections.abc import AsyncGenerator

from groq import AsyncGroq

from app.core.config import settings
from app.services.retrieval.hybrid_search import SearchResult

logger = logging.getLogger(__name__)

MODEL = "llama-3.3-70b-versatile"


class LLMStreamer:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)

    async def stream(
        self,
        prompt: str,
        citations: list[SearchResult],
    ) -> AsyncGenerator[str, None]:
        start_time = time.time()
        total_output_tokens = 0
        full_response = ""

        try:
            response = await self.client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "user", "content": prompt},
                ],
                stream=True,
                max_tokens=1024,
                temperature=0.1,
            )

            async for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    full_response += token
                    total_output_tokens += 1
                    yield self._sse_event("token", {"content": token})

            # Emit citations
            citations_data = [
                {
                    "source": c.source,
                    "page": c.page,
                    "section": c.section,
                    "excerpt": c.text[:150],
                    "score": round(c.score, 3),
                }
                for c in citations
            ]
            yield self._sse_event("citations", {"data": citations_data})

            # Emit done with usage stats
            latency_ms = int((time.time() - start_time) * 1000)
            yield self._sse_event("done", {
                "usage": {
                    "output_tokens": total_output_tokens,
                    "latency_ms": latency_ms,
                    "model": MODEL,
                },
                "answer": full_response,
            })

        except Exception as e:
            logger.error(f"LLM streaming error: {e}")
            yield self._sse_event("error", {"message": str(e)})

    def _sse_event(self, event_type: str, data: dict) -> str:
        payload = {"type": event_type, **data}
        return f"data: {json.dumps(payload)}\n\n"
