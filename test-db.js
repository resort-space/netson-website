const { Pool } = require('pg');

require('dotenv').config();

console.log('DB_URL:', process.env.DB_URL);

const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        rejectUnauthorized: false,
        checkServerIdentity: () => undefined
    }
});

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const client = await pool.connect();
        console.log('✅ Connected successfully!');
        const result = await client.query('SELECT VERSION()');
        console.log('Database version:', result.rows[0].version);
        client.release();
        pool.end();
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        pool.end();
    }
}

testConnection();