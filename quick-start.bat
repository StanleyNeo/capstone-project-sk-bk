@echo off
echo ============================================
echo AI LMS Full Stack Application Startup
echo ============================================
echo.

echo Starting MongoDB Backend on port 5000...
start cmd /k "title MongoDB Backend && cd s3-database\MongoDB-Backend && echo Starting MongoDB... && npm start"

echo Waiting 2 seconds...
timeout /t 2 > nul

echo Starting Express Backend on port 5001...
start cmd /k "title Express Backend && cd s2-backend && echo Starting Express... && npm start"

echo Waiting 2 seconds...
timeout /t 2 > nul

echo Starting React Frontend on port 3000...
start cmd /k "title React Frontend && cd s1-frontend\react-app && echo Starting React... && npm start"

echo Waiting 3 seconds...
timeout /t 3 > nul

echo.
echo ============================================
echo All services are starting...
echo.
echo Please wait for all servers to initialize.
echo.
echo Once started, open these URLs:
echo 1. React Frontend:    http://localhost:3000
echo 2. Express Backend:   http://localhost:5001
echo 3. MongoDB Backend:   http://localhost:5000
echo ============================================
echo.

echo Opening browsers...
start http://localhost:3000
timeout /t 1 > nul
start http://localhost:5001
timeout /t 1 > nul
start http://localhost:5000

echo.
echo Press any key to check if services are running...
pause > nul

echo.
echo Checking running services:
echo.
netstat -ano | findstr ":3000 :5000 :5001" | findstr "LISTENING"
echo.

if errorlevel 1 (
    echo Some services may not be running yet.
    echo Wait a few more seconds and refresh browsers.
) else (
    echo All services appear to be running!
)

echo.
echo Press any key to close this window...
pause > nul