@echo off
echo Checking if API server is running...
curl http://localhost:5001/api/medvit/health
echo.
echo.
echo If you see an error above, the server is not running.
echo Start it with: cd server\python && python medvit_api.py
pause
