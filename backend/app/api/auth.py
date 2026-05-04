from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.core.redis import get_redis
from app.core.security import create_access_token, generate_magic_token
from app.models.user import User
from app.schemas.auth import MagicLinkRequest, TokenResponse, UserResponse
from app.services.email import send_magic_link

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/magic-link", status_code=status.HTTP_200_OK)
async def request_magic_link(
    body: MagicLinkRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    redis = await get_redis()
    if not redis:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )

    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(email=body.email)
        db.add(user)
        await db.flush()

    token = generate_magic_token()

    await redis.set(
        f"magic:{token}",
        str(user.id),
        ex=settings.magic_link_expire_minutes * 60,
    )

    await send_magic_link(body.email, token)

    return {"message": "Magic link sent. Check your email."}


@router.get("/verify", response_model=TokenResponse)
async def verify_magic_link(token: str) -> TokenResponse:
    redis = await get_redis()
    if not redis:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable",
        )

    user_id = await redis.get(f"magic:{token}")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link",
        )

    await redis.delete(f"magic:{token}")

    import uuid

    access_token = create_access_token(uuid.UUID(user_id))
    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
