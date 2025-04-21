const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
// Ensure all connection details are provided via environment variables in production
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql', // Keep mysql as default dialect if not specified
    logging: false, // Disable logging in production by default
    pool: {
      max: 5, // Default pool settings, adjust if needed
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Explicitly set the connection timezone to UTC
    // This helps ensure consistency in date handling, especially with DATEONLY
    timezone: '+00:00',
    dialectOptions: {
      // Add SSL options for secure connection to RDS
      ssl: {
        require: true,
        // Depending on your RDS setup and CA, you might need:
        // rejectUnauthorized: false // Use with caution, less secure
        // ca: fs.readFileSync(__dirname + '/path/to/rds-ca-2019-root.pem') // If specific CA cert needed
      }
    }
  }
);

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};
