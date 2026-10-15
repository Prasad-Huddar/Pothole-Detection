@echo off
echo ====================================================
echo   ROADVISION AI - Full Stack Launcher
echo   Starting Backend (FastAPI) and Frontend (Vite)
echo ====================================================
echo.

start "ROADVISION AI - Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 2 /nobreak >nul

start "ROADVISION AI - Frontend Dev" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ====================================================
echo   ROADVISION AI is launching!
echo   - Backend API:  http://localhost:8000
echo   - Frontend App: http://localhost:5173
echo ====================================================
echo.
