"""
Ultra minimal server for debugging Railway deployment
"""
import os
import sys

print("🚀 MINIMAL SERVER STARTING")
print(f"Python: {sys.version}")
print(f"Working dir: {os.getcwd()}")
print(f"Files: {os.listdir('.')}")

try:
    from fastapi import FastAPI
    import uvicorn
    
    app = FastAPI(title="Minimal Test")
    
    @app.get("/")
    def root():
        return {"message": "Minimal server working!", "status": "ok"}
    
    @app.get("/health")
    def health():
        return {"status": "healthy"}
    
    port = int(os.environ.get("PORT", 8000))
    print(f"🌐 Starting on port {port}")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
    
except Exception as e:
    print(f"💥 ERROR: {e}")
    import traceback
    traceback.print_exc()
    import time
    time.sleep(300)  # Keep alive for debugging