from datetime import datetime

from pydantic import BaseModel, Field


class KBCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None


class KBUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None


class KBResponse(BaseModel):
    id: str
    name: str
    description: str | None
    slug: str
    qdrant_collection: str
    doc_count: int
    chunk_count: int
    total_tokens: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class KBListResponse(BaseModel):
    items: list[KBResponse]
    total: int
