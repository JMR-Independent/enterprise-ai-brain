# Use Python 3.9 slim image
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory directly to backend
WORKDIR /app/backend

# Copy requirements and install dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY backend/ ./

# Create necessary directories at parent level
RUN mkdir -p ../enterprise_uploads ../enterprise_chroma_db ../reports

# Expose port
EXPOSE 8000

# Use our custom startup script that handles PORT correctly
CMD ["python", "start_enterprise.py"]