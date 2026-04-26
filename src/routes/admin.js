"use strict";
const { sendJson } = require("../http");
const { db, getUserById, createUniqueId } = require("../db");

function isAdminUser(user) {
  const adminEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPhone = String(process.env.ADMIN_PHONE || "").trim().replace(/\D/g, "");
  const userEmail  = (user?.email || "").toLowerCase();
  const userPhone  = (user?.phone || "").replace(/\D/g, "");
  if (!adminEmail && !adminPhone) return true; // no admin configured → allow
  if (adminEmail && userEmail === adminEmail) return true;
  if (adminPhone && userPhone && userPhone.endsWith(adminPhone)) return true;
  return false;
}

async function handleAdminRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/admin/stats") {
    const currentUser = await getUserById(userId);
    if (!isAdminUser(currentUser)) { sendJson(res, 403, { error: "Forbidden." }); return true; }
    const userCount    = (await db.execute("SELECT COUNT(*) as n FROM users")).rows[0].n;
    const sessionCount = (await db.execute({ sql: "SELECT COUNT(*) as n FROM sessions WHERE expires_at > ?", args: [Date.now()] })).rows[0].n;
    const profileCount = (await db.execute("SELECT COUNT(*) as n FROM profiles")).rows[0].n;
    const migrations   = (await db.execute("SELECT version, applied_at FROM schema_migrations ORDER BY version")).rows;
    sendJson(res, 200, { stats: { users: userCount, activeSessions: sessionCount, profiles: profileCount }, migrations });
    return true;
  }

  if (method === "POST" && path === "/api/admin/migrate-profiles") {
    const currentUser = await getUserById(userId);
    if (!isAdminUser(currentUser)) { sendJson(res, 403, { error: "Forbidden." }); return true; }
    let migrated = 0;
    let skipped = 0;
    const rows = (await db.execute("SELECT user_id, data FROM profiles WHERE migrated = 0")).rows;
    for (const row of rows) {
      try {
        const profile = JSON.parse(row.data);
        const uid = row.user_id;

        const collections = ["wishlist", "liked", "currentlyWatching", "releaseReminders"];
        for (const coll of collections) {
          const movies = Array.isArray(profile[coll]) ? profile[coll] : [];
          for (const movie of movies) {
            if (!movie?.id || !movie?.title) continue;
            const collName = coll === "currentlyWatching" ? "watchlist" : coll;
            const existing = (await db.execute({ sql: "SELECT id FROM user_movies WHERE user_id = ? AND imdb_id = ? AND collection = ?", args: [uid, movie.id, collName] })).rows[0];
            if (!existing) {
              await db.execute({ sql: "INSERT INTO user_movies (id, user_id, tmdb_id, imdb_id, title, year, poster, collection, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [createUniqueId("um"), uid, null, movie.id, movie.title, movie.year || "", movie.poster || "", collName, Date.now()] });
            }
          }
        }

        const watched = Array.isArray(profile.watched) ? profile.watched : [];
        for (const w of watched) {
          if (!w?.movieId) continue;
          const existing = (await db.execute({ sql: "SELECT id FROM user_watched WHERE user_id = ? AND imdb_id = ?", args: [uid, w.movieId] })).rows[0];
          if (!existing) {
            await db.execute({ sql: "INSERT INTO user_watched (id, user_id, tmdb_id, imdb_id, title, watched_at, rating) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [createUniqueId("uw"), uid, null, w.movieId, w.title || "", w.watchedAt || Date.now(), null] });
          }
        }

        await db.execute({ sql: "UPDATE profiles SET migrated = 1 WHERE user_id = ?", args: [uid] });
        migrated++;
      } catch { skipped++; }
    }
    sendJson(res, 200, { ok: true, migrated, skipped });
    return true;
  }

  // ── Contact message requests ──────────────────────────────────────────────
  if (method === "GET" && path === "/api/admin/requests") {
    const currentUser = await getUserById(userId);
    if (!isAdminUser(currentUser)) { sendJson(res, 403, { error: "Forbidden." }); return true; }
    const messages = (await db.execute("SELECT id, name, email, type, message, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 300")).rows;
    const unread = messages.filter((m) => m.status === "new").length;
    sendJson(res, 200, { messages, unread });
    return true;
  }

  if (method === "PUT" && path.startsWith("/api/admin/requests/") && path.endsWith("/read")) {
    const currentUser = await getUserById(userId);
    if (!isAdminUser(currentUser)) { sendJson(res, 403, { error: "Forbidden." }); return true; }
    const msgId = path.replace("/api/admin/requests/", "").replace("/read", "");
    await db.execute({ sql: "UPDATE contact_messages SET status = 'read' WHERE id = ?", args: [msgId] });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (method === "DELETE" && path.startsWith("/api/admin/requests/")) {
    const currentUser = await getUserById(userId);
    if (!isAdminUser(currentUser)) { sendJson(res, 403, { error: "Forbidden." }); return true; }
    const msgId = path.replace("/api/admin/requests/", "");
    await db.execute({ sql: "DELETE FROM contact_messages WHERE id = ?", args: [msgId] });
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

module.exports = { handleAdminRoutes };
