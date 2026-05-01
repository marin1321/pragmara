from pydantic import BaseModel, EmailStr


class MagicLinkRequest(BaseModel):
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None
    plan: str

    class Config:
        from_attributes = True
