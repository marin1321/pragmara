#!/bin/bash

python -u run_migrations.py

if [ $? -ne 0 ]; then
    echo "Migration failed, exiting."
    exit 1
fi

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
