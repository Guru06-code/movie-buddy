"use strict";
const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs");
const path = require("node:path");
const { gzipSync } = require("node:zlib");

const { host, port, projectRoot, databasePath, backupDirectory, backupIntervalMs, validateEnv } = require("./src/config");
const { log } = require("./src/logger");
const { cleanupExpiredRows, runMigrations, getSession } = require("./src/db");
const { withSecurityHeaders, sendJson } = require("./src/http");
const { isRateLimited } = require("./src/rateLimit");
const { startBackgroundReminderScheduler } = require("./src/push");
const { scheduleBackup } = require("./src/backup");

const { handleAuthRoutes, setSessionCookie } = require("./src/routes/auth");
const { handleProfileRoutes } = require("./src/routes/profile");
const { handleCatalogRoutes } = require("./src/routes/catalog");
const { handleFriendsRoutes } = require("./src/routes/friends");
const { handlePushRoutes } = require("./src/routes/push");
const { handleAdminRoutes } = require("./src/routes/admin");
const { handleContactRoutes } = require("./src/routes/contact");
const { handleListsRoutes } = require("./src/routes/lists");
const { handleAiRoutes } = require("./src/routes/ai");
const { handleActivityRoutes } = require("./src/routes/activity");

function applyCompression(req, res) {
  if (!(req.headers["accept-encoding"] || "").includes("gzip")) return;
  let storedStatus = 200, storedHeaders = {}, finished = false;
  const origWriteHead = res.writeHead.bind(res);
  const origEnd = res.end.bind(res);
  res.writeHead = (status, headers) => {
    storedStatus = status;
    storedHeaders = (typeof headers === "object" && headers) ? headers : {};
  };
  res.end = (data) => {
    if (finished) return;
    finished = true;
    if (!data) { origWriteHead(storedStatus, storedHeaders); origEnd(); return; }
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    try {
      const gz = gzipSync(buf);
      storedHeaders["Content-Encoding"] = "gzip";
      storedHeaders["Vary"] = "Accept-Encoding";
      origWriteHead(storedStatus, storedHeaders);
      origEnd(gz);
    } catch { origWriteHead(storedStatus, storedHeaders); origEnd(data); }
  };
}

// HTTP server
const server = http.createServer(async (request, response) => {
  applyCompression(request, response);
  const start = Date.now();
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
    const pathname = url.pathname.replace(/^\/api\/v1\//, "/api/");
    const normalizedUrl = new URL(pathname + url.search, `http://${request.headers.host || `${host}:${port}`}`);
    const isApi = normalizedUrl.pathname.startsWith("/api/");

    if (isApi) {
      const session = await getSession(request);
      if (isRateLimited(request, session?.userId)) {
        sendJson(response, 429, { error: "Too many requests. Please slow down." });
        return;
      }
      await handleApiRequest(request, response, normalizedUrl, session);
      log("info", "API", { method: request.method, path: pathname, status: response.statusCode, ms: Date.now() - start });
      return;
    }

    serveStaticAsset(request, response, url.pathname);
  } catch (error) {
    log("error", "Unhandled request error", { error: String(error), path: request.url });
    if (!response.headersSent) sendJson(response, 500, { error: "Internal server error." });
  }
});

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;

function shutdown(signal) {
  log("info", `Received ${signal}, shutting down gracefully`);
  server.close(() => {
    log("info", "HTTP server closed");
    process.exit(0);
  });
  setTimeout(() => { log("warn", "Forced exit after timeout"); process.exit(1); }, 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

async function handleApiRequest(request, response, url, session) {
  const method = request.method;
  const path = url.pathname;

  // Unauthenticated public endpoints
  if (method === "GET" && path === "/api/health") { sendJson(response, 200, { ok: true }); return; }
  if (await handleContactRoutes(request, response, url)) return;
  if (await handleAuthRoutes(request, response, url, session)) return;
  if (method === "GET" && path === "/api/push/public-key") { const { vapidKeys } = require("./src/push"); sendJson(response, 200, { publicKey: vapidKeys.publicKey }); return; }

  // Session required
  if (!session) {
    sendJson(response, 401, { error: "Session expired. Please log in again." });
    return;
  }

  if (session.rotated) setSessionCookie(response, session.token);

  const userId = session.userId;

  if (await handlePushRoutes(request, response, url, userId)) return;
  if (await handleProfileRoutes(request, response, url, userId)) return;
  if (await handleFriendsRoutes(request, response, url, userId)) return;
  if (await handleAdminRoutes(request, response, url, userId)) return;
  if (await handleListsRoutes(request, response, url, userId)) return;
  if (await handleAiRoutes(request, response, url, userId)) return;
  if (await handleActivityRoutes(request, response, url, userId)) return;
  if (await handleCatalogRoutes(request, response, url, userId)) return;

  sendJson(response, 404, { error: "Not found." });
}

function serveStaticAsset(_request, response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname === "/docs" ? "/docs.html" : pathname;
  const requestedPath = path.normalize(path.join(projectRoot, safePath));
  const filePath = requestedPath.startsWith(projectRoot) ? requestedPath : path.join(projectRoot, "index.html");
  const fallbackPath = path.join(projectRoot, "index.html");
  const finalPath = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : fallbackPath;
  const extension = path.extname(finalPath).toLowerCase();
  const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
  };
  const isHtml = extension === ".html" || !extension;
  const isJsOrCss = [".js", ".css"].includes(extension);
  const headers = { "Content-Type": contentTypes[extension] || "application/octet-stream" };
  if (isJsOrCss) {
    headers["Cache-Control"] = "public, max-age=3600";
  } else if (isHtml) {
    headers["Cache-Control"] = "no-cache, must-revalidate";
  }
  response.writeHead(200, withSecurityHeaders(headers, isHtml));
  response.end(fs.readFileSync(finalPath));
}

// Async startup: run migrations, then start listening
(async () => {
  await runMigrations();
  await cleanupExpiredRows();
  const warnings = validateEnv();
  warnings.forEach((w) => log("warn", w));

  const sslKeyPath = process.env.SSL_KEY_PATH;
  const sslCertPath = process.env.SSL_CERT_PATH;
  const sslKey = sslKeyPath && fs.existsSync(sslKeyPath) ? fs.readFileSync(sslKeyPath) : null;
  const sslCert = sslCertPath && fs.existsSync(sslCertPath) ? fs.readFileSync(sslCertPath) : null;

  if (sslKey && sslCert) {
    const httpsPort = Number(process.env.HTTPS_PORT || 443);
    const requestHandler = server.listeners("request")[0];
    https.createServer({ key: sslKey, cert: sslCert }, requestHandler).listen(httpsPort, host, () => {
      log("info", `Movie Buddy HTTPS on https://${host}:${httpsPort}`);
    });
    // HTTP server redirects to HTTPS
    server.removeAllListeners("request");
    server.on("request", (req, res) => {
      const hostname = (req.headers.host || "").replace(/:\d+$/, "");
      res.writeHead(301, { Location: `https://${hostname}${req.url}` });
      res.end();
    });
  }

  server.listen(port, host, () => {
    if (!sslKey) log("info", `Movie Buddy running on http://${host}:${port}`);
    else log("info", `HTTP redirect listening on http://${host}:${port}`);
    startBackgroundReminderScheduler();
    scheduleBackup(databasePath, backupDirectory, backupIntervalMs);
  });
})().catch((error) => {
  log("error", "Startup failed", { error: String(error) });
  process.exit(1);
});
