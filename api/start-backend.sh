#!/bin/bash

echo "==================================================================="
echo "                Community Rideshare Backend Starter"
echo "==================================================================="
echo

# Check if MySQL is running
echo "Checking if MySQL is running..."
if ! nc -z localhost 3306 2>/dev/null; then
    echo "ERROR: MySQL doesn't appear to be running on port 3306."
    echo "Please start XAMPP and MySQL before continuing."
    echo
    read -p "Press enter to exit..."
    exit 1
fi
echo "MySQL is running. Good!"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

# Create database if needed
echo "Setting up the database..."
npm run db:create
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create database."
    read -p "Press enter to exit..."
    exit 1
fi

# Ask if user wants to reset the database
echo
read -p "Do you want to reset the database (this will DELETE all data)? (y/N): " RESET_DB
if [[ $RESET_DB =~ ^[Yy]$ ]]; then
    echo "Resetting database tables..."
    export DB_SYNC_FORCE=true
    npm run db:sync
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to reset database."
        read -p "Press enter to exit..."
        exit 1
    fi
fi

# Start the backend server
echo
echo "Starting the backend server..."
echo
echo "The server will be available at http://localhost:8080/api"
echo "Press Ctrl+C to stop the server"
echo
npm run dev
