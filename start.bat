@echo off
title Smart Study Planner - AI Student Assistant
echo ===================================================
echo   Smart Study Planner - Starting Local Servers
echo ===================================================
echo.

echo [1/3] Initializing Database...
python backend/database.py

echo.
echo [2/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SmartStudy Backend" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo [3/3] Starting React Frontend on http://127.0.0.1:3000 ...
start "SmartStudy Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 3000"

echo.
echo ===================================================
echo   Servers are launching!
echo   Frontend: http://127.0.0.1:3000
echo   Backend:  http://127.0.0.1:8000/docs
echo ===================================================
echo.
timeout /t 3 >nul
start http://127.0.0.1:3000
