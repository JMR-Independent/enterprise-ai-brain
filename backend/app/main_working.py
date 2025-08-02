from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import text
import uvicorn

from app.core.config import settings
from app.core.database import engine, Base, get_db
from sqlalchemy.ext.asyncio import AsyncSession


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # Fix missing columns
        print("Attempting database schema update...")
        try:
            await conn.execute(text("ALTER TABLE enterprises ADD COLUMN IF NOT EXISTS industry VARCHAR(255)"))
            print("Database schema updated successfully")
        except Exception as e:
            print(f"Schema update failed: {e}")
            
    yield
    # Shutdown
    await engine.dispose()


print("ENTERPRISE AI BRAIN 2025-08-02 - RAILWAY MUST USE THIS CODE NOW!")

app = FastAPI(
    title="Enterprise AI Brain",
    description="Advanced Business Intelligence System",
    version="1.0.0",
    lifespan=lifespan
)

# CORS SUPER PERMISIVO - TEMPORAL PARA DEBUGGING
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Acepta TODO temporalmente
    allow_credentials=False,  # Deshabilitado para usar wildcard
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Handler manual para OPTIONS requests
@app.options("/{path:path}")
async def handle_options(request: Request, path: str):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": "3600",
        }
    )

# Security
security = HTTPBearer()

# Basic routes first - NO complex imports
@app.get("/")
async def root():
    return {"message": "Enterprise AI Brain API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Enterprise AI Brain"}

@app.get("/system/info")
async def system_info():
    return {
        "system": "Enterprise AI Brain",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "features": {
            "advanced_rag": True,
            "financial_analysis": True,
            "enterprise_docs": True,
            "analytics": True
        }
    }

@app.post("/api/enterprise/simple-query")
async def simple_enterprise_query(request: Request):
    """Simple enterprise query endpoint without complex imports"""
    try:
        body = await request.json()
        query = body.get("query", "")
        
        # Simple response for now
        return {
            "query_id": 1,
            "response": f"Recibí tu consulta empresarial: '{query}'. El sistema Enterprise AI Brain está funcionando correctamente. Esta es una respuesta de prueba.",
            "query_type": "simple",
            "complexity": "low",
            "processing_time_ms": 100,
            "status": "success"
        }
    except Exception as e:
        return {
            "error": f"Error procesando consulta: {str(e)}",
            "status": "error"
        }

@app.get("/test-database")
async def test_database(db: AsyncSession = Depends(get_db)):
    """Test database connection"""
    try:
        result = await db.execute(text("SELECT 1 as test"))
        test_value = result.scalar()
        return {
            "status": "success",
            "database": "connected",
            "test_result": test_value
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "failed",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "main_working:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )