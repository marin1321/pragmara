import logging
from dataclasses import dataclass

import tiktoken
from langchain_text_splitters import RecursiveCharacterTextSplitter

logger = logging.getLogger(__name__)

CHUNK_SIZE = 800  # tokens
CHUNK_OVERLAP = 80  # tokens
ENCODING_NAME = "cl100k_base"


@dataclass
class Chunk:
    text: str
    token_count: int
    chunk_index: int
    source_page: int | None = None
    source_section: str | None = None


class TextChunker:
    def __init__(
        self,
        chunk_size: int = CHUNK_SIZE,
        chunk_overlap: int = CHUNK_OVERLAP,
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.get_encoding(ENCODING_NAME)
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=self._token_length,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def _token_length(self, text: str) -> int:
        return len(self.encoding.encode(text))

    def chunk_text(
        self,
        text: str,
        page_number: int | None = None,
        section: str | None = None,
    ) -> list[Chunk]:
        if not text.strip():
            return []

        splits = self.splitter.split_text(text)
        chunks: list[Chunk] = []

        for i, split in enumerate(splits):
            token_count = self._token_length(split)
            chunks.append(Chunk(
                text=split,
                token_count=token_count,
                chunk_index=i,
                source_page=page_number,
                source_section=section,
            ))

        return chunks

    def chunk_document(self, pages: list[dict]) -> list[Chunk]:
        all_chunks: list[Chunk] = []
        global_index = 0

        for page in pages:
            text = page.get("text", "")
            page_number = page.get("page_number")
            section = page.get("section")

            page_chunks = self.chunk_text(text, page_number, section)

            for chunk in page_chunks:
                chunk.chunk_index = global_index
                all_chunks.append(chunk)
                global_index += 1

        total_tokens = sum(c.token_count for c in all_chunks)
        logger.info(
            f"Chunked document: {len(all_chunks)} chunks, {total_tokens} total tokens"
        )

        return all_chunks
