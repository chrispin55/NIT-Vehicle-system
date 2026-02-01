@echo off
title NIT ITVMS - Auto Git Push System
echo.
echo ========================================
echo    NIT ITVMS Auto Git Push System
echo ========================================
echo.
echo This will monitor your project files and
echo automatically push changes to GitHub.
echo.
echo Press Ctrl+C to stop the monitoring.
echo.
echo Starting in 3 seconds...
timeout /t 3 /nobreak >nul

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js first: https://nodejs.org/
    pause
    exit /b 1
)

:: Check if chokidar is installed
node -e "require('chokidar')" >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing required dependencies...
    npm install chokidar
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Start the auto-push system
echo.
echo 🚀 Starting Auto Git Push System...
echo.
node auto-git-push.js

pause
