@echo off
echo Stopping any running React development servers...
taskkill /f /im node.exe >nul 2>&1
echo.
echo Verifying .env file...
if exist .env (
  echo .env file found.
  echo.
  findstr "REACT_APP_GOOGLE_MAPS_API_KEY" .env >nul 2>&1
  if errorlevel 1 (
    echo WARNING: REACT_APP_GOOGLE_MAPS_API_KEY not found in .env file!
    echo.
  ) else (
    echo Google Maps API key found in .env file.
    echo.
  )
) else (
  echo WARNING: .env file not found in the current directory!
  echo.
)

echo Starting development server...
echo.
npm start
