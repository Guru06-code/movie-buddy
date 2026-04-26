"use strict";
const { sendJson, readJsonBody } = require("../http");
const { getProfile, upsertProfile, normalizePushSubscription, dedupePushSubscriptions } = require("../db");
const { buildAppState } = require("../catalog");

async function handlePushRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "POST" && path === "/api/push/subscribe") {
    const body = await readJsonBody(req);
    const subscription = normalizePushSubscription(body?.subscription);
    if (!subscription) { sendJson(res, 400, { error: "Push subscription payload was invalid." }); return true; }
    const profile = await getProfile(userId);
    profile.pushSubscriptions = dedupePushSubscriptions([subscription, ...profile.pushSubscriptions]);
    await upsertProfile(userId, profile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  if (method === "POST" && path === "/api/push/unsubscribe") {
    const body = await readJsonBody(req);
    const endpoint = String(body?.endpoint || "").trim();
    const profile = await getProfile(userId);
    profile.pushSubscriptions = profile.pushSubscriptions.filter((i) => i.endpoint !== endpoint);
    await upsertProfile(userId, profile);
    sendJson(res, 200, await buildAppState(userId));
    return true;
  }

  return false;
}

module.exports = { handlePushRoutes };
