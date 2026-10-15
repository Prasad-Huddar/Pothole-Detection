@echo off
echo.
echo ====================================================
echo   ROADVISION AI - Backend Server
echo   AI-Assisted Pothole Detection System
echo ====================================================
echo.
echo Checking Python environment...
python --version

echo.
echo Installing/checking backend requirements...
pip install -r requirements.txt --quiet

echo.
echo Starting FastAPI backend on http://localhost:8000
echo (Demo mode active until YOLO weights are placed in weights/best.pt)
echo.
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
