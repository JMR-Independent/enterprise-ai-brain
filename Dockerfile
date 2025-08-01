# Use Python 3.9 slim image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the entire application code
COPY . .

# Create necessary directories
RUN mkdir -p enterprise_uploads enterprise_chroma_db reports

# Expose port
EXPOSE 8000

# Start command with explicit shell
ENTRYPOINT ["/bin/bash", "-c", "cd backend && exec python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]