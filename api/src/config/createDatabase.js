const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration from .env
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'community_rideshare';

/**
 * Create the database if it doesn't exist
 */
async function createDatabase() {
  try {
    // Create a connection without database selected
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });
    
    console.log('Connected to MySQL server');
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database ${DB_NAME} created or already exists`);
    
    // Close the connection
    await connection.end();
    console.log('Database setup complete');
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    return false;
  }
}

// Execute if run directly
if (require.main === module) {
  createDatabase()
    .then(success => {
      if (success) {
        console.log('✅ Database initialization successful');
        process.exit(0);
      } else {
        console.error('❌ Database initialization failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Fatal error during database initialization:', err);
      process.exit(1);
    });
}

module.exports = createDatabase;
