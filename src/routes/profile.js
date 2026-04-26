"use strict";
const { sendJson, readJsonBody } = require("../http");
const { getProfile, upsertProfile, mergeProfileForSync, getUserById, sanitizeUser, isHandleAvailable, updateUserAvatar, updateUserSettings } = require("../db");
const { buildAppState } = require("../catalog");

async function handleProfileRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "PUT" && path === "/api/profile") {
    const body = await readJsonBody(req);
    const { normalizeProfile } = require("../db");
    const profile = mergeProfileForSync(await getProfile(userId), normalizeProfile(body?.profile));
    await upsertProfile(userId, profile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "GET" && path === "/api/profile/page") {
    const user = await getUserById(userId);
    const profile = await getProfile(userId);
    sendJson(res, 200, {
      user: sanitizeUser(user),
      stats: {
        watched: (profile.watched || []).length,
        liked: (profile.liked || []).length,
        wishlist: (profile.wishlist || []).length,
        friends: (profile.friendIds || []).length,
      },
      recentWatched: (profile.watched || []).slice(0, 6),
      recentLiked: (profile.liked || []).slice(0, 6),
    });
    return true;
  }

  if (method === "GET" && path === "/api/profile/stats") {
    const profile = await getProfile(userId);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
    const watched = profile.watched || [];
    const totalWatched = watched.length;

    // byMonth from profile.watched (reliable source)
    const byMonth = {};
    watched.forEach((w) => {
      const key = new Date(Number(w.watchedAt || 0)).toISOString().slice(0, 7);
      if (key > "2000-01") byMonth[key] = (byMonth[key] || 0) + 1;
    });

    // Genre counts from both liked + watched movie objects
    const genreCounts = {};
    const allMovies = [...(profile.liked || []), ...(profile.wishlist || [])];
    allMovies.forEach((m) => {
      (m.genre || "").split(/,/).map((g) => g.trim())
        .filter((g) => g && g.length > 1 && g.length < 25 && !/tmdb|year/i.test(g))
        .forEach((g) => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
    });
    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Average rating from watched items that have a rating
    const ratedItems = watched.filter((w) => Number(w.rating) > 0);
    const avgRating = ratedItems.length
      ? ratedItems.reduce((sum, w) => sum + Number(w.rating), 0) / ratedItems.length
      : null;

    const movieCount = watched.filter((w) => {
      const id = String(w.movieId || "");
      return !id.includes("-series-") && !id.includes("tv-");
    }).length;

    sendJson(res, 200, {
      totalWatched,
      totalLiked: (profile.liked || []).length,
      totalWishlist: (profile.wishlist || []).length,
      friendsCount: (profile.friendIds || []).length,
      watchedThisMonth: watched.filter((w) => Number(w.watchedAt || 0) >= monthStart.getTime()).length,
      topGenres,
      topGenre: topGenres[0]?.name || null,
      avgRating,
      estimatedHours: Math.round(totalWatched * 1.8),
      movieCount,
      seriesCount: totalWatched - movieCount,
      recsReceived: (profile.friendRecommendationInbox || []).length,
      recsSent: (profile.sentRecommendations || []).length,
      recsWatched: watched.filter((w) => w.source === "friend").length,
      byMonth,
    });
    return true;
  }

  // ── Avatar update ──────────────────────────────────────────────────────────
  if (method === "PUT" && path === "/api/profile/avatar") {
    const body = await readJsonBody(req);
    const avatarType = String(body?.avatarType || "");
    const VALID_PRESETS = new Set(["p1","p2","p3","p4","p5","p6","p7","p8","p9","p10","p11","p12"]);
    let avatarUrl = "";

    if (avatarType === "preset") {
      const presetId = String(body?.value || "").trim();
      if (!VALID_PRESETS.has(presetId)) { sendJson(res, 400, { error: "Invalid preset ID." }); return true; }
      avatarUrl = `preset:${presetId}`;
    } else if (avatarType === "upload") {
      const dataUrl = String(body?.value || "");
      if (!dataUrl.startsWith("data:image/")) { sendJson(res, 400, { error: "Invalid image data — must be a data: URL." }); return true; }
      if (dataUrl.length > 350_000) { sendJson(res, 400, { error: "Image too large. Please use an image under 200 KB." }); return true; }
      avatarUrl = dataUrl;
    } else if (avatarType === "clear") {
      avatarUrl = "";
    } else {
      sendJson(res, 400, { error: "avatarType must be preset, upload, or clear." });
      return true;
    }

    await updateUserAvatar(userId, avatarUrl);
    const user = await getUserById(userId);
    sendJson(res, 200, { ok: true, user: sanitizeUser(user) });
    return true;
  }

  // ── Profile settings (name + handle) ──────────────────────────────────────
  if (method === "PUT" && path === "/api/profile/settings") {
    const body = await readJsonBody(req);
    const name = String(body?.name || "").trim();
    const handle = String(body?.handle || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    if (!name) { sendJson(res, 400, { error: "Name cannot be empty." }); return true; }
    if (!handle || handle.length < 3) { sendJson(res, 400, { error: "Handle must be at least 3 characters (letters, numbers, _ . -)." }); return true; }
    if (handle.length > 30) { sendJson(res, 400, { error: "Handle must be 30 characters or fewer." }); return true; }
    if (!(await isHandleAvailable(handle, userId))) {
      sendJson(res, 409, { error: "That handle is already taken." });
      return true;
    }
    await updateUserSettings(userId, { name, handle });
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "PUT" && path === "/api/profile/privacy") {
    const body = await readJsonBody(req);
    const profile = await getProfile(userId);
    profile.friendPrivacy = {
      showWishlist: Boolean(body?.showWishlist),
      showLiked:    Boolean(body?.showLiked),
      showWatched:  Boolean(body?.showWatched),
    };
    await upsertProfile(userId, profile);
    sendJson(res, 200, { ok: true });
    return true;
  }

  return false;
}

module.exports = { handleProfileRoutes };
