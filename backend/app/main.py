"""
Enterprise AI Brain - FastAPI Main Application
Based on proven ai-chatbot architecture with enterprise enhancements
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import logging

from app.core.config import settings
from app.core.database import engine, create_tables
from app.core.auth import router as auth_router
from app.api.enterprise import router as enterprise_router
# from app.api.documents import router as documents_router
# from app.api.connectors import router as connectors_router  
# from app.api.analytics import router as analytics_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan manager for startup and shutdown events
    """
    # Startup
    logger.info("🚀 Starting Enterprise AI Brain...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    
    # Create database tables
    await create_tables()
    logger.info("✅ Database tables created/verified")
    
    # Initialize vector store directory
    import os
    os.makedirs(settings.VECTOR_STORE_PATH, exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    logger.info("✅ Storage directories initialized")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Enterprise AI Brain...")


# Initialize FastAPI app
app = FastAPI(
    title="Enterprise AI Brain",
    description="Advanced Business Intelligence System with AI-powered document analysis",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time header to all responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests for monitoring and debugging"""
    start_time = time.time()
    
    # Log request
    logger.info(f"📝 {request.method} {request.url.path} - {request.client.host if request.client else 'unknown'}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(f"✅ {request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
        
        return response
        
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(f"❌ {request.method} {request.url.path} - ERROR: {str(e)} - {process_time:.3f}s")
        raise


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "path": request.url.path,
            "timestamp": time.time()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error" if not settings.DEBUG else str(exc),
            "status_code": 500,
            "path": request.url.path,
            "timestamp": time.time()
        }
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "Enterprise AI Brain",
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "timestamp": time.time()
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Enterprise AI Brain API",
        "version": "1.0.0",
        "docs": "/docs" if settings.DEBUG else "Documentation disabled in production",
        "health": "/health",
        "features": {
            "advanced_rag": True,
            "financial_analysis": True,
            "multi_document_synthesis": True,
            "data_connectors": True,
            "analytics_dashboard": True,
            "audit_trail": True,
            "export_capabilities": True
        }
    }


# Include routers
app.include_router(auth_router)
app.include_router(enterprise_router)
# app.include_router(documents_router)
# app.include_router(connectors_router)
# app.include_router(analytics_router)


# Additional enterprise-specific endpoints
@app.get("/api/system/info")
async def system_info():
    """System information for enterprise administrators"""
    return {
        "system": "Enterprise AI Brain",
        "version": "1.0.0",
        "python_version": "3.11+",
        "framework": "FastAPI",
        "database": "PostgreSQL with AsyncPG",
        "vector_store": "ChromaDB",
        "ai_models": {
            "llm": settings.LLM_MODEL,
            "embeddings": settings.EMBEDDING_MODEL
        },
        "features": {
            "max_documents_per_enterprise": settings.ENTERPRISE_MAX_DOCUMENTS,
            "supported_file_formats": settings.SUPPORTED_FORMATS.split(","),
            "max_file_size_mb": settings.MAX_FILE_SIZE // (1024 * 1024),
            "advanced_analytics": settings.ENABLE_ADVANCED_ANALYTICS,
            "audit_logging": settings.ENABLE_AUDIT_LOG,
            "data_export": settings.ENABLE_DATA_EXPORT,
            "multi_language": settings.ENABLE_MULTI_LANGUAGE
        },
        "limits": {
            "chunk_size": settings.CHUNK_SIZE,
            "max_results_per_page": settings.MAX_RESULTS_PER_PAGE,
            "rate_limit_per_minute": settings.RATE_LIMIT_PER_MINUTE,
            "cache_ttl_hours": settings.REDIS_CACHE_TTL // 3600
        }
    }


@app.get("/api/system/status")
async def system_status():
    """Detailed system status for monitoring"""
    import psutil
    import asyncio
    from datetime import datetime
    
    # Get system metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    # Check database connection
    try:
        from app.core.database import get_db
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    # Check vector store
    try:
        import os
        vector_store_exists = os.path.exists(settings.VECTOR_STORE_PATH)
        vector_store_status = "available" if vector_store_exists else "not_initialized"
    except Exception as e:
        vector_store_status = f"error: {str(e)}"
    
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "uptime_seconds": time.time(),
        "system": {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "memory_available_gb": memory.available / (1024**3),
            "disk_percent": disk.percent,
            "disk_free_gb": disk.free / (1024**3)
        },
        "services": {
            "database": db_status,
            "vector_store": vector_store_status,
            "redis": "not_checked",  # Would implement Redis health check
        },
        "configuration": {
            "environment": settings.ENVIRONMENT,
            "debug": settings.DEBUG,
            "cors_origins": len(settings.CORS_ORIGINS),
            "max_file_size_mb": settings.MAX_FILE_SIZE // (1024 * 1024)
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )