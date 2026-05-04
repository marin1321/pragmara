#!/bin/bash
echo "start.sh: beginning..."
echo "start.sh: pwd=$(pwd)"
echo "start.sh: python=$(which python)"

python -u run_migrations.py

if [ $? -ne 0 ]; then
    echo "start.sh: migration failed"
    exit 1
fi

echo "start.sh: starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
