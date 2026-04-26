"use strict";
const { sendJson, readJsonBody } = require("../http");
const { db, createUniqueId } = require("../db");

async function handleContactRoutes(req, res, url) {
  const method = req.method;
  const path = url.pathname;

  if (method === "POST" && path === "/api/contact") {
    const body = await readJsonBody(req);
    const name    = String(body?.name    || "").trim().slice(0, 100);
    const email   = String(body?.email   || "").trim().slice(0, 200);
    const type    = ["bug", "feature", "appreciation", "other"].includes(body?.type) ? body.type : "other";
    const message = String(body?.message || "").trim().slice(0, 2000);
    if (!message || message.length < 10) {
      sendJson(res, 400, { error: "Please write a message (at least 10 characters)." });
      return true;
    }
    await db.execute({
      sql: "INSERT INTO contact_messages (id, name, email, type, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      args: [createUniqueId("cm"), name, email, type, message, "new", Date.now()],
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

module.exports = { handleContactRoutes };
