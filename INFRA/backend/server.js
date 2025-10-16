import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;
const DB_PATH = process.env.SQLITE_DB_PATH || "/data/babyfoot.db";

// DB helper
let db;
async function initDb() {
  db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  // Option soft: on ne crée rien ici, le schema est chargé par db-init via schema.sql
  console.log("SQLite open:", DB_PATH);
}
initDb().catch(err => {
  console.error("DB init error:", err);
  process.exit(1);
});

// Healthcheck
app.get("/api/health", async (req, res) => {
  try {
    const row = await db.get("SELECT datetime('now') AS now");
    res.json({ status: "ok", now: row?.now || null });
  } catch (e) {
    res.status(500).json({ status: "error", error: String(e) });
  }
});

// Stubs simples (à remplacer par votre vraie API)
app.get("/api/tables", async (req, res) => {
  try {
    // Si votre schema a une table 'tables', remplacez par SELECT réel.
    const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    res.json({ demo: true, tables });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/api/login", async (req, res) => {
  // Stub: renvoie un token factice
  const { email } = req.body || {};
  res.json({ ok: true, token: "demo-token", email: email || null });
});

app.listen(PORT, () => console.log(`Backend listening on :${PORT}`));

