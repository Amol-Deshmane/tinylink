import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import apiRoutes from "./src/routes-api.js";
import webRoutes from "./src/routes-web.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api/links", apiRoutes);

// Web + redirect + healthz
app.use("/", webRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`TinyLink server running on port ${PORT}`);
});
