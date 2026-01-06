@echo off
echo Starting Exercise Counter API Server...
echo.
echo Installing requirements...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
echo WebSocket endpoint: ws://localhost:8000/ws/exercise/{exercise_type}
echo API docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.
python exercise_api.py
