@echo off
echo ============================================
echo AI LMS Full Stack Application Startup
echo ============================================
echo.

echo Starting MongoDB Backend on port 5000...
start cmd /k "title MongoDB Backend && cd s3-database\MongoDB-Backend && node final-server.js"

timeout /t 2 > nul

echo Starting Express Backend on port 5001...
start cmd /k "title Express Backend && cd s2-backend && node final-ai-server.js"

timeout /t 2 > nul

echo Starting React Frontend on port 3000...
start cmd /k "title React Frontend && cd s1-frontend\react-app && npm start"

timeout /t 3 > nul

echo ============================================
echo All services are starting...
echo ============================================

start http://localhost:3000
start http://localhost:5001
start http://localhost:5000

echo.
echo Checking running services...
netstat -ano | findstr ":3000 :5000 :5001" | findstr "LISTENING"

pause
