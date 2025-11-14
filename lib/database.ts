import { Pool } from 'pg';

// Load environment variables
const DB_URL = process.env.DB_URL

const pool = new Pool({
  connectionString: DB_URL,
  ssl: {
    rejectUnauthorized: false,
    checkServerIdentity: () => undefined
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

let isInitialized = false;

// Create tables if they don't exist
async function initializeDatabase() {
  if (isInitialized) return;
  
  try {
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
    
    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_gold_prices_brand_date 
      ON gold_prices(brand, date);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_gold_prices_date 
      ON gold_prices(date);
    `);
    
    isInitialized = true;
    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Initialize database on connection
pool.on('connect', async () => {
  console.log('✅ Database connected successfully to new Supabase');
  await initializeDatabase();
});

pool.on('error', (err: any) => {
  console.error('❌ Database connection error:', err);
  if (err.code === 'XX000') {
    console.error('💡 This usually means:');
    console.error('   - Wrong username/password');
    console.error('   - Project not found');
    console.error('   - Database not created');
  }
  if (err.code === '28P01') {
    console.error('💡 Authentication failed:');
    console.error('   - Check username/password');
    console.error('   - Verify connection string format');
  }
});

// Export pool with initialization check
export default {
  query: async (text: string, params?: any[]) => {
    try {
      if (!isInitialized) {
        await initializeDatabase();
      }
      return pool.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  connect: () => pool.connect(),
  end: () => pool.end(),
  pool
};

export interface GoldPrice {
  id: number;
  brand: string;
  buy_price: number;
  sell_price: number;
  date: string;
  created_at: string;
  updated_at: string;
}

export interface GoldPriceChart {
  date: string;
  buy_price: number;
  sell_price: number;
  average_price: number;
}
