# Community Rideshare Backend

A Node.js backend for the Community Rideshare application, replacing the original Java backend.

## Features

- Express.js REST API
- MySQL database with Sequelize ORM
- JWT authentication with token refresh
- Google authentication support
- Role-based access control
- Complete ride management
  - Offer rides
  - Request rides
  - Accept/reject ride requests
  - Start/complete/cancel rides
  - Rate drivers and passengers
- Vehicle management
- User profiles and authentication

## Prerequisites

- Node.js (v14+)
- XAMPP or MySQL server running on port 3306
- Git (for version control)

## Project Structure

```
backend/
├── src/                    # Source code
│   ├── config/             # Configuration files
│   ├── controllers/        # API controllers 
│   ├── middleware/         # Express middleware
│   ├── models/             # Sequelize models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Main entry point
├── uploads/                # User uploaded files
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── start-backend.bat       # Windows startup script
└── start-backend.sh        # Linux/Mac startup script
```

## Quick Start

### Windows

Run the `start-backend.bat` script:

```
./start-backend.bat
```

### Linux/Mac

Run the `start-backend.sh` script:

```
chmod +x ./start-backend.sh
./start-backend.sh
```

The script will:
1. Check if MySQL is running
2. Install dependencies if needed
3. Create the database if it doesn't exist
4. Ask if you want to reset the database tables
5. Start the development server

## Manual Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create the database:
   ```
   npm run db:create
   ```

3. Sync database models (this will recreate all tables):
   ```
   npm run db:sync
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google` - Login with Google
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/become-driver` - Upgrade user to driver role

### Vehicles

- `GET /api/vehicles` - Get all vehicles for current user
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles` - Create a new vehicle
- `PUT /api/vehicles/:id` - Update a vehicle
- `DELETE /api/vehicles/:id` - Delete a vehicle

### Rides

- `GET /api/rides/available` - Get all available rides
- `GET /api/rides/requested` - Get rides requested by the current user
- `GET /api/rides/offered` - Get rides offered by the current user
- `POST /api/rides/search` - Search for rides
- `POST /api/rides/offer` - Offer a new ride
- `POST /api/rides/request` - Request to join a ride
- `GET /api/rides/:id` - Get ride by ID
- `PUT /api/rides/:id/accept` - Accept a ride request
- `PUT /api/rides/:id/reject` - Reject a ride request
- `PUT /api/rides/:id/start` - Start a ride
- `PUT /api/rides/:id/complete` - Complete a ride
- `PUT /api/rides/:id/cancel` - Cancel a ride
- `POST /api/rides/:id/rate` - Rate a ride

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=community_rideshare
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
JWT_REFRESH_EXPIRATION=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Development

For development, you can use:

```
npm run dev
```

This will start the server with nodemon, which automatically restarts the server when code changes are detected.
