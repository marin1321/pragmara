import asyncio
import json
import logging

import numpy as np
from groq import AsyncGroq

from app.core.config import settings
from app.services.ingestion.embedder import EmbeddingService

logger = logging.getLogger(__name__)

JUDGE_MODEL = "llama-3.1-8b-instant"

FAITHFULNESS_PROMPT = """You are an evaluation judge. Given the CONTEXT and the ANSWER, assess whether the answer contains claims NOT supported by the context.

Score from 1 to 5:
- 5: Every claim in the answer is directly supported by the context
- 4: Nearly all claims are supported, minor inferences are reasonable
- 3: Some claims are supported, but some are not in the context
- 2: Many claims are not supported by the context
- 1: The answer is mostly fabricated or contradicts the context

CONTEXT:
{context}

ANSWER:
{answer}

Respond ONLY with valid JSON: {{"score": <1-5>, "reasoning": "<brief explanation>"}}"""


class FaithfulnessScorer:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.groq_api_key)

    async def score(self, context: str, answer: str) -> float | None:
        try:
            prompt = FAITHFULNESS_PROMPT.format(
                context=context[:3000],
                answer=answer[:2000],
            )

            response = await self.client.chat.completions.create(
                model=JUDGE_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.0,
            )

            content = response.choices[0].message.content.strip()
            parsed = json.loads(content)
            raw_score = int(parsed["score"])
            normalized = (raw_score - 1) / 4.0
            return round(normalized, 3)

        except Exception as e:
            logger.error(f"Faithfulness scoring failed: {e}")
            return None


class RelevanceScorer:
    def __init__(self):
        self.embedder = EmbeddingService()

    async def score(self, question: str, answer: str) -> float | None:
        try:
            q_emb, a_emb = await asyncio.gather(
                self.embedder.embed_query(question),
                self.embedder.embed_query(answer),
            )

            q_vec = np.array(q_emb)
            a_vec = np.array(a_emb)

            cosine_sim = float(
                np.dot(q_vec, a_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(a_vec))
            )

            return round(max(0.0, min(1.0, cosine_sim)), 3)

        except Exception as e:
            logger.error(f"Relevance scoring failed: {e}")
            return None


class ContextPrecisionScorer:
    def __init__(self):
        self.embedder = EmbeddingService()

    async def score(
        self, question: str, chunk_texts: list[str]
    ) -> float | None:
        if not chunk_texts:
            return None

        try:
            all_texts = [question] + chunk_texts
            embeddings = await self.embedder.embed_texts(all_texts)

            q_vec = np.array(embeddings[0])
            similarities = []

            for chunk_emb in embeddings[1:]:
                c_vec = np.array(chunk_emb)
                sim = float(
                    np.dot(q_vec, c_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(c_vec))
                )
                similarities.append(sim)

            avg_sim = sum(similarities) / len(similarities)
            return round(max(0.0, min(1.0, avg_sim)), 3)

        except Exception as e:
            logger.error(f"Context precision scoring failed: {e}")
            return None


class EvaluationService:
    def __init__(self):
        self.faithfulness = FaithfulnessScorer()
        self.relevance = RelevanceScorer()
        self.context_precision = ContextPrecisionScorer()

    async def evaluate(
        self,
        question: str,
        answer: str,
        context: str,
        chunk_texts: list[str],
    ) -> dict:
        faith_score, rel_score, ctx_score = await asyncio.gather(
            self.faithfulness.score(context, answer),
            self.relevance.score(question, answer),
            self.context_precision.score(question, chunk_texts),
        )

        scores = {
            "faithfulness": faith_score,
            "relevance": rel_score,
            "context_precision": ctx_score,
        }

        logger.info(f"Evaluation scores: {scores}")
        return scores
