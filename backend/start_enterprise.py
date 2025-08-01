#!/usr/bin/env python3
"""
Enterprise AI Brain startup script
Handles PORT environment variable correctly for Railway deployment
"""
import os
import sys
import uvicorn

def main():
    """Start the Enterprise AI Brain server"""
    # Get port from environment, default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🧠 Starting Enterprise AI Brain on port {port}")
    print(f"🚀 Environment: {os.environ.get('ENVIRONMENT', 'development')}")
    
    # Start uvicorn server
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        reload=False  # Never reload in production
    )

if __name__ == "__main__":
    main()