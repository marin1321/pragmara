from datetime import datetime

from pydantic import BaseModel, Field


class URLSubmission(BaseModel):
    url: str = Field(..., min_length=10)


class DocumentResponse(BaseModel):
    id: str
    kb_id: str
    name: str
    source_type: str
    source_path: str | None
    file_size: int | None
    chunk_count: int
    token_count: int
    status: str
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    items: list[DocumentResponse]
    total: int


class IngestionJobResponse(BaseModel):
    id: str
    document_id: str
    status: str
    progress_pct: float
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None

    class Config:
        from_attributes = True
