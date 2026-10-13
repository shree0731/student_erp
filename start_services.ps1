# PowerShell Startup Script for ERP
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  ERP: ACADEMIC RETENTION & MANAGEMENT ECOSYSTEM" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  1. ERP Backend (Node.js/Express) : http://localhost:5000" -ForegroundColor Yellow
Write-Host "  2. ERP Frontend (React / Vite)   : http://localhost:5173" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start ERP Backend
Write-Host "[1/2] Launching ERP Backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\backend'; npm run dev"

Start-Sleep -Seconds 3

# 2. Start ERP Frontend
Write-Host "[2/2] Launching ERP Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptDir\frontend'; npm run dev"

Start-Sleep -Seconds 3

Write-Host "Opening http://localhost:5173 in default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host "ERP services started successfully!" -ForegroundColor Green
