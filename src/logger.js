"use strict";
const { logLevel } = require("./config");

const levels = { error: 0, warn: 1, info: 2, debug: 3 };

function log(level, message, meta) {
  if ((levels[level] || 0) > (levels[logLevel] || 2)) return;
  const entry = { ts: new Date().toISOString(), level, message };
  if (meta && typeof meta === "object") Object.assign(entry, meta);
  const out = level === "error" || level === "warn" ? process.stderr : process.stdout;
  out.write(JSON.stringify(entry) + "\n");
}

module.exports = { log };
