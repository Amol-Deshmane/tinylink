// src/db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Use DATABASE_URL in production (Render), fall back to local config if needed
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: process.env.PGPORT || 5432,
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'tinylink',
      }
);

export default pool;
