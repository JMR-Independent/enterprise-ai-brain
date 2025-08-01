import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")
    
    try:
        from app.main import app
        print("Using full enterprise app")
    except Exception as e:
        print(f"Failed to import main app: {e}")
        from app.main_simple import app
        print("Using simple fallback app")
    
    uvicorn.run(app, host="0.0.0.0", port=port)