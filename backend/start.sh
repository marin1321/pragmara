#!/bin/bash

python run_migrations.py

if [ $? -ne 0 ]; then
    exit 1
fi

echo "Starting application..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
