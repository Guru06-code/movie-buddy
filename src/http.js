"use strict";
const { requestBodyLimitBytes } = require("./config");

const SECURITY_HEADERS_API = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const SECURITY_HEADERS_HTML = {
  ...SECURITY_HEADERS_API,
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' https://accounts.google.com https://alcdn.msauth.net https://appleid.cdn-apple.com https://fonts.googleapis.com 'unsafe-inline'",
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' https: data:",
    "connect-src 'self' https:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
  ].join("; "),
};

function withSecurityHeaders(baseHeaders, isHtml) {
  return { ...(isHtml ? SECURITY_HEADERS_HTML : SECURITY_HEADERS_API), ...baseHeaders };
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, withSecurityHeaders({ "Content-Type": "application/json; charset=utf-8" }, false));
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > requestBodyLimitBytes) {
        request.socket?.destroy();
        reject(new Error("Request body too large."));
      }
    });
    request.on("end", () => {
      if (!raw) { resolve({}); return; }
      try { resolve(JSON.parse(raw)); } catch { reject(new Error("Invalid JSON body.")); }
    });
    request.on("error", reject);
  });
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const sep = part.indexOf("=");
      if (sep === -1) return acc;
      acc[part.slice(0, sep).trim()] = decodeURIComponent(part.slice(sep + 1).trim());
      return acc;
    }, {});
}

module.exports = { SECURITY_HEADERS_API, SECURITY_HEADERS_HTML, withSecurityHeaders, sendJson, readJsonBody, parseCookies };
