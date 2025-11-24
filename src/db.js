// src/db.js
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set – cannot connect to Postgres");
  throw new Error("DATABASE_URL env var is required");
}

console.log(
  "✅ Using DATABASE_URL for Postgres (length):",
  process.env.DATABASE_URL.length
);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon needs SSL
});

export default pool;
