#!/bin/bash

echo "Running database migrations..."
echo "DATABASE_URL is set: ${DATABASE_URL:+yes}"
echo "Python version: $(python --version 2>&1)"
echo "Working directory: $(pwd)"

alembic upgrade head 2>&1
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "ERROR: Migration failed with exit code $RESULT"
    echo "Attempting to show alembic history..."
    alembic history 2>&1 || true
    exit 1
fi

echo "Migrations completed successfully!"
echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
