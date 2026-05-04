#!/bin/bash

echo "=== start.sh begin ===" 2>&1

python -u run_migrations.py 2>&1
MIGRATION_EXIT=$?

if [ $MIGRATION_EXIT -ne 0 ]; then
    echo "Migration failed with exit code $MIGRATION_EXIT" 2>&1
    exit 1
fi

echo "Starting application..." 2>&1
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" 2>&1
