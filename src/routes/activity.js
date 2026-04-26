"use strict";
const { sendJson, readJsonBody } = require("../http");
const { db, getProfile, getUserById, createUniqueId, createNotification, upsertProfile } = require("../db");

const ALLOWED_EMOJIS = new Set(["👍", "❤️", "🎬", "😮", "😂"]);

async function getReactionsForEvent(activityId, requestingUserId) {
  const rows = (await db.execute({
    sql: "SELECT emoji, COUNT(*) as count, MAX(CASE WHEN user_id = ? THEN 1 ELSE 0 END) as mine FROM activity_reactions WHERE activity_id = ? GROUP BY emoji",
    args: [requestingUserId, activityId],
  })).rows;
  return rows.map((r) => ({ emoji: r.emoji, count: Number(r.count), mine: Boolean(r.mine) }));
}

async function handleActivityRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  // ── Activity feed ─────────────────────────────────────────────────────────
  if (method === "GET" && path === "/api/activity") {
    const profile = await getProfile(userId);
    const friendIds = Array.isArray(profile.friendIds) ? profile.friendIds : [];
    const participantIds = [userId, ...friendIds];

    const placeholders = participantIds.map(() => "?").join(",");
    const rows = (await db.execute({
      sql: `SELECT * FROM activity_feed WHERE user_id IN (${placeholders}) ORDER BY created_at DESC LIMIT 50`,
      args: participantIds,
    })).rows;

    const events = await Promise.all(rows.map(async (row) => {
      const user = await getUserById(row.user_id);
      let payload = {};
      try { payload = JSON.parse(row.payload); } catch { /* ignore */ }
      const reactions = await getReactionsForEvent(row.id, userId);
      const commentCountRow = (await db.execute({ sql: "SELECT COUNT(*) as n FROM activity_comments WHERE activity_id = ?", args: [row.id] })).rows[0];
      return {
        id: row.id,
        userId: row.user_id,
        userName: user?.name || "Unknown",
        userHandle: user?.handle || "",
        type: row.type,
        payload,
        createdAt: row.created_at,
        reactions,
        commentCount: Number(commentCountRow?.n || 0),
      };
    }));

    sendJson(res, 200, { events });
    return true;
  }

  // ── React to an activity event ────────────────────────────────────────────
  const reactMatch = method === "POST" && path.match(/^\/api\/activity\/([^/]+)\/react$/);
  if (reactMatch) {
    const activityId = reactMatch[1];
    const body = await readJsonBody(req);
    const emoji = String(body?.emoji || "").trim();
    if (!ALLOWED_EMOJIS.has(emoji)) {
      sendJson(res, 400, { error: "Invalid emoji. Allowed: 👍 ❤️ 🎬 😮 😂" });
      return true;
    }
    const existing = (await db.execute({
      sql: "SELECT id FROM activity_reactions WHERE activity_id = ? AND user_id = ? AND emoji = ?",
      args: [activityId, userId, emoji],
    })).rows[0];
    if (existing) {
      await db.execute({ sql: "DELETE FROM activity_reactions WHERE id = ?", args: [existing.id] });
    } else {
      await db.execute({
        sql: "INSERT INTO activity_reactions (id, activity_id, user_id, emoji, created_at) VALUES (?, ?, ?, ?, ?)",
        args: [createUniqueId("react"), activityId, userId, emoji, Date.now()],
      });
    }
    const reactions = await getReactionsForEvent(activityId, userId);
    sendJson(res, 200, { ok: true, reactions });
    return true;
  }

  // ── Comment on an activity event ──────────────────────────────────────────
  const commentMatch = method === "POST" && path.match(/^\/api\/activity\/([^/]+)\/comment$/);
  if (commentMatch) {
    const activityId = commentMatch[1];
    const body = await readJsonBody(req);
    const text = String(body?.text || "").trim().slice(0, 280);
    if (!text) { sendJson(res, 400, { error: "Comment cannot be empty." }); return true; }

    const commentId = createUniqueId("comment");
    await db.execute({
      sql: "INSERT INTO activity_comments (id, activity_id, user_id, text, created_at) VALUES (?, ?, ?, ?, ?)",
      args: [commentId, activityId, userId, text, Date.now()],
    });

    // Notify the activity owner (skip if it's their own event)
    const eventRow = (await db.execute({ sql: "SELECT user_id FROM activity_feed WHERE id = ?", args: [activityId] })).rows[0];
    if (eventRow && eventRow.user_id !== userId) {
      const commenter = await getUserById(userId);
      const ownerProfile = await getProfile(eventRow.user_id);
      createNotification(ownerProfile, {
        type: "activity-comment",
        title: "New comment",
        message: `${commenter?.name || "Someone"} commented on your activity.`,
      });
      await upsertProfile(eventRow.user_id, ownerProfile);
    }

    const commenter = await getUserById(userId);
    sendJson(res, 200, {
      ok: true,
      comment: { id: commentId, text, userName: commenter?.name || "Unknown", userHandle: commenter?.handle || "", createdAt: Date.now() },
    });
    return true;
  }

  // ── Get comments for an event ─────────────────────────────────────────────
  const getCommentsMatch = method === "GET" && path.match(/^\/api\/activity\/([^/]+)\/comments$/);
  if (getCommentsMatch) {
    const activityId = getCommentsMatch[1];
    const rows = (await db.execute({
      sql: "SELECT c.*, u.name as user_name, u.handle as user_handle FROM activity_comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.activity_id = ? ORDER BY c.created_at ASC LIMIT 50",
      args: [activityId],
    })).rows;
    const comments = rows.map((r) => ({
      id: r.id, text: r.text,
      userName: r.user_name || "Unknown",
      userHandle: r.user_handle || "",
      createdAt: r.created_at,
      isOwn: r.user_id === userId,
    }));
    sendJson(res, 200, { comments });
    return true;
  }

  return false;
}

module.exports = { handleActivityRoutes };
