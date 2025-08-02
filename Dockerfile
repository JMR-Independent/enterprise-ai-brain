FROM python:3.9-slim

RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt

COPY backend/ ./

RUN mkdir -p ../enterprise_uploads ../enterprise_chroma_db ../reports

EXPOSE 8000

CMD uvicorn app.main_ultra_simple:app --host 0.0.0.0 --port ${PORT:-8000}