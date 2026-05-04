#!/bin/bash

python -u run_migrations.py 2>&1

if [ $? -ne 0 ]; then
    echo "Migration failed, exiting."
    exit 1
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" 2>&1
