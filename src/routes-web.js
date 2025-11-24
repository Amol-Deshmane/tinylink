// src/routes-web.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const router = express.Router();

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static HTML from /public
const publicDir = path.join(__dirname, "..", "public");

// Dashboard – "/"
router.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Stats page – "/code/:code"
router.get("/code/:code", (req, res) => {
  res.sendFile(path.join(publicDir, "stats.html"));
});

// Healthcheck – "/healthz"
router.get("/healthz", (req, res) => {
  res.status(200).json({
    ok: true,
    version: "1.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// AFTER /api so that /api/... is not treated as a code.
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      `UPDATE links
       SET total_clicks = total_clicks + 1,
           last_clicked_at = NOW()
       WHERE code = $1
       RETURNING target_url`,
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Not found");
    }

    const targetUrl = result.rows[0].target_url;
    return res.redirect(302, targetUrl);
  } catch (err) {
    console.error("Redirect error:", err);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
