#!/usr/bin/env bash
set -e

echo "=========================================================="
echo " RUNNING ALL VERIFICATION TESTS: INSIGHT ERP (FSD)"
echo "=========================================================="

echo -e "\n[1/2] Running Backend Jest Suite (Auth, Parity, Proxy)..."
cd backend
npx jest --forceExit
cd ..
echo "[OK] Backend Jest suite passed successfully."

echo -e "\n[2/2] Running Frontend Production Build Check..."
cd frontend
npm run build
cd ..
echo "[OK] Frontend build passed cleanly."

echo -e "\n=========================================================="
echo " ALL TEST SUITES PASSED CLEANLY (100% SUCCESS)!"
echo "=========================================================="
exit 0
