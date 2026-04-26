"use strict";
const { sendJson, readJsonBody } = require("../http");
const { db, createUniqueId, getUserById, addActivityEvent } = require("../db");
const { parseLetterboxdCsv, parseImdbCsv, parseTraktJson } = require("../importParser");

async function handleListsRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  // ---- User-created lists ----

  if (method === "GET" && path === "/api/lists") {
    const lists = (await db.execute({ sql: "SELECT * FROM user_lists WHERE user_id = ? ORDER BY created_at DESC", args: [userId] })).rows;
    const withCounts = await Promise.all(lists.map(async (list) => {
      const count = (await db.execute({ sql: "SELECT COUNT(*) as n FROM user_list_items WHERE list_id = ?", args: [list.id] })).rows[0].n;
      const previewItems = (await db.execute({ sql: "SELECT poster FROM user_list_items WHERE list_id = ? ORDER BY position ASC LIMIT 3", args: [list.id] })).rows;
      return { ...list, itemCount: count, previewPosters: previewItems.map((i) => i.poster).filter(Boolean) };
    }));
    sendJson(res, 200, { lists: withCounts });
    return true;
  }

  if (method === "POST" && path === "/api/lists") {
    const body = await readJsonBody(req);
    const name = String(body?.name || "").trim().slice(0, 100);
    const description = String(body?.description || "").trim().slice(0, 300);
    const isPublic = Boolean(body?.is_public);
    if (!name) { sendJson(res, 400, { error: "List name is required." }); return true; }
    const id = createUniqueId("list");
    await db.execute({ sql: "INSERT INTO user_lists (id, user_id, name, description, is_public, created_at) VALUES (?, ?, ?, ?, ?, ?)", args: [id, userId, name, description, isPublic ? 1 : 0, Date.now()] });
    await addActivityEvent(userId, "created_list", { listName: name });
    sendJson(res, 201, { ok: true, id });
    return true;
  }

  const listIdMatch = path.match(/^\/api\/lists\/([^/]+)$/);
  const listItemsMatch = path.match(/^\/api\/lists\/([^/]+)\/items$/);
  const listItemDeleteMatch = path.match(/^\/api\/lists\/([^/]+)\/items\/([^/]+)$/);
  const listReorderMatch = path.match(/^\/api\/lists\/([^/]+)\/items\/reorder$/);

  if (listReorderMatch && method === "PUT") {
    const listId = listReorderMatch[1];
    const list = (await db.execute({ sql: "SELECT * FROM user_lists WHERE id = ? AND user_id = ?", args: [listId, userId] })).rows[0] || null;
    if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }
    const body = await readJsonBody(req);
    const order = Array.isArray(body?.order) ? body.order : [];
    for (let index = 0; index < order.length; index++) {
      await db.execute({ sql: "UPDATE user_list_items SET position = ? WHERE id = ? AND list_id = ?", args: [index, order[index], listId] });
    }
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (listItemDeleteMatch && method === "DELETE") {
    const [, listId, itemId] = listItemDeleteMatch;
    const list = (await db.execute({ sql: "SELECT * FROM user_lists WHERE id = ? AND user_id = ?", args: [listId, userId] })).rows[0] || null;
    if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }
    await db.execute({ sql: "DELETE FROM user_list_items WHERE id = ? AND list_id = ?", args: [itemId, listId] });
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (listItemsMatch) {
    const listId = listItemsMatch[1];
    const list = (await db.execute({ sql: "SELECT * FROM user_lists WHERE id = ? AND user_id = ?", args: [listId, userId] })).rows[0] || null;
    if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }

    if (method === "GET") {
      const items = (await db.execute({ sql: "SELECT * FROM user_list_items WHERE list_id = ? ORDER BY position ASC", args: [listId] })).rows;
      sendJson(res, 200, { items });
      return true;
    }

    if (method === "POST") {
      const body = await readJsonBody(req);
      const title = String(body?.title || "").trim();
      const year = String(body?.year || "").trim();
      const poster = String(body?.poster || "").trim();
      const tmdbId = String(body?.tmdb_id || "").trim();
      const imdbId = String(body?.imdb_id || "").trim();
      if (!title) { sendJson(res, 400, { error: "Title is required." }); return true; }
      const maxPos = (await db.execute({ sql: "SELECT COALESCE(MAX(position), -1) as m FROM user_list_items WHERE list_id = ?", args: [listId] })).rows[0].m;
      const id = createUniqueId("li");
      await db.execute({ sql: "INSERT INTO user_list_items (id, list_id, tmdb_id, imdb_id, title, year, poster, position, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [id, listId, tmdbId || null, imdbId || null, title, year, poster, Number(maxPos) + 1, Date.now()] });
      sendJson(res, 201, { ok: true, id });
      return true;
    }
  }

  if (listIdMatch) {
    const listId = listIdMatch[1];
    const list = (await db.execute({ sql: "SELECT * FROM user_lists WHERE id = ? AND user_id = ?", args: [listId, userId] })).rows[0] || null;

    if (method === "PUT") {
      if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }
      const body = await readJsonBody(req);
      const name = String(body?.name || list.name).trim().slice(0, 100);
      const description = String(body?.description ?? list.description).trim().slice(0, 300);
      const isPublic = body?.is_public !== undefined ? Boolean(body.is_public) : Boolean(list.is_public);
      await db.execute({ sql: "UPDATE user_lists SET name = ?, description = ?, is_public = ? WHERE id = ?", args: [name, description, isPublic ? 1 : 0, listId] });
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (method === "DELETE") {
      if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }
      await db.execute({ sql: "DELETE FROM user_lists WHERE id = ?", args: [listId] });
      sendJson(res, 200, { ok: true });
      return true;
    }

    if (method === "GET") {
      if (!list) { sendJson(res, 404, { error: "List not found." }); return true; }
      const items = (await db.execute({ sql: "SELECT * FROM user_list_items WHERE list_id = ? ORDER BY position ASC", args: [listId] })).rows;
      sendJson(res, 200, { list: { ...list, items } });
      return true;
    }
  }

  // ---- Import ----

  if (method === "POST" && path === "/api/import/letterboxd") {
    const body = await readJsonBody(req);
    const text = String(body?.csv || body?.text || "").trim();
    if (!text) { sendJson(res, 400, { error: "CSV text is required." }); return true; }
    const entries = parseLetterboxdCsv(text);
    const result = await bulkImportEntries(userId, entries);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  if (method === "POST" && path === "/api/import/imdb") {
    const body = await readJsonBody(req);
    const text = String(body?.csv || body?.text || "").trim();
    if (!text) { sendJson(res, 400, { error: "CSV text is required." }); return true; }
    const entries = parseImdbCsv(text);
    const result = await bulkImportEntries(userId, entries);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  if (method === "POST" && path === "/api/import/trakt") {
    const body = await readJsonBody(req);
    const text = typeof body?.json === "string" ? body.json : JSON.stringify(body?.data || body || "[]");
    const entries = parseTraktJson(text);
    const result = await bulkImportEntries(userId, entries);
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  return false;
}

async function bulkImportEntries(userId, entries) {
  let imported = 0;
  let skipped = 0;
  for (const entry of entries) {
    if (!entry.title) { skipped++; continue; }
    try {
      const id = createUniqueId("um");
      await db.execute({ sql: "INSERT INTO user_movies (id, user_id, tmdb_id, imdb_id, title, year, poster, collection, added_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", args: [id, userId, null, null, entry.title, entry.year || "", "", "watched", entry.watchedAt || Date.now()] });
      if (entry.watchedAt) {
        await db.execute({ sql: "INSERT INTO user_watched (id, user_id, tmdb_id, imdb_id, title, watched_at, rating) VALUES (?, ?, ?, ?, ?, ?, ?)", args: [createUniqueId("uw"), userId, null, null, entry.title, entry.watchedAt, entry.rating || null] });
      }
      imported++;
    } catch { skipped++; }
  }
  return { imported, skipped, total: entries.length };
}

module.exports = { handleListsRoutes };
