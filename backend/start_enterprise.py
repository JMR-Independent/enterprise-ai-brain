#!/usr/bin/env python3
"""
Enterprise AI Brain startup script
Handles PORT environment variable correctly for Railway deployment
"""
import os
import sys
import traceback

def main():
    """Start the Enterprise AI Brain server"""
    try:
        print("🔍 Debug: Python path:", sys.path)
        print("🔍 Debug: Current working directory:", os.getcwd())
        print("🔍 Debug: Files in current directory:", os.listdir('.'))
        
        # Get port from environment, default to 8000
        port = int(os.environ.get("PORT", 8000))
        
        print(f"🧠 Starting Enterprise AI Brain on port {port}")
        print(f"🚀 Environment: {os.environ.get('ENVIRONMENT', 'development')}")
        
        # Try to import the app first to catch import errors
        print("📦 Importing FastAPI app...")
        try:
            from app.main import app
            print("✅ Full FastAPI app imported successfully")
        except Exception as import_error:
            print(f"❌ Failed to import full app: {import_error}")
            print("🔄 Falling back to simple app...")
            from app.main_simple import app
            print("✅ Simple FastAPI app imported successfully")
        
        # Import uvicorn
        import uvicorn
        print("📡 Starting uvicorn server...")
        
        # Start uvicorn server
        uvicorn.run(
            app,  # Use the imported app directly
            host="0.0.0.0",
            port=port,
            log_level="info",
            access_log=True,
            reload=False  # Never reload in production
        )
        
    except Exception as e:
        print(f"❌ Error starting Enterprise AI Brain: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"📝 Traceback:")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()