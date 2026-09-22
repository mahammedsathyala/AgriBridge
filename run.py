"""
AgriBridge All-in-One Local Runner
----------------------------------
Starts both the Flask Backend (Port 5000) and Frontend Dev Server (Port 3000) concurrently.
Usage:
    python run.py
"""

import os
import sys
import subprocess
import time
import webbrowser

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "agrin-project", "backend")

def main():
    print("=" * 60)
    print("🌱 AgriBridge — Starting Local Services")
    print("=" * 60)
    
    # 1. Start Backend
    print("[1/2] Launching Flask Backend (Port 5000)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=BACKEND_DIR
    )
    
    # Give backend a moment to bind port
    time.sleep(1.5)
    
    # 2. Start Frontend Dev Server
    print("[2/2] Launching Frontend Server (Port 3000)...")
    frontend_proc = subprocess.Popen(
        [sys.executable, "dev_server.py"],
        cwd=ROOT_DIR
    )
    
    print("\n✅ AgriBridge is running!")
    print("   👉 Frontend: http://localhost:3000")
    print("   👉 Backend API: http://localhost:5000/api/v1/health")
    print("\nPress Ctrl+C to stop both servers.\n")
    
    # Automatically open in browser
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass
    
    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None or frontend_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nStopping AgriBridge servers...")
    finally:
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done. Goodbye!")

if __name__ == "__main__":
    main()
