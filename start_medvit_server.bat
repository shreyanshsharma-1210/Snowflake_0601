@echo off
echo Starting MedViT API Server...
echo.
echo Make sure you have installed Python dependencies:
echo   cd server/python
echo   pip install -r requirements.txt
echo.

cd server\python
python medvit_api.py

pause
