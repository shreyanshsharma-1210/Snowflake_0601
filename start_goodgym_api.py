#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Good-GYM API Startup Script
Lightweight exercise tracking with WebSocket support
"""

import sys
import os

# Fix Windows encoding issues
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
import subprocess
import time

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = {
        'opencv-python': 'cv2',
        'numpy': 'numpy',
        'websockets': 'websockets',
        'flask': 'flask',
        'flask-cors': 'flask_cors',
        'rtmlib': 'rtmlib',
        'Pillow': 'PIL'
    }
    
    missing_packages = []
    
    for package_name, import_name in required_packages.items():
        try:
            __import__(import_name)
        except ImportError:
            missing_packages.append(package_name)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install missing packages with:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def start_api_server():
    """Start the Good-GYM API server"""
    server_path = os.path.join(os.path.dirname(__file__), 'server', 'goodgym_api.py')
    
    if not os.path.exists(server_path):
        print(f"❌ Server file not found: {server_path}")
        return False
    
    print("🚀 Starting Good-GYM Exercise API...")
    print("📡 HTTP API: http://localhost:8001")
    print("🔌 WebSocket: ws://localhost:8001")
    print("⏹️  Press Ctrl+C to stop")
    print("-" * 50)
    
    try:
        # Start the server
        subprocess.run([sys.executable, server_path], check=True)
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        return False
    except FileNotFoundError:
        print("❌ Python not found. Please ensure Python is installed and in PATH.")
        return False

def main():
    """Main function"""
    print("💪 Good-GYM Exercise API Launcher")
    print("=" * 40)
    
    # Check dependencies
    print("🔍 Checking dependencies...")
    if not check_dependencies():
        print("\n❌ Please install missing dependencies and try again.")
        sys.exit(1)
    
    print("✅ All dependencies found!")
    time.sleep(1)
    
    # Start server
    success = start_api_server()
    
    if not success:
        print("\n❌ Failed to start server. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
