const { Pool } = require('pg');
const path = require('path');

// Load environment variables with absolute path
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Debug: Check environment variables
console.log('Environment variables loaded:');
console.log('DB_URL:', process.env.DB_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Create gold_prices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gold_prices (
        id SERIAL PRIMARY KEY,
        brand VARCHAR(50) NOT NULL,
        buy_price DECIMAL(10,2) NOT NULL,
        sell_price DECIMAL(10,2) NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create index for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_gold_prices_brand_date 
      ON gold_prices(brand, date);
    `);
    
    // Create index for date range queries
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_gold_prices_date 
      ON gold_prices(date);
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

migrate();
