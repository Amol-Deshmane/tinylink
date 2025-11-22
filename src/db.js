// src/db.js
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// In production (Render), we always expect DATABASE_URL
// Locally, you can still use .env with PGHOST/PGUSER if you want.
let pool;

if (process.env.DATABASE_URL) {
  // Render + Neon
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // required for Neon
  });
} else {
  // Local development fallback (Postgres on your machine)
  pool = new Pool({
    host: process.env.PGHOST || "localhost",
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || "postgres",
    password: process.env.PGPASSWORD || "",
    database: process.env.PGDATABASE || "tinylink",
  });
}

export default pool;
