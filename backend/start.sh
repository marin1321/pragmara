#!/bin/bash

echo "Running database migrations..."
alembic upgrade head 2>&1
RESULT=$?

if [ $RESULT -ne 0 ]; then
    echo "Migration failed with exit code $RESULT"
    exit 1
fi

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
