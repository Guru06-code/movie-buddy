"use strict";
const path = require("node:path");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const projectRoot = path.resolve(__dirname, "..");
const dataDirectory = path.join(projectRoot, "data");
const databasePath = path.join(dataDirectory, "movie-buddy.sqlite");
const vapidKeyPath = path.join(dataDirectory, "movie-buddy-vapid.json");
const backupDirectory = path.join(dataDirectory, "backups");

const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 90;
const resetLifetimeMs = 1000 * 60 * 10;
const reminderSchedulerIntervalMs = Number(process.env.REMINDER_SCHEDULER_INTERVAL_MS || 60_000);
const omdbApiKey = String(process.env.OMDB_API_KEY || "thewdb").trim();
const tmdbApiKey = String(process.env.TMDB_API_KEY || "").trim();
const tmdbRegion = String(process.env.TMDB_REGION || "US").trim().toUpperCase();
const externalFetchTimeoutMs = Number(process.env.EXTERNAL_FETCH_TIMEOUT_MS || 8_000);
const requestBodyLimitBytes = Number(process.env.REQUEST_BODY_LIMIT_BYTES || 1_000_000);
const logLevel = String(process.env.LOG_LEVEL || "info").trim().toLowerCase();
const omdbMaxPages = 10;
const backupIntervalMs = Number(process.env.BACKUP_INTERVAL_HOURS || 6) * 60 * 60 * 1000;
const anthropicApiKey = String(process.env.ANTHROPIC_API_KEY || "").trim();
const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
const googleClientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();

const smtpConfig = {
  host: String(process.env.SMTP_HOST || "").trim(),
  port: Number(process.env.SMTP_PORT || 587),
  user: String(process.env.SMTP_USER || "").trim(),
  pass: String(process.env.SMTP_PASS || "").trim(),
  from: String(process.env.SMTP_FROM || "Movie Buddy <noreply@moviebuddy.app>").trim(),
};

const oauthConfig = {
  googleClientId,
  microsoftClientId: String(process.env.MICROSOFT_CLIENT_ID || "").trim(),
  microsoftAuthority: String(process.env.MICROSOFT_AUTHORITY || "https://login.microsoftonline.com/common").trim(),
  appleClientId: String(process.env.APPLE_CLIENT_ID || "").trim(),
  appleRedirectUri: String(process.env.APPLE_REDIRECT_URI || "").trim(),
};


function validateEnv() {
  const warnings = [];
  if (!process.env.OMDB_API_KEY) warnings.push("OMDB_API_KEY not set — using demo key (rate-limited)");
  if (!process.env.TMDB_API_KEY) warnings.push("TMDB_API_KEY not set — home dashboard uses public fallback feeds");
  if (!resendApiKey && !smtpConfig.host) warnings.push("Neither RESEND_API_KEY nor SMTP_HOST set — email OTPs will be logged to console only");
  if (!process.env.PUSH_VAPID_PUBLIC_KEY) warnings.push("PUSH_VAPID_PUBLIC_KEY not set — VAPID keys are ephemeral");
  if (!anthropicApiKey) warnings.push("ANTHROPIC_API_KEY not set — Claude AI refresh unavailable");
  if (!process.env.FAST2SMS_API_KEY) warnings.push("FAST2SMS_API_KEY not set — phone OTP will be logged to console only");
  if (process.env.NODE_ENV === "production") {
    if (!googleClientId && !oauthConfig.microsoftClientId && !oauthConfig.appleClientId)
      warnings.push("No OAuth provider configured — social login is demo-only");
  }
  return warnings;
}

module.exports = {
  host, port, projectRoot, dataDirectory, databasePath, vapidKeyPath, backupDirectory,
  sessionLifetimeMs, resetLifetimeMs, reminderSchedulerIntervalMs,
  omdbApiKey, tmdbApiKey, tmdbRegion, externalFetchTimeoutMs, requestBodyLimitBytes,
  logLevel, omdbMaxPages, backupIntervalMs, anthropicApiKey, resendApiKey,
  smtpConfig, oauthConfig, googleClientId,
  validateEnv,
};
