import re


class TextCleaner:
    def clean(self, text: str) -> str:
        text = self._normalize_whitespace(text)
        text = self._remove_excessive_newlines(text)
        text = self._strip_common_artifacts(text)
        return text.strip()

    def _normalize_whitespace(self, text: str) -> str:
        text = text.replace("\r\n", "\n")
        text = text.replace("\r", "\n")
        text = re.sub(r"[^\S\n]+", " ", text)
        return text

    def _remove_excessive_newlines(self, text: str) -> str:
        text = re.sub(r"\n{4,}", "\n\n\n", text)
        return text

    def _strip_common_artifacts(self, text: str) -> str:
        lines = text.split("\n")
        cleaned_lines = []

        for line in lines:
            stripped = line.strip()
            if self._is_artifact(stripped):
                continue
            cleaned_lines.append(line)

        return "\n".join(cleaned_lines)

    def _is_artifact(self, line: str) -> bool:
        if not line:
            return False

        artifact_patterns = [
            r"^page \d+ of \d+$",
            r"^\d+\s*$",
            r"^©.*\d{4}",
            r"^all rights reserved",
            r"^cookie",
            r"^accept all cookies",
            r"^skip to (main )?content",
        ]

        lower = line.lower()
        for pattern in artifact_patterns:
            if re.match(pattern, lower):
                return True

        return False
