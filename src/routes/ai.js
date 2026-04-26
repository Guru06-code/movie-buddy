"use strict";
const { sendJson } = require("../http");
const { getProfile, getUserSetting, setUserSetting } = require("../db");
const { getAiRecommendations } = require("../ai");

const AI_REC_CACHE_TTL = 24 * 60 * 60 * 1000;

async function handleAiRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/ai/recommendations") {
    const cached = await getUserSetting(userId, "ai_recs_cache");
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < AI_REC_CACHE_TTL) {
          sendJson(res, 200, { recommendations: data, source: "cache" });
          return true;
        }
      } catch { /* stale cache */ }
    }

    const profile = await getProfile(userId);
    const likedTitles = (profile.liked || []).map((m) => m.title).filter(Boolean);
    const watchedTitles = (profile.watched || []).map((w) => w.title).filter(Boolean);

    const recs = await getAiRecommendations(likedTitles, watchedTitles);
    if (recs) {
      await setUserSetting(userId, "ai_recs_cache", JSON.stringify({ data: recs, ts: Date.now() }));
      sendJson(res, 200, { recommendations: recs, source: "claude" });
    } else {
      sendJson(res, 200, { recommendations: [], source: "unavailable" });
    }
    return true;
  }

  return false;
}

module.exports = { handleAiRoutes };
