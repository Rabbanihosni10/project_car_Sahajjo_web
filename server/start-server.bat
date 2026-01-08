@echo off
REM Car Sahajjo Server Startup Script
REM This script starts the Node.js backend server

echo.
echo ========================================
echo   Car Sahajjo Server Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js found: 
for /f "tokens=*" %%i in ('node --version') do echo   %%i
echo.

REM Navigate to server directory
cd /d "%~dp0"

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo Port: 5000
echo Frontend URL: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
call npm start

pause
