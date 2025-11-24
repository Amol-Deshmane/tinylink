// src/routes-api.js
import express from "express";
import pool from "./db.js";
import { isValidCodeFormat, isValidUrl, generateRandomCode } from "./utils.js";

const router = express.Router();

/*
  List all links (for dashboard)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT code,
              target_url,
              total_clicks,
              last_clicked_at,
              created_at
       FROM links
       ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET /api/links error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/*
  Get stats for a single code
 */
router.get("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      `SELECT code,
              target_url,
              total_clicks,
              last_clicked_at,
              created_at
       FROM links
       WHERE code = $1`,
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /api/links/:code error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/*
 POST /api/links
 */
router.post("/", async (req, res) => {
  let { url, code } = req.body || {};

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ error: "INVALID_URL" });
  }

  if (code && !isValidCodeFormat(code)) {
    return res.status(400).json({ error: "INVALID_CODE_FORMAT" });
  }

  try {
    if (!code) {
      let unique = false;
      let attempt = 0;

      while (!unique && attempt < 5) {
        code = generateRandomCode(6);
        const existing = await pool.query(
          "SELECT 1 FROM links WHERE code = $1",
          [code]
        );
        if (existing.rowCount === 0) unique = true;
        attempt++;
      }

      if (!unique) {
        return res.status(500).json({ error: "CODE_GENERATION_FAILED" });
      }
    } else {
      // Custom code: must be unique
      const existing = await pool.query(
        "SELECT 1 FROM links WHERE code = $1",
        [code]
      );
      if (existing.rowCount > 0) {
        return res.status(409).json({ error: "CODE_ALREADY_EXISTS" });
      }
    }

    const insert = await pool.query(
      `INSERT INTO links (code, target_url)
       VALUES ($1, $2)
       RETURNING code,
                 target_url,
                 total_clicks,
                 last_clicked_at,
                 created_at`,
      [code, url]
    );

    res.status(201).json(insert.rows[0]);
  } catch (err) {
    console.error("POST /api/links error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/*
  Delete a link by code
 */
router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM links WHERE code = $1",
      [code]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "NOT_FOUND" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /api/links/:code error:", err);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
