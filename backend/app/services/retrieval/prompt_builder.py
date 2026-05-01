import tiktoken

from app.services.retrieval.hybrid_search import SearchResult

ENCODING = "cl100k_base"
MAX_CONTEXT_TOKENS = 5000
MAX_TOTAL_TOKENS = 6500

SYSTEM_PROMPT = """You are Pragmara, a precise technical documentation assistant. Answer questions based ONLY on the provided context.

Rules:
1. Only use information from the context below. Do not use prior knowledge.
2. Cite your sources using [1], [2], etc. matching the context numbers.
3. If the context does not contain enough information to answer, say "I don't have enough information in the indexed documents to answer this question."
4. Be concise and technical. Format code with markdown code blocks.
5. If multiple sources are relevant, synthesize them and cite all."""


class PromptBuilder:
    def __init__(self):
        self.encoding = tiktoken.get_encoding(ENCODING)

    def build(
        self,
        question: str,
        search_results: list[SearchResult],
    ) -> tuple[str, list[SearchResult]]:
        context_parts: list[str] = []
        used_results: list[SearchResult] = []
        token_count = self._count_tokens(SYSTEM_PROMPT) + self._count_tokens(question) + 100

        for i, result in enumerate(search_results):
            citation = f"[{i + 1}]"
            source_info = f"Source: {result.source}"
            if result.page:
                source_info += f", Page {result.page}"
            if result.section:
                source_info += f", Section: {result.section}"

            chunk_text = f"{citation} {source_info}\n{result.text}"
            chunk_tokens = self._count_tokens(chunk_text)

            if token_count + chunk_tokens > MAX_CONTEXT_TOKENS:
                break

            context_parts.append(chunk_text)
            used_results.append(result)
            token_count += chunk_tokens

        if not context_parts:
            context = "No relevant context found."
        else:
            context = "\n\n---\n\n".join(context_parts)

        prompt = f"""{SYSTEM_PROMPT}

## Context

{context}

## Question

{question}"""

        return prompt, used_results

    def _count_tokens(self, text: str) -> int:
        return len(self.encoding.encode(text))
