"""
Simple version of main.py for debugging deployment issues
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import time

# Simple FastAPI app
app = FastAPI(
    title="Enterprise AI Brain",
    description="Advanced Business Intelligence System - Debug Version",
    version="1.0.0-debug"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for testing
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Enterprise AI Brain API - Debug Mode",
        "version": "1.0.0-debug",
        "status": "running",
        "timestamp": time.time()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Enterprise AI Brain Debug",
        "version": "1.0.0-debug",
        "timestamp": time.time()
    }