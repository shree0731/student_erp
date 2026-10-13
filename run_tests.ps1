# PowerShell Test Runner for ERP (FSD)
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " RUNNING ALL VERIFICATION TESTS: ERP (FSD)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Backend Express Tests (Auth, Ownership, Feature Parity, Chat Proxy)
Write-Host "`n[1/2] Running Backend Jest Suite (Auth, Parity, Proxy)..." -ForegroundColor Yellow
Push-Location -Path "backend"
try {
    npx jest --forceExit
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Backend tests failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} finally {
    Pop-Location
}
Write-Host "[OK] Backend Jest suite passed successfully." -ForegroundColor Green

# 2. Frontend Build Verification (Type safety & Vite bundle)
Write-Host "`n[2/2] Running Frontend Production Build Check..." -ForegroundColor Yellow
Push-Location -Path "frontend"
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Frontend build check failed!" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} finally {
    Pop-Location
}
Write-Host "[OK] Frontend build passed cleanly." -ForegroundColor Green

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
exit 0
