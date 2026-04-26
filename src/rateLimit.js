"use strict";
const { log } = require("./logger");

const RATE_LIMIT_WINDOW_MS = 60_000;
const IP_RATE_LIMIT_MAX = 120;
const USER_RATE_LIMIT_MAX = 300;

const rateLimitStore = new Map();

setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS * 2;
  for (const [key, entry] of rateLimitStore) {
    if (entry.ts < cutoff) rateLimitStore.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS * 5).unref();

function getIpKey(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0]?.trim() || request.socket?.remoteAddress || "unknown";
}

function checkRateLimitForKey(key, max) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now - entry.ts > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { ts: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}

function isRateLimited(request, userId) {
  const ip = getIpKey(request);
  if (userId) {
    const userKey = `user:${userId}`;
    if (checkRateLimitForKey(userKey, USER_RATE_LIMIT_MAX)) {
      log("warn", "User rate limited", { userId, path: request.url });
      return true;
    }
    return false;
  }
  if (checkRateLimitForKey(`ip:${ip}`, IP_RATE_LIMIT_MAX)) {
    log("warn", "IP rate limited", { ip, path: request.url });
    return true;
  }
  return false;
}

function getRateLimitKey(request) {
  return getIpKey(request);
}

module.exports = { isRateLimited, getRateLimitKey };
