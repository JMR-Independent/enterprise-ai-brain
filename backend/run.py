import os
import sys
import time
import traceback

def main():
    print("🚀 Enterprise AI Brain - Starting up...")
    print(f"📍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"📂 Files in directory: {os.listdir('.')}")
    
    # Force flush stdout
    sys.stdout.flush()
    
    try:
        port = int(os.environ.get("PORT", 8000))
        print(f"🌐 Port configured: {port}")
        sys.stdout.flush()
        
        # Test imports first
        print("📦 Testing imports...")
        try:
            import uvicorn
            print("✅ uvicorn imported successfully")
        except Exception as e:
            print(f"❌ uvicorn import failed: {e}")
            raise
            
        try:
            import fastapi
            print("✅ fastapi imported successfully")
        except Exception as e:
            print(f"❌ fastapi import failed: {e}")
            raise
            
        # Try to import app
        print("🧠 Importing Enterprise AI Brain app...")
        try:
            from app.main import app
            print("✅ Full enterprise app imported successfully")
        except Exception as e:
            print(f"❌ Failed to import main app: {e}")
            traceback.print_exc()
            print("🔄 Falling back to simple app...")
            try:
                from app.main_simple import app
                print("✅ Simple fallback app imported successfully")
            except Exception as e2:
                print(f"❌ Even simple app failed: {e2}")
                traceback.print_exc()
                raise
        
        sys.stdout.flush()
        
        print(f"🚀 Starting uvicorn server on 0.0.0.0:{port}")
        sys.stdout.flush()
        
        # Start the server
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=port,
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        print(f"💥 FATAL ERROR: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        print("📝 Full traceback:")
        traceback.print_exc()
        sys.stdout.flush()
        
        # Keep container alive for debugging
        print("⏰ Keeping container alive for 300 seconds for debugging...")
        time.sleep(300)
        sys.exit(1)

if __name__ == "__main__":
    main()