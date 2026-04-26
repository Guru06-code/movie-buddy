"use strict";
const { copyFileSync, mkdirSync, readdirSync, statSync, unlinkSync } = require("node:fs");
const { join } = require("node:path");
const { log } = require("./logger");

function runBackup(dbPath, backupDir) {
  // Skip local backup when using Turso cloud DB — data lives in Turso, not a local file
  if (process.env.TURSO_DATABASE_URL) return;
  try {
    mkdirSync(backupDir, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const dest = join(backupDir, `movie-buddy-${ts}.sqlite`);
    copyFileSync(dbPath, dest);
    log("info", "SQLite backup created", { dest });
    pruneOldBackups(backupDir, 7 * 24 * 60 * 60 * 1000);
  } catch (error) {
    log("error", "SQLite backup failed", { error: String(error) });
  }
}

function pruneOldBackups(backupDir, maxAgeMs) {
  const cutoff = Date.now() - maxAgeMs;
  try {
    readdirSync(backupDir).forEach((file) => {
      if (!file.endsWith(".sqlite")) return;
      const filePath = join(backupDir, file);
      const { mtimeMs } = statSync(filePath);
      if (mtimeMs < cutoff) { unlinkSync(filePath); log("info", "Pruned old backup", { file }); }
    });
  } catch { /* ignore prune errors */ }
}

function scheduleBackup(dbPath, backupDir, intervalMs) {
  runBackup(dbPath, backupDir);
  setInterval(() => runBackup(dbPath, backupDir), intervalMs).unref();
}

module.exports = { runBackup, scheduleBackup };
