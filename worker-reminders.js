// Standalone background worker for release reminders and push delivery.
// Run separately from the web server: node worker-reminders.js
// In production, managed by PM2 (see ecosystem.config.js).

const path = require("node:path");
const fs = require("node:fs");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const webpush = require("web-push");

const projectRoot = __dirname;
const dataDirectory = path.join(projectRoot, "data");
const databasePath = path.join(dataDirectory, "movie-buddy.sqlite");
const vapidKeyPath = path.join(dataDirectory, "movie-buddy-vapid.json");
const sweepIntervalMs = Number(process.env.REMINDER_SCHEDULER_INTERVAL_MS || 60_000);
const logLevel = String(process.env.LOG_LEVEL || "info").toLowerCase();

function log(level, message, meta) {
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  if ((levels[level] || 0) > (levels[logLevel] || 2)) return;
  const entry = { ts: new Date().toISOString(), level, message, worker: "reminders" };
  if (meta) Object.assign(entry, meta);
  (level === "error" ? process.stderr : process.stdout).write(JSON.stringify(entry) + "\n");
}

let vapidKeys;
try {
  const configuredPublic = String(process.env.PUSH_VAPID_PUBLIC_KEY || "").trim();
  const configuredPrivate = String(process.env.PUSH_VAPID_PRIVATE_KEY || "").trim();
  if (configuredPublic && configuredPrivate) {
    vapidKeys = { publicKey: configuredPublic, privateKey: configuredPrivate };
  } else if (fs.existsSync(vapidKeyPath)) {
    vapidKeys = JSON.parse(fs.readFileSync(vapidKeyPath, "utf8"));
  } else {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(vapidKeyPath, JSON.stringify(vapidKeys, null, 2));
    log("warn", "Generated ephemeral VAPID keys — set env vars for stable push");
  }
} catch (error) {
  log("error", "VAPID key load failed", { error: String(error) });
  process.exit(1);
}

const vapidSubject = String(process.env.PUSH_VAPID_SUBJECT || "mailto:moviebuddy@example.com").trim();
webpush.setVapidDetails(vapidSubject, vapidKeys.publicKey, vapidKeys.privateKey);

const db = new DatabaseSync(databasePath, { readonly: false });
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");

log("info", "Reminder worker started", { sweepIntervalMs });

let running = false;

async function runSweep() {
  if (running) return;
  running = true;
  const start = Date.now();
  let processed = 0;
  let delivered = 0;

  try {
    const rows = db.prepare("SELECT user_id FROM profiles").all();
    for (const row of rows) {
      const userId = row.user_id;
      const profileRow = db.prepare("SELECT data FROM profiles WHERE user_id = ?").get(userId);
      if (!profileRow) continue;

      let profile;
      try {
        profile = JSON.parse(profileRow.data);
      } catch {
        continue;
      }

      const reminderChanged = applyScheduledReleaseReminders(profile);
      const pushChanged = await deliverPendingPushNotifications(userId, profile);

      if (reminderChanged || pushChanged) {
        db.prepare("INSERT INTO profiles (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
          .run(userId, JSON.stringify(profile), Date.now());
        delivered++;
      }
      processed++;
    }
  } catch (error) {
    log("error", "Sweep failed", { error: String(error) });
  } finally {
    running = false;
    log("info", "Sweep complete", { processed, delivered, ms: Date.now() - start });
  }
}

function applyScheduledReleaseReminders(profile) {
  if (!profile || !Array.isArray(profile.releaseReminders) || profile.releaseReminders.length === 0) return false;
  const prefs = profile.reminderPreferences || { enabled: true, leadDays: 1, deliveryHour: 9, timezone: "UTC" };
  if (!prefs.enabled) return false;

  const log_ = Array.isArray(profile.reminderDeliveryLog) ? [...profile.reminderDeliveryLog] : [];
  let changed = false;
  const now = new Date();

  profile.releaseReminders.forEach((movie) => {
    if (!movie?.releaseDate) return;
    const releaseDate = new Date(movie.releaseDate);
    if (isNaN(releaseDate.getTime())) return;

    const dueDate = new Date(releaseDate.getTime() - prefs.leadDays * 86400000);
    if (now < dueDate) return;

    const key = `${movie.id}:${movie.releaseDate}:${prefs.leadDays}`;
    if (log_.includes(key)) return;

    const notification = {
      id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "release-reminder-due",
      title: "Release reminder",
      message: `${movie.title} releases ${prefs.leadDays === 0 ? "today" : `in ${prefs.leadDays} day${prefs.leadDays === 1 ? "" : "s"}`}.`,
      createdAt: Date.now(),
      read: false,
    };

    if (!Array.isArray(profile.notifications)) profile.notifications = [];
    profile.notifications.unshift(notification);
    log_.unshift(key);
    changed = true;
  });

  profile.reminderDeliveryLog = [...new Set(log_)].slice(0, 500);
  return changed;
}

async function deliverPendingPushNotifications(userId, profile) {
  if (!Array.isArray(profile.pushSubscriptions) || profile.pushSubscriptions.length === 0) return false;
  const deliveryLog = Array.isArray(profile.pushDeliveryLog) ? profile.pushDeliveryLog : [];
  const pending = (profile.notifications || []).filter((n) =>
    n?.type === "release-reminder-due" &&
    !deliveryLog.includes(n.id) &&
    Number(n.createdAt || 0) >= Date.now() - 86400000
  );
  if (pending.length === 0) return false;

  let changed = false;
  for (const notification of pending) {
    for (const sub of profile.pushSubscriptions) {
      try {
        await webpush.sendNotification(sub, JSON.stringify({
          title: notification.title || "Movie Buddy",
          body: notification.message || "",
          tag: `movie-buddy-reminder-${userId}`,
          data: { url: "/", notificationId: notification.id },
        }));
        profile.pushDeliveryLog = [...new Set([notification.id, ...(profile.pushDeliveryLog || [])])].slice(0, 500);
        changed = true;
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          profile.pushSubscriptions = profile.pushSubscriptions.filter((s) => s.endpoint !== sub.endpoint);
          changed = true;
        }
      }
    }
  }
  return changed;
}

setTimeout(() => void runSweep(), 5_000);
setInterval(() => void runSweep(), Math.max(15_000, sweepIntervalMs));

process.on("SIGTERM", () => { log("info", "Worker shutting down"); process.exit(0); });
process.on("SIGINT", () => { log("info", "Worker shutting down"); process.exit(0); });
