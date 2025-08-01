#!/bin/bash
# Startup script for Enterprise AI Brain

# Set default port if not provided
PORT=${PORT:-8000}

echo "🚀 Starting Enterprise AI Brain on port $PORT"

# Start uvicorn server
exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT