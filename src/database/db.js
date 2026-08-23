const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isLocal = process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } })
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
