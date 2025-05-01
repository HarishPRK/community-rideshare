#!/bin/bash
echo "Stopping any running React development servers..."
pkill -f "node.*start" || true
echo

echo "Verifying .env file..."
if [ -f .env ]; then
  echo ".env file found."
  echo
  
  if grep -q "REACT_APP_GOOGLE_MAPS_API_KEY" .env; then
    echo "Google Maps API key found in .env file."
  else
    echo "WARNING: REACT_APP_GOOGLE_MAPS_API_KEY not found in .env file!"
  fi
  echo
else
  echo "WARNING: .env file not found in the current directory!"
  echo
fi

echo "Starting development server..."
echo
npm start
