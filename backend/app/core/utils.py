import re
import uuid


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text


def generate_collection_name(slug: str) -> str:
    short_id = uuid.uuid4().hex[:8]
    return f"kb-{slug}-{short_id}"
