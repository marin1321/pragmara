from datetime import datetime

from pydantic import BaseModel, Field


class APIKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)


class APIKeyResponse(BaseModel):
    id: str
    name: str
    is_active: bool
    last_used_at: datetime | None
    created_at: datetime

    class Config:
        from_attributes = True


class APIKeyCreated(BaseModel):
    id: str
    name: str
    key: str


class APIKeyListResponse(BaseModel):
    items: list[APIKeyResponse]
    total: int
