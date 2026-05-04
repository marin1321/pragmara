"""Create database tables using SQLAlchemy directly."""

import asyncio
import sys
import traceback

print("run_migrations.py: importing modules...", flush=True)

try:
    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine
    from app.core.config import settings
    from app.models import Base
    print("run_migrations.py: imports OK", flush=True)
except Exception as e:
    print(f"IMPORT ERROR: {type(e).__name__}: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)


async def run():
    print("Running database migrations...", flush=True)
    engine = create_async_engine(
        settings.database_url,
        echo=False,
        connect_args={"statement_cache_size": 0},
    )

    try:
        async with engine.begin() as conn:
            result = await conn.execute(
                text(
                    "SELECT EXISTS ("
                    "  SELECT FROM information_schema.tables"
                    "  WHERE table_schema = 'public' AND table_name = 'users'"
                    ")"
                )
            )
            tables_exist = result.scalar()

            if tables_exist:
                print("Tables already exist, skipping creation.", flush=True)
            else:
                print("Creating tables...", flush=True)
                await conn.run_sync(Base.metadata.create_all)
                print("Tables created successfully!", flush=True)

                await conn.execute(
                    text(
                        "CREATE TABLE IF NOT EXISTS alembic_version "
                        "(version_num VARCHAR(32) NOT NULL)"
                    )
                )
                await conn.execute(
                    text("INSERT INTO alembic_version (version_num) VALUES ('001')")
                )
                print("Alembic version stamped at 001.", flush=True)

    except Exception as e:
        print(f"ERROR: {type(e).__name__}: {e}", flush=True)
        traceback.print_exc()
        sys.exit(1)
    finally:
        await engine.dispose()

    print("Database ready!", flush=True)


if __name__ == "__main__":
    asyncio.run(run())
