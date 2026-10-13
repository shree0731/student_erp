@echo off
TITLE ERP - Academic Management Platform Launcher
COLOR 0A

echo ===============================================================================
echo   ERP: ACADEMIC RETENTION & MANAGEMENT ECOSYSTEM
echo ===============================================================================
echo   Starting Services:
echo   1. ERP Backend (Node.js/Express) : http://localhost:5000
echo   2. ERP Frontend (React / Vite)   : http://localhost:5173
echo ===============================================================================
echo.

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [1/2] Starting Node.js Express Backend on port 5000...
start "ERP - Express Backend [Port 5000]" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React + Vite Frontend on port 5173...
start "ERP - Vite Frontend [Port 5173]" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo Opening ERP at http://localhost:5173 ...
start http://localhost:5173

echo ===============================================================================
echo   ERP is live and running!
echo   Keep terminal windows open while running.
echo ===============================================================================
pause
