@echo off
echo Cleaning up warnings...

cd s1-frontend\react-app

echo 1. Updating React Router...
call npm install react-router-dom@latest

echo 2. Installing Bootstrap icons locally...
call npm install bootstrap-icons

echo 3. Creating local icons folder...
if not exist "public\bootstrap-icons" mkdir "public\bootstrap-icons"

echo 4. Copying icon files...
if exist "node_modules\bootstrap-icons\font" (
    xcopy /E /I "node_modules\bootstrap-icons\font" "public\bootstrap-icons"
) else (
    echo Bootstrap icons font folder not found
)

echo 5. Updating index.html...
powershell -Command "(Get-Content public\index.html) -replace 'https://cdn\.jsdelivr\.net/npm/bootstrap-icons@1\.10\.0/font/bootstrap-icons\.css', '%PUBLIC_URL%/bootstrap-icons/bootstrap-icons.min.css' | Set-Content public\index.html"

echo 6. Adding no translate meta tag...
powershell -Command "if (-not (Select-String -Path public\index.html -Pattern 'notranslate' -Quiet)) { (Get-Content public\index.html) -replace '<head>', '<head>^r^n  <meta name=\"google\" content=\"notranslate\">' | Set-Content public\index.html }"

echo.
echo ✅ Cleanup complete! 
echo.
echo Restart React app with:
echo cd s1-frontend\react-app
echo npm start
pause