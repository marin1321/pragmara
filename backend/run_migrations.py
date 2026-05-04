"""Create database tables using SQLAlchemy directly."""

import sys
import traceback

print("run_migrations.py: starting...", flush=True)

try:
    import asyncio
    print("run_migrations.py: asyncio imported", flush=True)

    from sqlalchemy import text
    from sqlalchemy.ext.asyncio import create_async_engine
    print("run_migrations.py: sqlalchemy imported", flush=True)

    from app.core.config import settings
    print(f"run_migrations.py: settings loaded, db_url starts with: {settings.database_url[:30]}...", flush=True)

    from app.models import Base
    print(f"run_migrations.py: models imported, tables: {list(Base.metadata.tables.keys())}", flush=True)

except Exception as e:
    print(f"run_migrations.py: IMPORT ERROR: {type(e).__name__}: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)


async def run():
    print("Connecting to database...", flush=True)
    engine = create_async_engine(settings.database_url, echo=False)

    try:
        async with engine.begin() as conn:
            result = await conn.execute(
                text(
                    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
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
                        "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL)"
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
