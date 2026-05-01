import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_magic_link(email: str, token: str) -> None:
    verify_url = f"{settings.frontend_url}/auth/verify?token={token}"

    if settings.is_development:
        logger.info(f"[DEV] Magic link for {email}: {verify_url}")
        print(f"\n{'='*60}")
        print(f"  MAGIC LINK (dev mode)")
        print(f"  Email: {email}")
        print(f"  URL: {verify_url}")
        print(f"{'='*60}\n")
        return

    try:
        import resend

        resend.api_key = settings.resend_api_key
        resend.Emails.send(
            {
                "from": "Pragmara <noreply@pragmara.dev>",
                "to": [email],
                "subject": "Your Pragmara login link",
                "html": f"""
                    <h2>Login to Pragmara</h2>
                    <p>Click the link below to sign in. This link expires in 15 minutes.</p>
                    <a href="{verify_url}" style="
                        display: inline-block;
                        padding: 12px 24px;
                        background: #6C63FF;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 500;
                    ">Sign in to Pragmara</a>
                    <p style="color: #666; font-size: 13px; margin-top: 16px;">
                        If you didn't request this link, you can safely ignore this email.
                    </p>
                """,
            }
        )
    except Exception as e:
        logger.error(f"Failed to send magic link email to {email}: {e}")
        raise
