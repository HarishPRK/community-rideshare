@echo off
echo ===================================================================
echo                Community Rideshare Backend Starter
echo ===================================================================
echo.

REM Check if XAMPP is running
echo Checking if XAMPP/MySQL is running...
netstat -an | findstr "3306" > nul
if %errorlevel% neq 0 (
    echo ERROR: MySQL doesn't appear to be running on port 3306.
    echo Please start XAMPP and MySQL before continuing.
    echo.
    pause
    exit /b 1
)
echo MySQL is running. Good!

REM Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    call npm install
    echo.
)

REM Create database if needed
echo Setting up the database...
call npm run db:create
if %errorlevel% neq 0 (
    echo ERROR: Failed to create database.
    pause
    exit /b 1
)

REM Ask if user wants to reset the database
echo.
set /p RESET_DB="Do you want to reset the database (this will DELETE all data)? (y/N): "
if /i "%RESET_DB%"=="y" (
    echo Resetting database tables...
    set DB_SYNC_FORCE=true
    call npm run db:sync
    if %errorlevel% neq 0 (
        echo ERROR: Failed to reset database.
        pause
        exit /b 1
    )
)

REM Start the backend server
echo.
echo Starting the backend server...
echo.
echo The server will be available at http://localhost:8080/api
echo Press Ctrl+C to stop the server
echo.
call npm run dev
