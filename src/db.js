"use strict";
const { createClient } = require("@libsql/client");
const crypto = require("node:crypto");
const fs = require("node:fs");
const { dataDirectory, sessionLifetimeMs } = require("./config");
const { log } = require("./logger");

const tursoUrl = String(process.env.TURSO_DATABASE_URL || "").trim();
const tursoAuthToken = String(process.env.TURSO_AUTH_TOKEN || "").trim();
// libsql:// uses a persistent WebSocket that Turso drops on idle; https:// uses stateless HTTP
const dbUrl = (tursoUrl || "file:./data/movie-buddy.db").replace(/^libsql:\/\//, "https://");

if (!tursoUrl) fs.mkdirSync(dataDirectory, { recursive: true });

const db = createClient({
  url: dbUrl,
  ...(tursoAuthToken ? { authToken: tursoAuthToken } : {}),
});

// ---- Migrations ----

async function runMigrations() {
  const coreStatements = [
    `CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, handle TEXT NOT NULL UNIQUE, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, provider TEXT NOT NULL DEFAULT 'password', created_at INTEGER NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS profiles (user_id TEXT PRIMARY KEY, data TEXT NOT NULL, updated_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS password_resets (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, identifier TEXT NOT NULL, otp TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`,
  ];
  for (const sql of coreStatements) {
    await db.execute(sql);
  }

  const migrations = [
    { version: 1, sql: "ALTER TABLE users ADD COLUMN avatar_color TEXT NOT NULL DEFAULT '#e8a020'" },
    { version: 2, sql: "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)" },
    { version: 3, sql: "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)" },
    { version: 4, sql: `CREATE TABLE IF NOT EXISTS user_movies (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, tmdb_id TEXT, imdb_id TEXT, title TEXT NOT NULL, year TEXT, poster TEXT, collection TEXT NOT NULL DEFAULT 'wishlist', added_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 5, sql: `CREATE TABLE IF NOT EXISTS user_watched (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, tmdb_id TEXT, imdb_id TEXT, title TEXT NOT NULL, watched_at INTEGER NOT NULL, rating INTEGER, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 6, sql: `CREATE TABLE IF NOT EXISTS friendships (user_id TEXT NOT NULL, friend_id TEXT NOT NULL, created_at INTEGER NOT NULL, PRIMARY KEY (user_id, friend_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 7, sql: `CREATE TABLE IF NOT EXISTS friend_requests (id TEXT PRIMARY KEY, from_id TEXT NOT NULL, to_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', created_at INTEGER NOT NULL, FOREIGN KEY (from_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (to_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 8, sql: `CREATE TABLE IF NOT EXISTS user_settings (user_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT, PRIMARY KEY (user_id, key), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 9, sql: `CREATE TABLE IF NOT EXISTS activity_feed (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, type TEXT NOT NULL, payload TEXT NOT NULL DEFAULT '{}', created_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 10, sql: `CREATE TABLE IF NOT EXISTS user_lists (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', is_public INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)` },
    { version: 11, sql: `CREATE TABLE IF NOT EXISTS user_list_items (id TEXT PRIMARY KEY, list_id TEXT NOT NULL, tmdb_id TEXT, imdb_id TEXT, title TEXT NOT NULL, year TEXT, poster TEXT, position INTEGER NOT NULL DEFAULT 0, added_at INTEGER NOT NULL, FOREIGN KEY (list_id) REFERENCES user_lists(id) ON DELETE CASCADE)` },
    { version: 12, sql: "ALTER TABLE users ADD COLUMN google_id TEXT" },
    { version: 13, sql: "ALTER TABLE profiles ADD COLUMN migrated INTEGER NOT NULL DEFAULT 0" },
    { version: 14, sql: "CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id, created_at DESC)" },
    { version: 15, sql: "CREATE INDEX IF NOT EXISTS idx_user_lists_user_id ON user_lists(user_id)" },
    { version: 16, sql: "CREATE INDEX IF NOT EXISTS idx_user_list_items_list_id ON user_list_items(list_id, position)" },
    { version: 17, sql: "CREATE INDEX IF NOT EXISTS idx_user_movies_user_id ON user_movies(user_id, collection)" },
    { version: 18, sql: "CREATE INDEX IF NOT EXISTS idx_user_watched_user_id ON user_watched(user_id)" },
    { version: 19, sql: "CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id)" },
    { version: 20, sql: "CREATE INDEX IF NOT EXISTS idx_friend_requests_from ON friend_requests(from_id)" },
    { version: 21, sql: "CREATE INDEX IF NOT EXISTS idx_friend_requests_to ON friend_requests(to_id)" },
    { version: 22, sql: "CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(user_id, key)" },
    { version: 23, sql: "ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT ''" },
    { version: 24, sql: "CREATE TABLE IF NOT EXISTS email_verifications (id TEXT PRIMARY KEY, email TEXT NOT NULL, otp TEXT NOT NULL, name TEXT NOT NULL, handle TEXT NOT NULL, phone TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)" },
    { version: 25, sql: "CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email)" },
    { version: 26, sql: `CREATE TABLE IF NOT EXISTS activity_reactions (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, user_id TEXT NOT NULL, emoji TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(activity_id, user_id, emoji))` },
    { version: 27, sql: `CREATE TABLE IF NOT EXISTS activity_comments (id TEXT PRIMARY KEY, activity_id TEXT NOT NULL, user_id TEXT NOT NULL, text TEXT NOT NULL, created_at INTEGER NOT NULL)` },
    { version: 28, sql: "CREATE INDEX IF NOT EXISTS idx_activity_reactions_aid ON activity_reactions(activity_id)" },
    { version: 29, sql: "CREATE INDEX IF NOT EXISTS idx_activity_comments_aid ON activity_comments(activity_id)" },
    { version: 30, sql: `CREATE TABLE IF NOT EXISTS contact_messages (id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'other', message TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at INTEGER NOT NULL)` },
    { version: 31, sql: "CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC)" },
    { version: 32, sql: "ALTER TABLE sessions ADD COLUMN device_info TEXT NOT NULL DEFAULT ''" },
  ];

  for (const migration of migrations) {
    const result = await db.execute({ sql: "SELECT version FROM schema_migrations WHERE version = ?", args: [migration.version] });
    if (!result.rows[0]) {
      try {
        await db.execute(migration.sql);
        await db.execute({ sql: "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", args: [migration.version, Date.now()] });
        log("info", `Migration ${migration.version} applied`);
      } catch (error) {
        log("warn", `Migration ${migration.version} skipped: ${String(error).split("\n")[0]}`);
        await db.execute({ sql: "INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)", args: [migration.version, Date.now()] });
      }
    }
  }
}

async function cleanupExpiredRows() {
  const now = Date.now();
  await db.execute({ sql: "DELETE FROM sessions WHERE expires_at < ?", args: [now] });
  await db.execute({ sql: "DELETE FROM password_resets WHERE expires_at < ?", args: [now] });
  await db.execute({ sql: "DELETE FROM email_verifications WHERE expires_at < ?", args: [now] });
}

// ---- User helpers ----

async function getUserById(userId) {
  return (await db.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [userId] })).rows[0] || null;
}

async function findUserByEmail(email) {
  return (await db.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email] })).rows[0] || null;
}

async function findUserByGoogleId(googleId) {
  return (await db.execute({ sql: "SELECT * FROM users WHERE google_id = ?", args: [googleId] })).rows[0] || null;
}

async function findUserForReset(method, identifier) {
  if (method === "phone") return (await db.execute({ sql: "SELECT * FROM users WHERE phone = ?", args: [identifier] })).rows[0] || null;
  return findUserByEmail(identifier);
}

async function insertUser(user) {
  await db.execute({ sql: "INSERT INTO users (id, handle, name, email, phone, password_hash, provider, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", args: [user.id, user.handle, user.name, user.email, user.phone, user.password_hash, user.provider, user.created_at] });
  if (user.google_id) {
    await db.execute({ sql: "UPDATE users SET google_id = ? WHERE id = ?", args: [user.google_id, user.id] });
  }
}

async function updateUserBasics(userId, values) {
  await db.execute({ sql: "UPDATE users SET name = ?, email = ?, provider = ? WHERE id = ?", args: [values.name, values.email, values.provider, userId] });
}

async function updateUserGoogleId(userId, googleId) {
  await db.execute({ sql: "UPDATE users SET google_id = ? WHERE id = ?", args: [googleId, userId] });
}

function sanitizeUser(user) {
  if (!user) return null;
  return { id: user.id, handle: user.handle, name: user.name, email: user.email, provider: user.provider, createdAt: user.created_at, avatarUrl: user.avatar_url || "" };
}

async function createUserHandle() {
  const result = await db.execute("SELECT handle FROM users");
  const taken = new Set(result.rows.map((row) => row.handle));
  let handle = "";
  do { handle = `mb-${Math.random().toString(36).slice(2, 7)}`; } while (taken.has(handle));
  return handle;
}

async function getAllProfileUserIds() {
  return (await db.execute("SELECT user_id FROM profiles")).rows.map((r) => r.user_id);
}

async function isHandleAvailable(handle, excludeUserId = null) {
  const sql = excludeUserId ? "SELECT id FROM users WHERE handle = ? AND id != ?" : "SELECT id FROM users WHERE handle = ?";
  const args = excludeUserId ? [handle, excludeUserId] : [handle];
  return !(await db.execute({ sql, args })).rows[0];
}

async function findUserByPhone(phone) {
  return (await db.execute({ sql: "SELECT * FROM users WHERE phone = ?", args: [phone] })).rows[0] || null;
}

async function updateUserAvatar(userId, avatarUrl) {
  await db.execute({ sql: "UPDATE users SET avatar_url = ? WHERE id = ?", args: [avatarUrl, userId] });
}

async function updateUserSettings(userId, { name, handle }) {
  await db.execute({ sql: "UPDATE users SET name = ?, handle = ? WHERE id = ?", args: [name, handle, userId] });
}

// ---- Session helpers ----

const MAX_SESSIONS_PER_USER = 3;

async function createSession(userId, deviceInfo = "") {
  const now = Date.now();
  // Enforce per-user device limit: evict oldest sessions beyond the cap
  const existing = (await db.execute({
    sql: "SELECT token FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY created_at ASC",
    args: [userId, now],
  })).rows;
  if (existing.length >= MAX_SESSIONS_PER_USER) {
    const evict = existing.slice(0, existing.length - MAX_SESSIONS_PER_USER + 1);
    for (const s of evict) {
      await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [s.token] });
    }
  }
  const token = crypto.randomBytes(32).toString("hex");
  await db.execute({
    sql: "INSERT INTO sessions (token, user_id, created_at, expires_at, device_info) VALUES (?, ?, ?, ?, ?)",
    args: [token, userId, now, now + sessionLifetimeMs, String(deviceInfo).slice(0, 200)],
  });
  return token;
}

async function getUserSessions(userId) {
  const now = Date.now();
  return (await db.execute({
    sql: "SELECT token, created_at, expires_at, device_info FROM sessions WHERE user_id = ? AND expires_at > ? ORDER BY created_at DESC",
    args: [userId, now],
  })).rows;
}

async function deleteUserSession(token, userId) {
  await db.execute({ sql: "DELETE FROM sessions WHERE token = ? AND user_id = ?", args: [token, userId] });
}

async function getSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.mb_session;
  if (!token) return null;
  const row = (await db.execute({ sql: "SELECT token, user_id, created_at, expires_at FROM sessions WHERE token = ?", args: [token] })).rows[0];
  if (!row) return null;
  const now = Date.now();
  if (Number(row.expires_at) < now) {
    await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
    return null;
  }
  const halfLifeMs = sessionLifetimeMs / 2;
  if (now - Number(row.created_at) > halfLifeMs) {
    const newToken = crypto.randomBytes(32).toString("hex");
    await db.execute({ sql: "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)", args: [newToken, row.user_id, now, now + sessionLifetimeMs] });
    await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [row.token] });
    return { token: newToken, userId: row.user_id, rotated: true };
  }
  return { token: row.token, userId: row.user_id };
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "").split(";").map((p) => p.trim()).filter(Boolean)
    .reduce((acc, part) => {
      const sep = part.indexOf("=");
      if (sep === -1) return acc;
      acc[part.slice(0, sep).trim()] = decodeURIComponent(part.slice(sep + 1).trim());
      return acc;
    }, {});
}

// ---- Profile helpers ----

async function getProfile(userId) {
  const row = (await db.execute({ sql: "SELECT data FROM profiles WHERE user_id = ?", args: [userId] })).rows[0];
  if (!row) {
    const profile = createEmptyProfile();
    await upsertProfile(userId, profile);
    return profile;
  }
  try { return normalizeProfile(JSON.parse(row.data)); }
  catch {
    const profile = createEmptyProfile();
    await upsertProfile(userId, profile);
    return profile;
  }
}

async function upsertProfile(userId, profile) {
  const normalized = normalizeProfile(profile);
  await db.execute({ sql: "INSERT INTO profiles (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at", args: [userId, JSON.stringify(normalized), Date.now()] });
}

function createEmptyProfile() {
  return {
    wishlist: [], liked: [], currentlyWatching: [], releaseReminders: [],
    reminderPreferences: createDefaultReminderPreferences(),
    reminderDeliveryLog: [], pushSubscriptions: [], pushDeliveryLog: [],
    wishlistSaved: true, aiRecommendations: [],
    friendRecommendationInbox: [], sentRecommendations: [], notifications: [],
    incomingRequests: [], outgoingRequests: [], friendIds: [], watched: [],
    friendPrivacy: { showWishlist: true, showLiked: true, showWatched: false },
  };
}

function normalizeProfile(profile) {
  const empty = createEmptyProfile();
  const p = profile && typeof profile === "object" ? profile : {};
  return {
    wishlist: Array.isArray(p.wishlist) ? p.wishlist.map(normalizeMovie).filter(Boolean) : empty.wishlist,
    liked: Array.isArray(p.liked) ? p.liked.map(normalizeMovie).filter(Boolean) : empty.liked,
    currentlyWatching: Array.isArray(p.currentlyWatching) ? p.currentlyWatching.map(normalizeMovie).filter(Boolean) : empty.currentlyWatching,
    releaseReminders: Array.isArray(p.releaseReminders) ? p.releaseReminders.map(normalizeMovie).filter(Boolean) : empty.releaseReminders,
    reminderPreferences: normalizeReminderPreferences(p.reminderPreferences),
    reminderDeliveryLog: Array.isArray(p.reminderDeliveryLog) ? p.reminderDeliveryLog.filter((i) => typeof i === "string").slice(0, 500) : empty.reminderDeliveryLog,
    pushSubscriptions: Array.isArray(p.pushSubscriptions) ? p.pushSubscriptions.map(normalizePushSubscription).filter(Boolean) : empty.pushSubscriptions,
    pushDeliveryLog: Array.isArray(p.pushDeliveryLog) ? p.pushDeliveryLog.filter((i) => typeof i === "string").slice(0, 500) : empty.pushDeliveryLog,
    wishlistSaved: Boolean(p.wishlistSaved),
    aiRecommendations: Array.isArray(p.aiRecommendations) ? p.aiRecommendations.map(normalizeMovie).filter(Boolean) : empty.aiRecommendations,
    friendRecommendationInbox: Array.isArray(p.friendRecommendationInbox) ? p.friendRecommendationInbox : empty.friendRecommendationInbox,
    sentRecommendations: Array.isArray(p.sentRecommendations) ? p.sentRecommendations : empty.sentRecommendations,
    notifications: Array.isArray(p.notifications) ? p.notifications : empty.notifications,
    incomingRequests: Array.isArray(p.incomingRequests) ? p.incomingRequests : empty.incomingRequests,
    outgoingRequests: Array.isArray(p.outgoingRequests) ? p.outgoingRequests : empty.outgoingRequests,
    friendIds: Array.isArray(p.friendIds) ? p.friendIds.filter((i) => typeof i === "string") : empty.friendIds,
    watched: Array.isArray(p.watched) ? p.watched : empty.watched,
    friendPrivacy: {
      showWishlist: p.friendPrivacy?.showWishlist !== false,
      showLiked:    p.friendPrivacy?.showLiked    !== false,
      showWatched:  Boolean(p.friendPrivacy?.showWatched),
    },
  };
}

function mergeProfileForSync(currentProfile, incomingProfile) {
  const current = normalizeProfile(currentProfile);
  const incoming = normalizeProfile(incomingProfile);
  return {
    ...current, ...incoming,
    pushSubscriptions: dedupePushSubscriptions([...(incoming.pushSubscriptions || []), ...(current.pushSubscriptions || [])]),
    aiRecommendations: mergeObjectsById(current.aiRecommendations, incoming.aiRecommendations),
    friendRecommendationInbox: mergeObjectsById(current.friendRecommendationInbox, incoming.friendRecommendationInbox),
    sentRecommendations: mergeObjectsById(current.sentRecommendations, incoming.sentRecommendations),
    notifications: mergeObjectsById(current.notifications, incoming.notifications),
    incomingRequests: mergeObjectsById(current.incomingRequests, incoming.incomingRequests),
    outgoingRequests: mergeObjectsById(current.outgoingRequests, incoming.outgoingRequests),
    friendIds: [...new Set([...(current.friendIds || []), ...(incoming.friendIds || [])])],
    watched: mergeObjectsById(current.watched, incoming.watched),
  };
}

function normalizeMovie(movie) {
  if (!movie || typeof movie !== "object" || typeof movie.id !== "string" || typeof movie.title !== "string") return null;
  return {
    id: movie.id, title: movie.title,
    year: String(movie.year || "Year unknown"),
    type: String(movie.type || "movie"),
    meta: String(movie.meta || ""),
    summary: String(movie.summary || ""),
    poster: String(movie.poster || ""),
    genre: String(movie.genre || ""),
    director: String(movie.director || ""),
    tags: Array.isArray(movie.tags) ? movie.tags.filter((t) => typeof t === "string") : [],
    availabilityLabel: String(movie.availabilityLabel || ""),
    watchUrl: String(movie.watchUrl || ""),
    releaseLabel: String(movie.releaseLabel || ""),
    releaseDate: String(movie.releaseDate || ""),
  };
}

function createDefaultReminderPreferences() {
  return { enabled: true, leadDays: 1, deliveryHour: 9, timezone: "UTC" };
}

function normalizeReminderPreferences(value) {
  const defaults = createDefaultReminderPreferences();
  const input = value && typeof value === "object" ? value : {};
  const leadDays = Number.parseInt(String(input.leadDays ?? defaults.leadDays), 10);
  const deliveryHour = Number.parseInt(String(input.deliveryHour ?? defaults.deliveryHour), 10);
  return {
    enabled: input.enabled !== false,
    leadDays: [0, 1, 3, 7, 14].includes(leadDays) ? leadDays : defaults.leadDays,
    deliveryHour: [0, 6, 9, 12, 18, 21].includes(deliveryHour) ? deliveryHour : defaults.deliveryHour,
    timezone: (String(input.timezone || "").trim()) || defaults.timezone,
  };
}

function normalizePushSubscription(subscription) {
  if (!subscription || typeof subscription !== "object") return null;
  const endpoint = String(subscription.endpoint || "").trim();
  const p256dh = String(subscription.keys?.p256dh || "").trim();
  const auth = String(subscription.keys?.auth || "").trim();
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, expirationTime: subscription.expirationTime == null ? null : Number(subscription.expirationTime), keys: { p256dh, auth } };
}

function dedupePushSubscriptions(subscriptions) {
  return dedupeByKey(subscriptions.map(normalizePushSubscription).filter(Boolean), (i) => i.endpoint);
}

function createNotification(profile, notification) {
  const created = { id: createUniqueId("notification"), createdAt: Date.now(), read: false, ...notification };
  profile.notifications.unshift(created);
  return created;
}

function mergeObjectsById(currentItems, incomingItems) {
  return dedupeByKey([...(incomingItems || []), ...(currentItems || [])], (item) => String(item?.id || item?.movieId || item?.endpoint || JSON.stringify(item)));
}

function dedupeByKey(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---- Auth helpers ----

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [algorithm, salt, originalHash] = String(storedHash || "").split(":");
  if (algorithm !== "scrypt" || !salt || !originalHash) return false;
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(derived, "hex"));
  } catch { return false; }
}

function normalizeEmail(value) { return String(value || "").trim().toLowerCase(); }
function normalizePhone(value) { return String(value || "").replace(/[\s\-().]/g, "").trim(); }
function createUniqueId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

// ---- Reminder helpers ----

function applyScheduledReleaseReminders(profile) {
  if (!profile || typeof profile !== "object") return false;
  const preferences = normalizeReminderPreferences(profile.reminderPreferences);
  const existingLog = Array.isArray(profile.reminderDeliveryLog) ? profile.reminderDeliveryLog.filter((i) => typeof i === "string") : [];
  let changed = profile.reminderPreferences !== preferences || existingLog.length !== (profile.reminderDeliveryLog || []).length;
  profile.reminderPreferences = preferences;
  profile.reminderDeliveryLog = Array.from(new Set(existingLog)).slice(0, 500);
  if (!preferences.enabled || !Array.isArray(profile.releaseReminders) || profile.releaseReminders.length === 0) return changed;

  const currentLocalParts = getTimeZoneDateParts(new Date(), preferences.timezone);
  const currentDateKey = buildDateKey(currentLocalParts.year, currentLocalParts.month, currentLocalParts.day);

  profile.releaseReminders.forEach((movie) => {
    if (!movie?.releaseDate) return;
    const releaseInstant = new Date(movie.releaseDate);
    if (Number.isNaN(releaseInstant.getTime())) return;
    const releaseLocalParts = getTimeZoneDateParts(releaseInstant, preferences.timezone);
    const releaseDateKey = buildDateKey(releaseLocalParts.year, releaseLocalParts.month, releaseLocalParts.day);
    if (currentDateKey > releaseDateKey) return;
    const dueDate = new Date(Date.UTC(releaseLocalParts.year, releaseLocalParts.month - 1, releaseLocalParts.day - preferences.leadDays));
    const dueDateKey = dueDate.toISOString().slice(0, 10);
    const scheduleReached = currentDateKey > dueDateKey || (currentDateKey === dueDateKey && currentLocalParts.hour >= preferences.deliveryHour);
    if (!scheduleReached) return;
    const deliveryKey = `${movie.id}:${movie.releaseDate}:${preferences.leadDays}`;
    if (profile.reminderDeliveryLog.includes(deliveryKey)) return;
    createNotification(profile, { type: "release-reminder-due", title: "Release reminder", message: buildScheduledReminderMessage(movie, preferences.leadDays) });
    profile.reminderDeliveryLog.unshift(deliveryKey);
    profile.reminderDeliveryLog = Array.from(new Set(profile.reminderDeliveryLog)).slice(0, 500);
    changed = true;
  });
  return changed;
}

function buildScheduledReminderMessage(movie, leadDays) {
  const timing = leadDays === 0 ? "releases today" : `releases in ${leadDays} day${leadDays === 1 ? "" : "s"}`;
  const label = String(movie.releaseLabel || "").trim();
  const bookingNote = leadDays <= 1 ? " Keep an eye out for advance bookings!" : " Don't forget to book your tickets early.";
  return `${movie.title} ${timing}.${label ? ` ${label}.` : ""}${bookingNote}`.trim();
}

function getTimeZoneDateParts(date, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false });
    const parts = formatter.formatToParts(date);
    const read = (type) => Number.parseInt(parts.find((p) => p.type === type)?.value || "0", 10) || 0;
    return { year: read("year"), month: read("month"), day: read("day"), hour: read("hour") };
  } catch {
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate(), hour: date.getUTCHours() };
  }
}

function buildDateKey(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ---- User settings helpers ----

async function getUserSetting(userId, key) {
  const row = (await db.execute({ sql: "SELECT value FROM user_settings WHERE user_id = ? AND key = ?", args: [userId, key] })).rows[0];
  return row ? row.value : null;
}

async function setUserSetting(userId, key, value) {
  await db.execute({ sql: "INSERT INTO user_settings (user_id, key, value) VALUES (?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value", args: [userId, key, value] });
}

// ---- Activity feed helpers ----

async function addActivityEvent(userId, type, payload) {
  const id = createUniqueId("activity");
  await db.execute({ sql: "INSERT INTO activity_feed (id, user_id, type, payload, created_at) VALUES (?, ?, ?, ?, ?)", args: [id, userId, type, JSON.stringify(payload), Date.now()] });
}

module.exports = {
  db,
  cleanupExpiredRows, runMigrations,
  getUserById, findUserByEmail, findUserByGoogleId, findUserForReset, findUserByPhone,
  insertUser, updateUserBasics, updateUserGoogleId, sanitizeUser, createUserHandle,
  isHandleAvailable, updateUserAvatar, updateUserSettings,
  getAllProfileUserIds,
  createSession, getSession, getUserSessions, deleteUserSession,
  getProfile, upsertProfile, createEmptyProfile, normalizeProfile, mergeProfileForSync,
  normalizeMovie, createDefaultReminderPreferences, normalizeReminderPreferences,
  normalizePushSubscription, dedupePushSubscriptions,
  createNotification, mergeObjectsById, dedupeByKey,
  hashPassword, verifyPassword, normalizeEmail, normalizePhone, createUniqueId,
  applyScheduledReleaseReminders, buildScheduledReminderMessage, getTimeZoneDateParts, buildDateKey,
  getUserSetting, setUserSetting, addActivityEvent,
};
