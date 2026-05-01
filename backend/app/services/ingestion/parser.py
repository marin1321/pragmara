import logging
from dataclasses import dataclass, field
from pathlib import Path

import fitz  # PyMuPDF
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class ParsedPage:
    text: str
    page_number: int | None = None
    section: str | None = None
    metadata: dict = field(default_factory=dict)


@dataclass
class ParsedDocument:
    pages: list[ParsedPage]
    title: str | None = None
    source_type: str = ""
    metadata: dict = field(default_factory=dict)

    @property
    def full_text(self) -> str:
        return "\n\n".join(p.text for p in self.pages if p.text.strip())


class DocumentParser:
    def parse_pdf(self, file_path: str | Path) -> ParsedDocument:
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"PDF not found: {file_path}")

        pages: list[ParsedPage] = []
        doc = fitz.open(str(file_path))

        try:
            for page_num in range(len(doc)):
                page = doc[page_num]
                text = page.get_text("text")

                if text.strip():
                    pages.append(ParsedPage(
                        text=text.strip(),
                        page_number=page_num + 1,
                        metadata={"file": file_path.name},
                    ))
        finally:
            doc.close()

        title = file_path.stem.replace("-", " ").replace("_", " ").title()

        if not pages:
            raise ValueError(f"No extractable text found in PDF: {file_path.name}")

        logger.info(f"Parsed PDF '{file_path.name}': {len(pages)} pages")
        return ParsedDocument(pages=pages, title=title, source_type="pdf")

    def parse_url(self, url: str) -> ParsedDocument:
        try:
            response = requests.get(url, timeout=30, headers={
                "User-Agent": "Pragmara/1.0 (Document Indexer)"
            })
            response.raise_for_status()
        except requests.RequestException as e:
            raise ValueError(f"Failed to fetch URL: {e}")

        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        title = soup.title.string.strip() if soup.title and soup.title.string else url

        main_content = soup.find("main") or soup.find("article") or soup.find("body")
        if main_content is None:
            raise ValueError(f"No content found at URL: {url}")

        text = main_content.get_text(separator="\n", strip=True)

        if len(text) < 50:
            raise ValueError(f"Insufficient content extracted from URL: {url}")

        pages = [ParsedPage(
            text=text,
            page_number=None,
            section=title,
            metadata={"url": url},
        )]

        logger.info(f"Parsed URL '{url}': {len(text)} chars")
        return ParsedDocument(pages=pages, title=title, source_type="url")

    def parse_markdown(self, file_path: str | Path) -> ParsedDocument:
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"Markdown file not found: {file_path}")

        content = file_path.read_text(encoding="utf-8")

        if not content.strip():
            raise ValueError(f"Empty markdown file: {file_path.name}")

        sections = self._split_markdown_sections(content)
        title = file_path.stem.replace("-", " ").replace("_", " ").title()

        logger.info(f"Parsed Markdown '{file_path.name}': {len(sections)} sections")
        return ParsedDocument(pages=sections, title=title, source_type="markdown")

    def _split_markdown_sections(self, content: str) -> list[ParsedPage]:
        lines = content.split("\n")
        sections: list[ParsedPage] = []
        current_section = ""
        current_heading = ""
        section_idx = 0

        for line in lines:
            if line.startswith("#"):
                if current_section.strip():
                    sections.append(ParsedPage(
                        text=current_section.strip(),
                        page_number=section_idx + 1,
                        section=current_heading or None,
                    ))
                    section_idx += 1
                current_heading = line.lstrip("#").strip()
                current_section = line + "\n"
            else:
                current_section += line + "\n"

        if current_section.strip():
            sections.append(ParsedPage(
                text=current_section.strip(),
                page_number=section_idx + 1,
                section=current_heading or None,
            ))

        if not sections:
            sections = [ParsedPage(text=content, page_number=1)]

        return sections
