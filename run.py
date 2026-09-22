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
import socket
import webbrowser

ROOT_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "agrin-project", "backend")

# Find virtualenv python for backend
VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "Scripts", "python.exe")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = os.path.join(BACKEND_DIR, "venv", "bin", "python")
if not os.path.exists(VENV_PYTHON):
    VENV_PYTHON = sys.executable


def kill_port_process_windows(port: int):
    """Frees up a port if already occupied on Windows."""
    if os.name != "nt":
        return
    try:
        cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object {{ Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }}"'
        subprocess.run(cmd, shell=True, capture_output=True, timeout=5)
    except Exception:
        pass


def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0


def main():
    print("=" * 60)
    print("🌱 AgriBridge — Starting Local Services")
    print("=" * 60)
    
    # Ensure ports are free
    if is_port_in_use(5000):
        print("Cleaning up existing process on port 5000...")
        kill_port_process_windows(5000)
        time.sleep(0.5)

    if is_port_in_use(3000):
        print("Cleaning up existing process on port 3000...")
        kill_port_process_windows(3000)
        time.sleep(0.5)

    # 1. Start Backend with virtualenv Python
    print(f"[1/2] Launching Flask Backend (Port 5000)...")
    backend_proc = subprocess.Popen(
        [VENV_PYTHON, "app.py"],
        cwd=BACKEND_DIR
    )
    
    # Give backend a moment to start
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
            b_code = backend_proc.poll()
            f_code = frontend_proc.poll()
            if b_code is not None:
                print(f"\n⚠️ Flask backend stopped unexpectedly (exit code {b_code}).")
                break
            if f_code is not None:
                print(f"\n⚠️ Frontend dev server stopped unexpectedly (exit code {f_code}).")
                break
    except KeyboardInterrupt:
        print("\nStopping AgriBridge servers...")
    finally:
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        print("Done. Goodbye!")


if __name__ == "__main__":
    main()
