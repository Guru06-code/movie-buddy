"use strict";
const fs = require("node:fs");
const webpush = require("web-push");
const { vapidKeyPath, reminderSchedulerIntervalMs } = require("./config");
const { log } = require("./logger");
const { getProfile, upsertProfile, dedupePushSubscriptions, applyScheduledReleaseReminders, createUniqueId, getAllProfileUserIds } = require("./db");

function loadVapidKeys() {
  const configuredPublicKey = String(process.env.PUSH_VAPID_PUBLIC_KEY || "").trim();
  const configuredPrivateKey = String(process.env.PUSH_VAPID_PRIVATE_KEY || "").trim();
  if (configuredPublicKey && configuredPrivateKey) return { publicKey: configuredPublicKey, privateKey: configuredPrivateKey };
  try {
    if (fs.existsSync(vapidKeyPath)) {
      const stored = JSON.parse(fs.readFileSync(vapidKeyPath, "utf8"));
      if (stored?.publicKey && stored?.privateKey) return { publicKey: String(stored.publicKey), privateKey: String(stored.privateKey) };
    }
  } catch (error) { log("warn", "Unable to read stored VAPID keys", { error: String(error) }); }
  const generated = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeyPath, JSON.stringify(generated, null, 2));
  console.warn("Generated local VAPID keys. Set PUSH_VAPID_PUBLIC_KEY and PUSH_VAPID_PRIVATE_KEY for stable push across restarts.");
  return generated;
}

const vapidKeys = loadVapidKeys();
webpush.setVapidDetails(
  String(process.env.PUSH_VAPID_SUBJECT || "mailto:moviebuddy@example.com").trim(),
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

function buildPushPayload(userId, notification) {
  return {
    title: notification.title || "Movie Buddy",
    body: notification.message || "You have a new reminder.",
    tag: `movie-buddy-${notification.type || "notice"}-${userId}`,
    data: { url: "/", notificationId: notification.id, type: notification.type || "system" },
  };
}

async function deliverPendingPushNotifications(userId, profile) {
  if (!profile || !Array.isArray(profile.pushSubscriptions) || profile.pushSubscriptions.length === 0) return false;
  const pendingNotifications = profile.notifications.filter((item) =>
    item?.type === "release-reminder-due" && typeof item.id === "string"
    && !profile.pushDeliveryLog.includes(item.id)
    && Number(item.createdAt || 0) >= Date.now() - (1000 * 60 * 60 * 24)
  );
  if (pendingNotifications.length === 0) return false;
  let changed = false;
  let activeSubscriptions = profile.pushSubscriptions.slice();
  for (const notification of pendingNotifications) {
    let delivered = false;
    const nextSubscriptions = [];
    for (const subscription of activeSubscriptions) {
      try {
        await webpush.sendNotification(subscription, JSON.stringify(buildPushPayload(userId, notification)));
        nextSubscriptions.push(subscription);
        delivered = true;
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) { changed = true; continue; }
        log("error", "Push delivery failed", { error: String(error) });
        nextSubscriptions.push(subscription);
      }
    }
    activeSubscriptions = nextSubscriptions;
    if (delivered) {
      profile.pushDeliveryLog.unshift(notification.id);
      profile.pushDeliveryLog = Array.from(new Set(profile.pushDeliveryLog)).slice(0, 500);
      changed = true;
    }
  }
  const deduped = dedupePushSubscriptions(activeSubscriptions);
  if (deduped.length !== profile.pushSubscriptions.length) changed = true;
  profile.pushSubscriptions = deduped;
  return changed;
}

function startBackgroundReminderScheduler() {
  let running = false;
  const runSweep = async () => {
    if (running) return;
    running = true;
    try {
      const userIds = await getAllProfileUserIds();
      for (const userId of userIds) {
        const profile = await getProfile(userId);
        const reminderChanged = applyScheduledReleaseReminders(profile);
        const pushChanged = await deliverPendingPushNotifications(userId, profile);
        if (reminderChanged || pushChanged) await upsertProfile(userId, profile);
      }
    } catch (error) { log("error", "Background reminder scheduler failed", { error: String(error) }); }
    finally { running = false; }
  };
  setTimeout(() => { void runSweep(); }, 5_000);
  setInterval(() => { void runSweep(); }, Math.max(15_000, reminderSchedulerIntervalMs));
}

module.exports = { vapidKeys, loadVapidKeys, buildPushPayload, deliverPendingPushNotifications, startBackgroundReminderScheduler };
