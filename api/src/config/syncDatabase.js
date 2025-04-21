const { syncDatabase } = require('../models/index');
require('dotenv').config();

/**
 * Run database synchronization
 */
async function runSync() {
  try {
    console.log('Starting database synchronization...');
    
    // Get force flag from environment or default to false
    const force = process.env.DB_SYNC_FORCE === 'true';
    
    // Sync database
    await syncDatabase(force);
    
    console.log('Database synchronization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error synchronizing database:', error);
    process.exit(1);
  }
}

// Execute sync
runSync();
