# Use Python 3.9 slim image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory to backend from the start
WORKDIR /app/backend

# Copy requirements first for better caching
COPY backend/requirements.txt ./requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application code
COPY backend/ ./

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Go back to app root to create directories
WORKDIR /app
RUN mkdir -p enterprise_uploads enterprise_chroma_db reports

# Return to backend directory for execution
WORKDIR /app/backend

# Use the startup script
CMD ["/app/start.sh"]