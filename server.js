const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { DatabaseSync } = require("node:sqlite");
const webpush = require("web-push");

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const projectRoot = __dirname;
const dataDirectory = path.join(projectRoot, "data");
const databasePath = path.join(dataDirectory, "movie-buddy.sqlite");
const vapidKeyPath = path.join(dataDirectory, "movie-buddy-vapid.json");
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 14;
const resetLifetimeMs = 1000 * 60 * 10;
const reminderSchedulerIntervalMs = Number(process.env.REMINDER_SCHEDULER_INTERVAL_MS || 60_000);
const omdbApiKey = String(process.env.OMDB_API_KEY || "thewdb").trim();
const tmdbApiKey = String(process.env.TMDB_API_KEY || "").trim();
const tmdbRegion = String(process.env.TMDB_REGION || "US").trim().toUpperCase();
const omdbMaxPages = 10;
const catalogSearchCache = createResponseCache(1000 * 60 * 10, 200);
const catalogDetailCache = createResponseCache(1000 * 60 * 60 * 24, 1000);
const catalogPosterCache = createResponseCache(1000 * 60 * 60 * 24, 1000);
const homeDashboardCache = createResponseCache(1000 * 60 * 20, 60);
const tmdbExternalCache = createResponseCache(1000 * 60 * 60 * 24, 1500);
const tmdbDetailCache = createResponseCache(1000 * 60 * 60 * 24, 1500);
const itunesFeedCache = createResponseCache(1000 * 60 * 30, 40);
const tvMazeFeedCache = createResponseCache(1000 * 60 * 20, 40);
const oauthConfig = {
  googleClientId: String(process.env.GOOGLE_CLIENT_ID || "").trim(),
  microsoftClientId: String(process.env.MICROSOFT_CLIENT_ID || "").trim(),
  microsoftAuthority: String(process.env.MICROSOFT_AUTHORITY || "https://login.microsoftonline.com/common").trim(),
  appleClientId: String(process.env.APPLE_CLIENT_ID || "").trim(),
  appleRedirectUri: String(process.env.APPLE_REDIRECT_URI || "").trim(),
};
const vapidKeys = loadVapidKeys();
webpush.setVapidDetails(
  String(process.env.PUSH_VAPID_SUBJECT || "mailto:moviebuddy@example.com").trim(),
  vapidKeys.publicKey,
  vapidKeys.privateKey,
);

const recommendationSeedPool = [
  { id: "rec-1", title: "Decision to Leave", year: "2022", type: "movie", meta: "Mystery, Romance • Park Chan-wook", summary: "A detective investigating a mountain death becomes entangled with the victim's enigmatic widow.", poster: "linear-gradient(135deg, #203239, #607274)", tags: ["mystery", "romance", "thriller", "korean"] },
  { id: "rec-2", title: "Past Lives", year: "2023", type: "movie", meta: "Romance, Drama • Celine Song", summary: "Two childhood friends reconnect across decades and continents in a delicate story about timing and longing.", poster: "linear-gradient(135deg, #b06c49, #2d1e18)", tags: ["romance", "drama", "tender"] },
  { id: "rec-3", title: "Memories of Murder", year: "2003", type: "movie", meta: "Crime, Drama • Bong Joon-ho", summary: "In provincial Korea, detectives chase a serial killer with few clues and little certainty.", poster: "linear-gradient(135deg, #3b2f2f, #0d0a0a)", tags: ["crime", "thriller", "drama", "korean"] },
  { id: "rec-4", title: "Portrait of a Lady on Fire", year: "2019", type: "movie", meta: "Romance, Drama • Celine Sciamma", summary: "A painter and her subject form an intense bond on an isolated island off eighteenth-century France.", poster: "linear-gradient(135deg, #e6a15f, #5a2f1b)", tags: ["romance", "drama", "french", "art"] },
  { id: "rec-5", title: "Shoplifters", year: "2018", type: "movie", meta: "Drama, Crime • Hirokazu Kore-eda", summary: "An unconventional family on the margins survives by petty theft until a fragile arrangement is tested.", poster: "linear-gradient(135deg, #78685d, #2f2a28)", tags: ["drama", "family", "japanese"] },
  { id: "rec-6", title: "Your Name.", year: "2016", type: "movie", meta: "Animation, Fantasy • Makoto Shinkai", summary: "Two teenagers mysteriously swap bodies and form a bond across distance and time.", poster: "linear-gradient(135deg, #5cb7d4, #274156)", tags: ["animation", "fantasy", "romance", "japanese"] },
  { id: "rec-7", title: "The Farewell", year: "2019", type: "movie", meta: "Comedy, Drama • Lulu Wang", summary: "A Chinese-American writer returns to Changchun under the guise of a family wedding to say goodbye to her grandmother.", poster: "linear-gradient(135deg, #f0bf72, #6c4d2c)", tags: ["drama", "comedy", "family"] },
  { id: "rec-8", title: "The Secret in Their Eyes", year: "2009", type: "movie", meta: "Mystery, Drama • Juan Jose Campanella", summary: "A retired legal counselor revisits an unresolved murder case and the feelings it never left behind.", poster: "linear-gradient(135deg, #4f566b, #221f29)", tags: ["mystery", "drama", "crime", "spanish"] },
  { id: "rec-9", title: "RRR", year: "2022", type: "movie", meta: "Action, Drama • S. S. Rajamouli", summary: "Two revolutionaries forge a legendary friendship in a maximalist, high-energy anti-colonial epic.", poster: "linear-gradient(135deg, #c26a38, #4b1f10)", tags: ["action", "drama", "indian", "epic"] },
  { id: "rec-10", title: "Perfect Days", year: "2023", type: "movie", meta: "Drama • Wim Wenders", summary: "A Tokyo toilet cleaner finds deep meaning in routine, music, and moments of quiet observation.", poster: "linear-gradient(135deg, #708c7f, #29352f)", tags: ["drama", "quiet", "japanese"] },
  { id: "rec-11", title: "Burning", year: "2018", type: "movie", meta: "Mystery, Drama • Lee Chang-dong", summary: "A young man becomes obsessed with a wealthy stranger whose stories may hide something sinister.", poster: "linear-gradient(135deg, #d27b52, #281211)", tags: ["mystery", "thriller", "drama", "korean"] },
  { id: "rec-12", title: "The Banshees of Inisherin", year: "2022", type: "movie", meta: "Comedy, Drama • Martin McDonagh", summary: "An abruptly ended friendship spirals into absurd and painful consequences on a remote Irish island.", poster: "linear-gradient(135deg, #a9996a, #2d2617)", tags: ["drama", "comedy", "friendship"] },
  { id: "rec-13", title: "Drive My Car", year: "2021", type: "movie", meta: "Drama • Ryusuke Hamaguchi", summary: "A theater director processes grief and connection while staging Uncle Vanya in Hiroshima.", poster: "linear-gradient(135deg, #b53c35, #241312)", tags: ["drama", "japanese", "quiet"] },
  { id: "rec-14", title: "Minari", year: "2020", type: "movie", meta: "Drama • Lee Isaac Chung", summary: "A Korean-American family pursues a fragile dream while trying to grow roots in rural Arkansas.", poster: "linear-gradient(135deg, #9ea564, #36402c)", tags: ["drama", "family", "korean"] },
  { id: "rec-15", title: "Dil Se..", year: "1998", type: "movie", meta: "Romance, Thriller • Mani Ratnam", summary: "A radio journalist falls for a mysterious woman in a love story shadowed by politics and violence.", poster: "linear-gradient(135deg, #aa3a3a, #290f18)", tags: ["romance", "thriller", "indian"] },
  { id: "rec-16", title: "Amores Perros", year: "2000", type: "movie", meta: "Drama, Thriller • Alejandro Gonzalez Inarritu", summary: "Three stories collide in Mexico City after a brutal car crash changes each life forever.", poster: "linear-gradient(135deg, #6b5047, #14100f)", tags: ["drama", "thriller", "spanish"] },
  { id: "rec-17", title: "Monster", year: "2023", type: "movie", meta: "Drama, Mystery • Hirokazu Kore-eda", summary: "A school incident is retold from different perspectives until a more fragile truth appears.", poster: "linear-gradient(135deg, #7c809b, #252837)", tags: ["drama", "mystery", "japanese"] },
  { id: "rec-18", title: "The Worst Person in the World", year: "2021", type: "movie", meta: "Romance, Comedy • Joachim Trier", summary: "A young woman's relationships and ambitions unfold in sharply observed chapters of uncertainty.", poster: "linear-gradient(135deg, #e1a26c, #493022)", tags: ["romance", "comedy", "drama"] },
];

fs.mkdirSync(dataDirectory, { recursive: true });

const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    handle TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL DEFAULT '',
    password_hash TEXT NOT NULL,
    provider TEXT NOT NULL DEFAULT 'password',
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS password_resets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    identifier TEXT NOT NULL,
    otp TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

cleanupExpiredRows();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

    if (url.pathname.startsWith("/api/")) {
      await handleApiRequest(request, response, url);
      return;
    }

    serveStaticAsset(response, url.pathname);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal server error." });
  }
});

server.listen(port, host, () => {
  console.log(`Movie Buddy running on http://${host}:${port}`);
  startBackgroundReminderScheduler();
});

async function handleApiRequest(request, response, url) {
  const session = getSession(request);

  if (request.method === "GET" && url.pathname === "/api/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/session") {
    if (!session) {
      sendJson(response, 200, { user: null });
      return;
    }

    sendJson(response, 200, buildAppState(session.userId));
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/providers") {
    sendJson(response, 200, buildProviderConfig());
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/push/public-key") {
    sendJson(response, 200, { publicKey: vapidKeys.publicKey });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/signup") {
    const body = await readJsonBody(request);
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);
    const phone = normalizePhone(body?.phone);
    const password = String(body?.password || "");

    if (!name || !email || password.length < 6) {
      sendJson(response, 400, { error: "Enter a name, valid email, and a password with at least 6 characters." });
      return;
    }

    if (findUserByEmail(email)) {
      sendJson(response, 409, { error: "An account with this email already exists." });
      return;
    }

    const user = {
      id: createUniqueId("user"),
      handle: createUserHandle(),
      name,
      email,
      phone,
      password_hash: hashPassword(password),
      provider: "password",
      created_at: Date.now(),
    };

    insertUser(user);
    upsertProfile(user.id, createEmptyProfile());
    sendJson(response, 201, { ok: true, message: "Account created. Please log in to continue." });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await readJsonBody(request);
    const email = normalizeEmail(body?.email);
    const password = String(body?.password || "");
    const user = findUserByEmail(email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      sendJson(response, 401, { error: "Incorrect email or password." });
      return;
    }

    const token = createSession(user.id);
    setSessionCookie(response, token);
    sendJson(response, 200, buildAppState(user.id));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/oauth") {
    const body = await readJsonBody(request);
    const provider = String(body?.provider || "").trim().toLowerCase();
    const providerId = String(body?.providerId || "").trim();
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);

    if (!["google", "microsoft", "apple"].includes(provider) || !providerId || !name || !email) {
      sendJson(response, 400, { error: "Provider authentication payload was incomplete." });
      return;
    }

    let user = findUserByEmail(email);
    if (!user) {
      user = {
        id: `social-${provider}-${providerId.replace(/[^a-z0-9-]/gi, "-")}`,
        handle: createUserHandle(),
        name,
        email,
        phone: "",
        password_hash: hashPassword(`${provider}:${providerId}:${email}`),
        provider,
        created_at: Date.now(),
      };
      insertUser(user);
      upsertProfile(user.id, createEmptyProfile());
    } else {
      updateUserBasics(user.id, { name, email, provider });
    }

    const token = createSession(user.id);
    setSessionCookie(response, token);
    sendJson(response, 200, buildAppState(user.id));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    if (session) {
      db.prepare("DELETE FROM sessions WHERE token = ?").run(session.token);
    }
    clearSessionCookie(response);
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/reset/request") {
    const body = await readJsonBody(request);
    const method = String(body?.method || "email").trim() === "phone" ? "phone" : "email";
    const identifier = method === "email" ? normalizeEmail(body?.identifier) : normalizePhone(body?.identifier);

    if (!identifier) {
      sendJson(response, 400, { error: `Enter your ${method === "email" ? "email" : "phone number"} first.` });
      return;
    }

    const user = findUserForReset(method, identifier);
    if (!user) {
      sendJson(response, 404, { error: `No account found for that ${method}.` });
      return;
    }

    const resetId = createUniqueId("reset");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const createdAt = Date.now();
    db.prepare("DELETE FROM password_resets WHERE user_id = ?").run(user.id);
    db.prepare(`INSERT INTO password_resets (id, user_id, identifier, otp, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(resetId, user.id, identifier, otp, createdAt, createdAt + resetLifetimeMs);

    sendJson(response, 200, {
      ok: true,
      resetId,
      previewOtp: otp,
      message: `Dev OTP generated for ${method}. Hook up SMTP or SMS delivery before launch.`,
    });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/reset/confirm") {
    const body = await readJsonBody(request);
    const resetId = String(body?.resetId || "").trim();
    const otp = String(body?.otp || "").trim();
    const password = String(body?.password || "");

    if (!resetId || !otp) {
      sendJson(response, 400, { error: "Send an OTP before trying to reset the password." });
      return;
    }

    if (password.length < 6) {
      sendJson(response, 400, { error: "Use a password with at least 6 characters." });
      return;
    }

    const resetRow = db.prepare("SELECT * FROM password_resets WHERE id = ?").get(resetId);
    if (!resetRow || resetRow.expires_at < Date.now()) {
      sendJson(response, 400, { error: "Reset session expired. Try sending OTP again." });
      return;
    }

    if (resetRow.otp !== otp) {
      sendJson(response, 400, { error: "Incorrect OTP. Use the latest code shown above." });
      return;
    }

    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), resetRow.user_id);
    db.prepare("DELETE FROM password_resets WHERE id = ?").run(resetId);
    sendJson(response, 200, { ok: true, message: "Password updated. Login with your new password." });
    return;
  }

  const userId = requireSession(response, session);
  if (!userId) {
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/catalog/search") {
    const query = String(url.searchParams.get("q") || "").trim();
    if (!query) {
      sendJson(response, 200, { titles: [] });
      return;
    }

    const titles = await searchCatalogTitles(query);
    sendJson(response, 200, { titles });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/home/dashboard") {
    const dashboard = await buildHomeDashboard(userId, tmdbRegion);
    sendJson(response, 200, { dashboard });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/users/search") {
    const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
    if (!query) {
      sendJson(response, 200, { users: [] });
      return;
    }

    const statement = db.prepare(`
      SELECT id, handle, name, email, provider, created_at
      FROM users
      WHERE id != ?
        AND (LOWER(name) LIKE ? OR LOWER(handle) LIKE ? OR LOWER(id) LIKE ?)
      ORDER BY name ASC
      LIMIT 20
    `);

    const pattern = `%${query}%`;
    const users = statement.all(userId, pattern, pattern, pattern).map(sanitizeUser);
    sendJson(response, 200, { users });
    return;
  }

  if (request.method === "PUT" && url.pathname === "/api/profile") {
    const body = await readJsonBody(request);
    const profile = mergeProfileForSync(getProfile(userId), normalizeProfile(body?.profile));
    upsertProfile(userId, profile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/push/subscribe") {
    const body = await readJsonBody(request);
    const subscription = normalizePushSubscription(body?.subscription);
    if (!subscription) {
      sendJson(response, 400, { error: "Push subscription payload was invalid." });
      return;
    }

    const profile = getProfile(userId);
    profile.pushSubscriptions = dedupePushSubscriptions([subscription, ...profile.pushSubscriptions]);
    upsertProfile(userId, profile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/push/unsubscribe") {
    const body = await readJsonBody(request);
    const endpoint = String(body?.endpoint || "").trim();
    const profile = getProfile(userId);
    profile.pushSubscriptions = profile.pushSubscriptions.filter((item) => item.endpoint !== endpoint);
    upsertProfile(userId, profile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/friends/request") {
    const body = await readJsonBody(request);
    const targetUserId = String(body?.targetUserId || "").trim();
    const sender = getUserById(userId);
    const target = getUserById(targetUserId);
    if (!sender || !target || targetUserId === userId) {
      sendJson(response, 400, { error: "Unable to send that friend request." });
      return;
    }

    const senderProfile = getProfile(userId);
    const targetProfile = getProfile(targetUserId);
    if (senderProfile.friendIds.includes(targetUserId) || senderProfile.outgoingRequests.some((item) => item.toUserId === targetUserId)) {
      sendJson(response, 200, buildAppState(userId));
      return;
    }

    const requestItem = {
      id: createUniqueId("friend-request"),
      fromUserId: sender.id,
      fromUserName: sender.name,
      fromUserHandle: sender.handle,
      toUserId: target.id,
      createdAt: Date.now(),
    };

    senderProfile.outgoingRequests.unshift(requestItem);
    targetProfile.incomingRequests.unshift(requestItem);
    createNotification(targetProfile, {
      type: "friend-request",
      title: "New friend request",
      message: `${sender.name} sent you a friend request. Accept it to start exchanging movie recommendations.`,
    });
    upsertProfile(userId, senderProfile);
    upsertProfile(targetUserId, targetProfile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/friends/respond") {
    const body = await readJsonBody(request);
    const requestId = String(body?.requestId || "").trim();
    const accept = Boolean(body?.accept);
    const currentUser = getUserById(userId);
    const currentProfile = getProfile(userId);
    const requestItem = currentProfile.incomingRequests.find((item) => item.id === requestId);
    if (!currentUser || !requestItem) {
      sendJson(response, 400, { error: "Unable to update that friend request." });
      return;
    }

    currentProfile.incomingRequests = currentProfile.incomingRequests.filter((item) => item.id !== requestId);
    const senderProfile = getProfile(requestItem.fromUserId);
    senderProfile.outgoingRequests = senderProfile.outgoingRequests.filter((item) => item.id !== requestId);

    if (accept) {
      if (!currentProfile.friendIds.includes(requestItem.fromUserId)) {
        currentProfile.friendIds.unshift(requestItem.fromUserId);
      }
      if (!senderProfile.friendIds.includes(userId)) {
        senderProfile.friendIds.unshift(userId);
      }
    }

    createNotification(senderProfile, {
      type: accept ? "friend-request-accepted" : "friend-request-rejected",
      title: accept ? "Friend request accepted" : "Friend request declined",
      message: accept
        ? `${currentUser.name} accepted your friend request. You can now recommend movies to each other.`
        : `${currentUser.name} declined your friend request.`,
    });

    upsertProfile(userId, currentProfile);
    upsertProfile(requestItem.fromUserId, senderProfile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/recommendations/send") {
    const body = await readJsonBody(request);
    const recipientId = String(body?.toUserId || "").trim();
    const note = String(body?.note || "").trim();
    const movie = normalizeMovie(body?.movie);
    const sender = getUserById(userId);
    const recipient = getUserById(recipientId);
    if (!sender || !recipient || !movie) {
      sendJson(response, 400, { error: "Unable to send that recommendation." });
      return;
    }

    const senderProfile = getProfile(userId);
    const recipientProfile = getProfile(recipientId);
    const recommendation = {
      id: createUniqueId("friend-rec"),
      movie,
      fromUserId: sender.id,
      fromUserName: sender.name,
      fromUserHandle: sender.handle,
      toUserId: recipient.id,
      toUserName: recipient.name,
      note,
      status: "sent",
      createdAt: Date.now(),
    };

    recipientProfile.friendRecommendationInbox.unshift(recommendation);
    senderProfile.sentRecommendations.unshift(recommendation);
    createNotification(recipientProfile, {
      type: "friend-recommendation",
      title: "New recommendation",
      message: `${sender.name} recommended ${movie.title} to you${note ? `: ${note}` : "."}`,
    });
    createNotification(senderProfile, {
      type: "system",
      title: "Recommendation sent",
      message: `${movie.title} was sent to ${recipient.name}. You will be notified if they start watching it.`,
    });

    upsertProfile(userId, senderProfile);
    upsertProfile(recipientId, recipientProfile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/recommendations/watched") {
    const body = await readJsonBody(request);
    const recommendationId = String(body?.recommendationId || "").trim();
    const review = String(body?.review || "").trim();
    const currentUser = getUserById(userId);
    const currentProfile = getProfile(userId);
    const recommendation = currentProfile.friendRecommendationInbox.find((item) => item.id === recommendationId);
    if (!currentUser || !recommendation) {
      sendJson(response, 400, { error: "Unable to update watched status for that recommendation." });
      return;
    }

    if (!currentProfile.watched.some((item) => item.movieId === recommendation.movie.id)) {
      currentProfile.watched.unshift({
        id: createUniqueId("watched"),
        movieId: recommendation.movie.id,
        title: recommendation.movie.title,
        source: "friend",
        fromUserId: recommendation.fromUserId,
        fromUserName: recommendation.fromUserName,
        review,
        watchedAt: Date.now(),
      });
    }

    recommendation.status = "watched";
    recommendation.review = review;
    recommendation.watchedAt = Date.now();

    const senderProfile = getProfile(recommendation.fromUserId);
    const senderEntry = senderProfile.sentRecommendations.find((item) => item.id === recommendationId);
    if (senderEntry) {
      senderEntry.status = "watched";
      senderEntry.review = review;
      senderEntry.watchedAt = recommendation.watchedAt;
    }

    createNotification(senderProfile, {
      type: "recommendation-watched",
      title: "Recommendation update",
      message: review
        ? `${currentUser.name} watched ${recommendation.movie.title} and shared a review: "${review}"`
        : `${currentUser.name} marked ${recommendation.movie.title} as watched.`,
    });

    upsertProfile(userId, currentProfile);
    upsertProfile(recommendation.fromUserId, senderProfile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/recommendations/refresh") {
    const profile = getProfile(userId);
    createNotification(profile, {
      type: "system",
      title: "Recommendations refreshed",
      message: profile.liked.length > 0
        ? "Movie Buddy recalculated your recommendation set using your liked titles, watched history, and friend overlap."
        : "AI picks stay empty until you like a few titles. Wishlist items alone no longer drive recommendations.",
    });
    upsertProfile(userId, profile);
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/notifications/read") {
    const body = await readJsonBody(request);
    const notificationId = String(body?.notificationId || "").trim();
    const profile = getProfile(userId);
    const notification = profile.notifications.find((item) => item.id === notificationId);
    if (notification) {
      notification.read = true;
      upsertProfile(userId, profile);
    }
    sendJson(response, 200, buildAppState(userId));
    return;
  }

  sendJson(response, 404, { error: "Not found." });
}

function serveStaticAsset(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
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
  response.writeHead(200, { "Content-Type": contentTypes[extension] || "application/octet-stream" });
  response.end(fs.readFileSync(finalPath));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large."));
      }
    });
    request.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Invalid JSON body."));
      }
    });
    request.on("error", reject);
  });
}

function parseCookies(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((accumulator, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      accumulator[key] = decodeURIComponent(value);
      return accumulator;
    }, {});
}

function getSession(request) {
  const cookies = parseCookies(request.headers.cookie);
  const token = cookies.mb_session;
  if (!token) {
    return null;
  }

  const row = db.prepare("SELECT token, user_id, expires_at FROM sessions WHERE token = ?").get(token);
  if (!row) {
    return null;
  }

  if (row.expires_at < Date.now()) {
    db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
    return null;
  }

  return { token: row.token, userId: row.user_id };
}

function requireSession(response, session) {
  if (!session) {
    sendJson(response, 401, { error: "Session expired. Please log in again." });
    return null;
  }
  return session.userId;
}

function setSessionCookie(response, token) {
  response.setHeader("Set-Cookie", `mb_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionLifetimeMs / 1000)}`);
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", "mb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = Date.now();
  db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .run(token, userId, createdAt, createdAt + sessionLifetimeMs);
  return token;
}

function buildAppState(userId) {
  const user = sanitizeUser(getUserById(userId));
  const storedProfile = getProfile(userId);
  const reminderUpdatesApplied = applyScheduledReleaseReminders(storedProfile);
  if (reminderUpdatesApplied) {
    upsertProfile(userId, storedProfile);
  }
  const profile = withComputedRecommendations(storedProfile, userId);
  const relatedIds = new Set(profile.friendIds);
  profile.incomingRequests.forEach((item) => relatedIds.add(item.fromUserId));
  profile.outgoingRequests.forEach((item) => relatedIds.add(item.toUserId));
  profile.friendRecommendationInbox.forEach((item) => relatedIds.add(item.fromUserId));
  profile.sentRecommendations.forEach((item) => relatedIds.add(item.toUserId));
  const relatedUsers = [...relatedIds].map(getUserById).filter(Boolean).map(sanitizeUser);
  return { user, profile, relatedUsers };
}

function buildProviderConfig() {
  return {
    providers: {
      google: {
        configured: Boolean(oauthConfig.googleClientId),
        clientId: oauthConfig.googleClientId,
      },
      microsoft: {
        configured: Boolean(oauthConfig.microsoftClientId),
        clientId: oauthConfig.microsoftClientId,
        authority: oauthConfig.microsoftAuthority,
      },
      apple: {
        configured: Boolean(oauthConfig.appleClientId && oauthConfig.appleRedirectUri),
        clientId: oauthConfig.appleClientId,
        redirectUri: oauthConfig.appleRedirectUri,
      },
    },
  };
}

async function searchCatalogTitles(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return readThroughCache(catalogSearchCache, normalizedQuery, async () => {
    const [imdbResults, omdbResults] = await Promise.all([
      fetchImdbSearchResults(normalizedQuery),
      fetchOmdbSearchResults(normalizedQuery),
    ]);

    const mergedResults = dedupeCatalogResultsById([...imdbResults, ...omdbResults]).slice(0, 24);
    const enrichedResults = await Promise.all(mergedResults.map((item) => buildCatalogSearchResult(item)));
    return enrichedResults.sort(compareCatalogTitlesForQuery(normalizedQuery));
  });
}

async function buildCatalogSearchResult(item) {
  const [details, poster] = await Promise.all([
    fetchCatalogDetails(item.id),
    resolveCatalogPoster(item),
  ]);
  const type = normalizeCatalogType(details?.Type || item.type);
  const genre = sanitizeString(details?.Genre);
  const creator = type === "series" ? sanitizeString(details?.Writer) : sanitizeString(details?.Director);
  const metaParts = [genre, creator].filter(Boolean).slice(0, 2);
  const liveEnhancement = await resolveLiveTitleEnhancement({
    imdbId: item.id,
    title: item.title,
    year: item.year,
    type,
    poster,
    summary: sanitizeString(details?.Plot) || item.summary,
    genre,
    director: creator,
  });

  return {
    id: liveEnhancement.id || item.id,
    title: liveEnhancement.title || item.title,
    year: String(liveEnhancement.year || item.year || details?.Year || "Year unknown"),
    type: liveEnhancement.type || type,
    meta: liveEnhancement.meta || metaParts.join(" • ") || item.meta || item.id,
    summary: liveEnhancement.summary || sanitizeString(details?.Plot) || item.summary || "No description available for this title yet.",
    poster: liveEnhancement.poster || poster,
    genre: liveEnhancement.genre || genre,
    director: liveEnhancement.director || creator,
    tags: liveEnhancement.tags || buildCatalogTags(genre, item.title),
    popularityScore: calculateCatalogPopularity(details, item.rank),
    availabilityLabel: liveEnhancement.availabilityLabel || "Search OTT",
    watchUrl: liveEnhancement.watchUrl || buildJustWatchSearchUrl(item.title),
    releaseLabel: liveEnhancement.releaseLabel || "",
    releaseDate: liveEnhancement.releaseDate || "",
  };
}

async function fetchImdbSearchResults(query) {
  const bucket = encodeURIComponent(query[0] || "a");
  const response = await fetch(`https://v3.sg.media-imdb.com/suggestion/${bucket}/${encodeURIComponent(query)}.json`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload?.d)) {
    return [];
  }

  return payload.d
    .filter(isSearchableImdbEntry)
    .map((entry) => ({
      id: entry.id,
      title: String(entry.l || "").trim(),
      year: String(entry.y || ""),
      type: normalizeCatalogType(entry.qid || entry.q),
      meta: sanitizeString(entry.s),
      summary: "",
      poster: normalizePosterUrl(entry.i?.imageUrl),
      rank: Number(entry.rank || 0),
    }));
}

async function fetchOmdbSearchResults(query) {
  if (!omdbApiKey) {
    return [];
  }

  const firstPageResponse = await fetch(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&s=${encodeURIComponent(query)}&page=1`);
  const firstPagePayload = await firstPageResponse.json().catch(() => ({}));
  if (!firstPageResponse.ok || firstPagePayload?.Response === "False") {
    return [];
  }

  const totalResults = Number.parseInt(String(firstPagePayload.totalResults || "0"), 10) || 0;
  const totalPages = Math.min(omdbMaxPages, Math.max(1, Math.ceil(totalResults / 10)));
  const extraPages = await Promise.all(Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
    const page = index + 2;
    return fetch(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&s=${encodeURIComponent(query)}&page=${page}`)
      .then((response) => response.json().catch(() => ({ Response: "False" })));
  }));

  return dedupeCatalogResultsById([
    ...(firstPagePayload.Search || []),
    ...extraPages.flatMap((payload) => payload?.Response === "True" ? payload.Search || [] : []),
  ].map((entry) => ({
    id: entry.imdbID,
    title: String(entry.Title || "").trim(),
    year: String(entry.Year || ""),
    type: normalizeCatalogType(entry.Type),
    meta: "",
    summary: "",
    poster: normalizePosterUrl(entry.Poster),
    rank: 0,
  })));
}

async function fetchCatalogDetails(imdbId) {
  if (!omdbApiKey || !imdbId) {
    return null;
  }

  return readThroughCache(catalogDetailCache, imdbId, async () => {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&i=${encodeURIComponent(imdbId)}&plot=short`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.Response === "False") {
      return null;
    }
    return payload;
  });
}

async function resolveCatalogPoster(item) {
  const directPoster = normalizePosterUrl(item.details?.Poster || item.poster);
  if (directPoster) {
    return directPoster;
  }

  const cacheKey = `${normalizeSearchText(item.title)}:${String(item.year || "")}:${item.type}`;
  return readThroughCache(catalogPosterCache, cacheKey, async () => {
    const posterLoaders = item.type === "series"
      ? [
        () => fetchTvMazePoster(item.title, item.year),
        () => fetchItunesPoster(item.title, item.year),
      ]
      : [
        () => fetchItunesPoster(item.title, item.year),
        () => fetchTvMazePoster(item.title, item.year),
      ];

    return pickFastestCatalogPoster(posterLoaders);
  });
}

async function pickFastestCatalogPoster(loaders) {
  const posterTasks = loaders.map((loadPoster) => Promise.resolve()
    .then(loadPoster)
    .then((posterUrl) => {
      const normalizedPoster = normalizePosterUrl(posterUrl);
      if (!normalizedPoster) {
        throw new Error("Poster unavailable");
      }
      return normalizedPoster;
    }));

  try {
    return await Promise.any(posterTasks);
  } catch {
    return "";
  }
}

async function fetchItunesPoster(title, year) {
  const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&entity=movie&limit=8`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload?.results)) {
    return "";
  }

  const match = pickBestPosterCandidate(payload.results.map((item) => ({
    title: item.trackName,
    year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : "",
    poster: item.artworkUrl100 ? item.artworkUrl100.replace(/100x100bb/g, "600x600bb") : "",
  })), title, year);
  return normalizePosterUrl(match?.poster);
}

async function fetchTvMazePoster(title, year) {
  const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
  const payload = await response.json().catch(() => ([]));
  if (!response.ok || !Array.isArray(payload)) {
    return "";
  }

  const match = pickBestPosterCandidate(payload.map((item) => ({
    title: item.show?.name,
    year: item.show?.premiered ? new Date(item.show.premiered).getFullYear() : "",
    poster: item.show?.image?.original || item.show?.image?.medium || "",
  })), title, year);
  return normalizePosterUrl(match?.poster);
}

function pickBestPosterCandidate(candidates, title, year) {
  const normalizedTitle = normalizeSearchText(title);
  const targetYear = Number.parseInt(String(year || "0"), 10) || 0;

  return candidates
    .filter((candidate) => normalizePosterUrl(candidate.poster))
    .map((candidate) => {
      const candidateTitle = normalizeSearchText(candidate.title);
      const titleScore = scoreCatalogSearchTerm(candidateTitle, normalizedTitle, 1000);
      const yearScore = targetYear && Number(candidate.year) === targetYear ? 120 : 0;
      return { ...candidate, score: titleScore + yearScore };
    })
    .sort((left, right) => right.score - left.score)[0] || null;
}

function compareCatalogTitles(left, right) {
  const popularityDelta = (right.popularityScore || 0) - (left.popularityScore || 0);
  if (popularityDelta !== 0) {
    return popularityDelta;
  }

  const yearDelta = Number.parseInt(String(right.year || "0"), 10) - Number.parseInt(String(left.year || "0"), 10);
  if (!Number.isNaN(yearDelta) && yearDelta !== 0) {
    return yearDelta;
  }

  return String(left.title || "").localeCompare(String(right.title || ""));
}

function tokenizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function calculateCatalogResultSearchScore(movie, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return 0;
  }

  const normalizedTitle = normalizeSearchText(movie.title);
  const titleWords = tokenizeSearchText(movie.title);
  const shortQuery = normalizedQuery.length <= 3;
  const titleScore = scoreCatalogSearchTerm(normalizedTitle, normalizedQuery, 2200);
  const wordScore = Math.max(...titleWords.map((word) => scoreCatalogSearchTerm(word, normalizedQuery, 1900)), 0);
  const metaScore = shortQuery ? 0 : scoreCatalogSearchTerm(normalizeSearchText(movie.meta), normalizedQuery, 700);
  const tagScore = shortQuery
    ? 0
    : Math.max(...(Array.isArray(movie.tags) ? movie.tags : []).map((tag) => scoreCatalogSearchTerm(normalizeSearchText(tag), normalizedQuery, 900)), 0);
  const prefixBonus = normalizedTitle.startsWith(normalizedQuery)
    ? 1200
    : titleWords.some((word) => word.startsWith(normalizedQuery))
      ? 900
      : 0;
  const bestScore = Math.max(titleScore, wordScore, metaScore, tagScore);
  if (bestScore === 0) {
    return 0;
  }

  return bestScore + prefixBonus + Math.min(400, (movie.popularityScore || 0) / 50000);
}

function compareCatalogTitlesForQuery(query) {
  return (left, right) => {
    const matchDelta = calculateCatalogResultSearchScore(right, query) - calculateCatalogResultSearchScore(left, query);
    if (matchDelta !== 0) {
      return matchDelta;
    }

    return compareCatalogTitles(left, right);
  };
}

function calculateCatalogPopularity(details, imdbRank) {
  const voteCount = Number.parseInt(String(details?.imdbVotes || "0").replace(/,/g, ""), 10) || 0;
  const imdbRating = Number.parseFloat(String(details?.imdbRating || "0")) || 0;
  const metascore = Number.parseInt(String(details?.Metascore || "0"), 10) || 0;
  const rankBoost = imdbRank > 0 ? Math.max(0, 1_000_000 - imdbRank) : 0;
  return voteCount + (imdbRating * 100000) + (metascore * 1000) + rankBoost;
}

function buildCatalogTags(genre, title) {
  const genreTags = genre ? genre.split(",").map((item) => item.trim().toLowerCase()) : [];
  const titleTags = String(title || "").toLowerCase().split(/\s+/).filter((word) => word.length > 3).slice(0, 3);
  return [...new Set([...genreTags, ...titleTags])];
}

function normalizeCatalogType(value) {
  const type = String(value || "").toLowerCase();
  if (type.includes("series")) {
    return "series";
  }
  return "movie";
}

function isSearchableImdbEntry(entry) {
  if (!entry || typeof entry.id !== "string" || !entry.id.startsWith("tt") || !entry.l) {
    return false;
  }

  const qid = String(entry.qid || "").toLowerCase();
  return ["movie", "tvseries", "tvminiseries", "tvmovie"].includes(qid);
}

function dedupeCatalogResultsById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.id;
    if (!id || seen.has(id)) {
      return false;
    }
    seen.add(id);
    return true;
  });
}

function sanitizeString(value) {
  const nextValue = String(value || "").trim();
  return nextValue && nextValue !== "N/A" ? nextValue : "";
}

function normalizePosterUrl(value) {
  const poster = String(value || "").trim();
  if (!poster || !poster.startsWith("http")) {
    return "";
  }
  return poster.replace(/^http:\/\//i, "https://");
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function scoreCatalogSearchTerm(candidate, query, baseScore) {
  if (!candidate || !query) {
    return 0;
  }
  if (candidate === query) {
    return baseScore + 400;
  }
  if (candidate.startsWith(query)) {
    return baseScore + 260 - Math.max(0, candidate.length - query.length);
  }
  if (candidate.includes(query)) {
    return baseScore + 160;
  }
  return 0;
}

function createResponseCache(ttlMs, maxEntries) {
  return {
    ttlMs,
    maxEntries,
    values: new Map(),
    inflight: new Map(),
  };
}

async function readThroughCache(cache, key, loader) {
  const cachedValue = cache.values.get(key);
  if (cachedValue && cachedValue.expiresAt > Date.now()) {
    return cachedValue.value;
  }

  if (cache.inflight.has(key)) {
    return cache.inflight.get(key);
  }

  const pending = Promise.resolve()
    .then(loader)
    .then((value) => {
      cache.values.set(key, { value, expiresAt: Date.now() + cache.ttlMs });
      cache.inflight.delete(key);
      pruneResponseCache(cache);
      return value;
    })
    .catch((error) => {
      cache.inflight.delete(key);
      throw error;
    });

  cache.inflight.set(key, pending);
  return pending;
}

function pruneResponseCache(cache) {
  while (cache.values.size > cache.maxEntries) {
    const oldestKey = cache.values.keys().next().value;
    cache.values.delete(oldestKey);
  }
}

function withComputedRecommendations(profile, userId) {
  return {
    ...profile,
    aiRecommendations: buildServerAiRecommendations(profile, userId),
  };
}

function buildServerAiRecommendations(profile, userId) {
  if (!Array.isArray(profile?.liked) || profile.liked.length === 0) {
    return [];
  }

  const tasteSignals = collectServerTasteSignals(profile, userId);
  const watchedIds = new Set((profile.watched || []).map((item) => item.movieId));
  const wishlistIds = new Set((profile.wishlist || []).map((item) => item.id));
  const likedIds = new Set((profile.liked || []).map((item) => item.id));
  const watchingIds = new Set((profile.currentlyWatching || []).map((item) => item.id));

  return recommendationSeedPool
    .filter((movie) => !watchedIds.has(movie.id) && !wishlistIds.has(movie.id) && !likedIds.has(movie.id) && !watchingIds.has(movie.id))
    .map((movie) => ({
      movie: {
        ...movie,
        availabilityLabel: "Search OTT",
        watchUrl: buildJustWatchSearchUrl(movie.title),
        releaseLabel: "",
      },
      score: (movie.tags || []).reduce((total, tag) => total + (tasteSignals.get(tag) || 0), 0),
    }))
    .sort((left, right) => right.score - left.score || left.movie.title.localeCompare(right.movie.title))
    .slice(0, 8)
    .map((entry) => entry.movie);
}

function collectServerTasteSignals(profile, userId) {
  const counts = new Map();
  (profile.liked || []).forEach((movie) => {
    (movie.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 3);
    });
  });

  (profile.watched || []).forEach((item) => {
    const watchedMovie = [...(profile.liked || []), ...(profile.wishlist || [])].find((movie) => movie.id === item.movieId);
    (watchedMovie?.tags || []).forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  (profile.friendIds || []).forEach((friendId) => {
    const friendProfile = getProfile(friendId);
    (friendProfile.liked || []).forEach((movie) => {
      (movie.tags || []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    (friendProfile.sentRecommendations || []).forEach((item) => {
      if (item.toUserId === userId) {
        (item.movie?.tags || []).forEach((tag) => {
          counts.set(tag, (counts.get(tag) || 0) + 2);
        });
      }
    });
  });

  return counts;
}

async function buildHomeDashboard(userId, region) {
  const profile = withComputedRecommendations(getProfile(userId), userId);
  const [sections, liked, currentlyWatching, wishlist, releaseReminders, aiRecommendations] = await Promise.all([
    fetchGlobalHomeSections(region),
    enrichMovieCollection(profile.liked, region, 6),
    enrichMovieCollection(profile.currentlyWatching, region, 6),
    enrichMovieCollection(profile.wishlist, region, 6),
    enrichMovieCollection(profile.releaseReminders, region, 6),
    enrichMovieCollection(profile.aiRecommendations, region, 8),
  ]);

  return {
    source: sections.source,
    message: sections.message,
    sections: {
      trending: sections.trending,
      anticipated: sections.anticipated,
      upcoming: sections.upcoming,
    },
    library: {
      liked,
      currentlyWatching,
      wishlist,
      releaseReminders,
      aiRecommendations,
    },
  };
}

async function fetchGlobalHomeSections(region) {
  const sourceKey = tmdbApiKey ? `tmdb:${region}` : `fallback:${region}`;
  return readThroughCache(homeDashboardCache, sourceKey, async () => {
    if (tmdbApiKey) {
      try {
        return await fetchTMDbHomeSections(region);
      } catch (error) {
        console.error("TMDb home discovery failed, falling back to public feeds.", error);
      }
    }

    return fetchFallbackHomeSections(region);
  });
}

async function fetchTMDbHomeSections(region) {
  const today = new Date().toISOString().slice(0, 10);
  const inNinetyDays = new Date(Date.now() + (1000 * 60 * 60 * 24 * 90)).toISOString().slice(0, 10);
  const [trendingPayload, upcomingMoviesPayload, upcomingSeriesPayload] = await Promise.all([
    fetchTMDbList(`/trending/all/week`, { language: "en-US" }),
    fetchTMDbList(`/movie/upcoming`, { language: "en-US", region }),
    fetchTMDbList(`/discover/tv`, {
      language: "en-US",
      include_null_first_air_dates: "false",
      sort_by: "popularity.desc",
      "first_air_date.gte": today,
      "first_air_date.lte": inNinetyDays,
    }),
  ]);

  const trending = await enrichTMDbCollection((trendingPayload.results || []).filter((item) => item.media_type !== "person"), region, 6);
  const anticipatedCandidates = dedupeByKey([
    ...(upcomingMoviesPayload.results || []).map((item) => ({ ...item, media_type: "movie" })),
    ...(upcomingSeriesPayload.results || []).map((item) => ({ ...item, media_type: "tv" })),
  ], (item) => `${item.media_type}:${item.id}`)
    .sort((left, right) => (right.popularity || 0) - (left.popularity || 0));
  const upcomingCandidates = dedupeByKey([
    ...(upcomingMoviesPayload.results || []).map((item) => ({ ...item, media_type: "movie" })),
    ...(upcomingSeriesPayload.results || []).map((item) => ({ ...item, media_type: "tv" })),
  ], (item) => `${item.media_type}:${item.id}`)
    .sort((left, right) => getTmdbReleaseTimestamp(left) - getTmdbReleaseTimestamp(right));

  return {
    source: "tmdb",
    message: `Live movie and OTT data powered by TMDb for ${region}.`,
    trending,
    anticipated: await enrichTMDbCollection(anticipatedCandidates, region, 6),
    upcoming: await enrichTMDbCollection(upcomingCandidates, region, 6),
  };
}

async function fetchFallbackHomeSections(region) {
  const [itunesMovies, tvUpcoming] = await Promise.all([
    fetchItunesTopMovies(region),
    fetchTvMazeUpcoming(region),
  ]);

  const trending = dedupeByKey([...itunesMovies.slice(0, 4), ...tvUpcoming.slice(0, 4)], (item) => `${item.type}:${normalizeSearchText(item.title)}`)
    .slice(0, 6)
    .map((item) => normalizeLiveMovie(item))
    .filter(Boolean);
  const anticipated = [...tvUpcoming, ...itunesMovies]
    .slice(0, 6)
    .map((item) => normalizeLiveMovie(item))
    .filter(Boolean);
  const upcoming = [...tvUpcoming]
    .slice(0, 6)
    .map((item) => normalizeLiveMovie(item))
    .filter(Boolean);

  return {
    source: "fallback-live",
    message: "Live public feeds are active. Add TMDb for region-aware OTT providers and richer release metadata.",
    trending,
    anticipated,
    upcoming,
  };
}

async function enrichMovieCollection(movies, region, limit) {
  const slice = (movies || []).slice(0, limit);
  return Promise.all(slice.map((movie) => resolveLiveTitleEnhancement(movie, region)));
}

async function enrichTMDbCollection(items, region, limit) {
  const slice = (items || []).slice(0, limit);
  const enriched = await Promise.all(slice.map((item) => fetchTMDbTitleDetail(item.media_type === "tv" ? "series" : "movie", item.id, region)));
  return enriched.filter(Boolean);
}

async function resolveLiveTitleEnhancement(movie, region = tmdbRegion) {
  const fallback = normalizeLiveMovie(movie);
  if (!tmdbApiKey) {
    return fallback;
  }

  try {
    const tmdbReference = await resolveTMDbReference(movie);
    if (!tmdbReference) {
      return fallback;
    }

    const detail = await fetchTMDbTitleDetail(tmdbReference.type, tmdbReference.id, region);
    return detail || fallback;
  } catch {
    return fallback;
  }
}

async function resolveTMDbReference(movie) {
  const rawId = String(movie?.id || "").trim();
  const normalizedTitle = String(movie?.title || "").trim();
  const normalizedType = normalizeCatalogType(movie?.type);
  const cacheKey = `${rawId || normalizeSearchText(normalizedTitle)}:${normalizedType}:${String(movie?.year || "")}`;

  return readThroughCache(tmdbExternalCache, cacheKey, async () => {
    if (rawId.startsWith("tt")) {
      const payload = await fetchTMDbList(`/find/${encodeURIComponent(rawId)}`, { external_source: "imdb_id" });
      const match = selectTMDbMatchFromFind(payload, normalizedType);
      return match ? { id: match.id, type: match.media_type === "tv" ? "series" : "movie" } : null;
    }

    const endpoint = normalizedType === "series" ? "/search/tv" : "/search/movie";
    const payload = await fetchTMDbList(endpoint, {
      query: normalizedTitle,
      year: normalizedType === "movie" ? String(movie?.year || "") : undefined,
      first_air_date_year: normalizedType === "series" ? String(movie?.year || "") : undefined,
      include_adult: "false",
      language: "en-US",
    });
    const match = pickBestTMDbSearchMatch(payload.results || [], normalizedTitle, movie?.year);
    return match ? { id: match.id, type: normalizedType } : null;
  });
}

async function fetchTMDbTitleDetail(type, tmdbId, region = tmdbRegion) {
  const mediaType = type === "series" ? "tv" : "movie";
  const cacheKey = `${mediaType}:${tmdbId}:${region}`;
  return readThroughCache(tmdbDetailCache, cacheKey, async () => {
    const payload = await fetchTMDbList(`/${mediaType}/${tmdbId}`, {
      language: "en-US",
      append_to_response: mediaType === "movie"
        ? "watch/providers,external_ids,release_dates"
        : "watch/providers,external_ids,content_ratings",
    });
    return mapTMDbPayloadToMovie(payload, type, region);
  });
}

function mapTMDbPayloadToMovie(payload, type, region) {
  if (!payload || typeof payload !== "object" || !payload.id) {
    return null;
  }

  const title = sanitizeString(payload.title || payload.name);
  const year = String((payload.release_date || payload.first_air_date || "").slice(0, 4) || "Year unknown");
  const genre = Array.isArray(payload.genres) ? payload.genres.map((item) => item.name).filter(Boolean).slice(0, 2).join(", ") : "";
  const rating = Number(payload.vote_average || 0) > 0 ? `TMDb ${Number(payload.vote_average || 0).toFixed(1)}` : "";
  const meta = [genre, rating].filter(Boolean).join(" • ") || `${type === "series" ? "Series" : "Movie"}`;
  const providers = getTMDbProviders(payload, region);
  const watchUrl = sanitizeString(payload["watch/providers"]?.results?.[region]?.link) || buildJustWatchSearchUrl(title);
  const imdbId = sanitizeString(payload.external_ids?.imdb_id);

  return {
    id: imdbId || `tmdb-${type}-${payload.id}`,
    title,
    year,
    type,
    meta,
    summary: sanitizeString(payload.overview) || "No description available for this title yet.",
    poster: payload.poster_path ? `https://image.tmdb.org/t/p/w780${payload.poster_path}` : "",
    genre,
    director: "",
    tags: buildCatalogTags(genre, title),
    availabilityLabel: providers.length > 0 ? providers.join(", ") : "Search OTT",
    watchUrl,
    releaseLabel: buildTMDbReleaseLabel(payload, type, region),
    releaseDate: type === "series"
      ? sanitizeString(payload.next_episode_to_air?.air_date || payload.first_air_date)
      : sanitizeString(pickTMDbMovieReleaseDate(payload.release_dates?.results, region) || payload.release_date),
    popularityScore: Number(payload.popularity || 0) * 1000,
  };
}

function buildTMDbReleaseLabel(payload, type, region) {
  if (type === "series") {
    const nextEpisode = payload.next_episode_to_air?.air_date;
    if (nextEpisode) {
      return `Next episode ${formatReleaseDateLabel(nextEpisode)}`;
    }
    if (payload.first_air_date) {
      return `First aired ${formatReleaseDateLabel(payload.first_air_date)}`;
    }
    return "";
  }

  const releaseDate = pickTMDbMovieReleaseDate(payload.release_dates?.results, region) || payload.release_date;
  return releaseDate ? `Releases ${formatReleaseDateLabel(releaseDate)}` : "";
}

function pickTMDbMovieReleaseDate(results, region) {
  const regionEntry = Array.isArray(results) ? results.find((item) => item.iso_3166_1 === region) : null;
  const datedEntry = regionEntry?.release_dates?.find((item) => sanitizeString(item.release_date));
  return datedEntry?.release_date || "";
}

function getTMDbProviders(payload, region) {
  const providerResult = payload["watch/providers"]?.results?.[region];
  const providers = [
    ...(providerResult?.flatrate || []),
    ...(providerResult?.rent || []),
    ...(providerResult?.buy || []),
  ].map((item) => sanitizeString(item.provider_name)).filter(Boolean);
  return [...new Set(providers)].slice(0, 3);
}

async function fetchTMDbList(endpoint, params = {}) {
  if (!tmdbApiKey) {
    throw new Error("TMDb is not configured.");
  }

  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set("api_key", tmdbApiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.status_message || `TMDb request failed for ${endpoint}.`);
  }
  return payload;
}

function selectTMDbMatchFromFind(payload, type) {
  if (type === "series") {
    return Array.isArray(payload?.tv_results) ? payload.tv_results[0] || null : null;
  }
  return Array.isArray(payload?.movie_results) ? payload.movie_results[0] || null : null;
}

function pickBestTMDbSearchMatch(results, title, year) {
  const normalizedTitle = normalizeSearchText(title);
  const targetYear = Number.parseInt(String(year || "0"), 10) || 0;
  return (results || [])
    .map((item) => {
      const candidateTitle = normalizeSearchText(item.title || item.name || "");
      const candidateYear = Number.parseInt(String(item.release_date || item.first_air_date || "0").slice(0, 4), 10) || 0;
      const titleScore = scoreCatalogSearchTerm(candidateTitle, normalizedTitle, 1000);
      const yearScore = targetYear && candidateYear === targetYear ? 180 : 0;
      return { ...item, score: titleScore + yearScore + Number(item.popularity || 0) };
    })
    .sort((left, right) => right.score - left.score)[0] || null;
}

async function fetchItunesTopMovies(region) {
  const regionKey = String(region || "us").toLowerCase();
  return readThroughCache(itunesFeedCache, `itunes:${regionKey}`, async () => {
    const response = await fetch(`https://rss.marketingtools.apple.com/api/v2/${regionKey}/movies/top-movies/25/movies.json`);
    const payload = await response.json().catch(() => ({}));
    const results = Array.isArray(payload?.feed?.results) ? payload.feed.results : [];
    return results.map((item) => ({
      id: `itunes-${item.id}`,
      title: sanitizeString(item.name),
      year: String(item.releaseDate || "").slice(0, 4) || "Year unknown",
      type: "movie",
      meta: "Apple top chart",
      summary: sanitizeString(item.artistName) || "Live chart title from Apple Movies.",
      poster: normalizePosterUrl(item.artworkUrl100 ? item.artworkUrl100.replace(/200x200/g, "600x600") : ""),
      tags: ["live", "chart", "movie"],
      availabilityLabel: "Apple charting now",
      watchUrl: buildJustWatchSearchUrl(item.name),
      releaseLabel: item.releaseDate ? `Released ${formatReleaseDateLabel(item.releaseDate)}` : "",
      releaseDate: sanitizeString(item.releaseDate),
      popularityScore: 500000,
    }));
  });
}

async function fetchTvMazeUpcoming(region) {
  const baseDate = new Date();
  const keys = Array.from({ length: 4 }, (_, index) => {
    const nextDate = new Date(baseDate.getTime() + (index * 24 * 60 * 60 * 1000));
    return nextDate.toISOString().slice(0, 10);
  });

  const pages = await Promise.all(keys.map((dateKey) => readThroughCache(tvMazeFeedCache, `tvmaze:${region}:${dateKey}`, async () => {
    const response = await fetch(`https://api.tvmaze.com/schedule/web?country=${encodeURIComponent(region || "US")}&date=${dateKey}`);
    const payload = await response.json().catch(() => ([]));
    return Array.isArray(payload) ? payload : [];
  })));

  return dedupeByKey(pages.flat().map((item) => ({
    id: `tvmaze-${item.show?.id || item.id}`,
    title: sanitizeString(item.show?.name),
    year: String(item.show?.premiered || "").slice(0, 4) || "Year unknown",
    type: "series",
    meta: sanitizeString(item.show?.genres?.slice(0, 2).join(", ")) || "Upcoming series",
    summary: sanitizeString(item.show?.summary).replace(/<[^>]+>/g, "") || "Upcoming episode schedule from TVMaze.",
    poster: normalizePosterUrl(item.show?.image?.original || item.show?.image?.medium || ""),
    tags: ["live", "upcoming", "series"],
    availabilityLabel: sanitizeString(item.show?.network?.name || item.show?.webChannel?.name) || "Search OTT",
    watchUrl: buildJustWatchSearchUrl(item.show?.name),
    releaseLabel: item.airstamp ? `Airs ${formatReleaseDateLabel(item.airstamp)}` : "",
    releaseDate: sanitizeString(item.airstamp),
    popularityScore: Number(item.show?.weight || 0) * 1000,
  })).filter((item) => isRenderableHomeTitle(item)), (item) => item.id).slice(0, 12);
}

function normalizeLiveMovie(movie) {
  if (!isRenderableHomeTitle(movie)) {
    return null;
  }

  const normalized = normalizeMovie(movie) || normalizeMovie({
    id: String(movie?.id || createUniqueId("live")),
    title: String(movie?.title || "Unknown title"),
    year: String(movie?.year || "Year unknown"),
    type: normalizeCatalogType(movie?.type),
    meta: String(movie?.meta || ""),
    summary: String(movie?.summary || "No description available for this title yet."),
    poster: String(movie?.poster || ""),
    genre: String(movie?.genre || ""),
    director: String(movie?.director || ""),
    tags: Array.isArray(movie?.tags) ? movie.tags : [],
    availabilityLabel: String(movie?.availabilityLabel || "Search OTT"),
    watchUrl: String(movie?.watchUrl || buildJustWatchSearchUrl(movie?.title || "")),
    releaseLabel: String(movie?.releaseLabel || ""),
    releaseDate: String(movie?.releaseDate || ""),
  });
  return normalized;
}

function isRenderableHomeTitle(movie) {
  const title = sanitizeString(movie?.title);
  if (!title || /^(unknown title|untitled)$/i.test(title)) {
    return false;
  }

  return Boolean(normalizePosterUrl(movie?.poster));
}

function getTmdbReleaseTimestamp(item) {
  const rawDate = item.release_date || item.first_air_date || "9999-12-31";
  return new Date(rawDate).getTime();
}

function formatReleaseDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || "").slice(0, 10);
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildJustWatchSearchUrl(title) {
  return `https://www.justwatch.com/us/search?q=${encodeURIComponent(title || "")}`;
}

function dedupeByKey(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function getUserById(userId) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId) || null;
}

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) || null;
}

function findUserForReset(method, identifier) {
  if (method === "phone") {
    return db.prepare("SELECT * FROM users WHERE phone = ?").get(identifier) || null;
  }
  return findUserByEmail(identifier);
}

function insertUser(user) {
  db.prepare(`
    INSERT INTO users (id, handle, name, email, phone, password_hash, provider, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.handle, user.name, user.email, user.phone, user.password_hash, user.provider, user.created_at);
}

function updateUserBasics(userId, values) {
  db.prepare("UPDATE users SET name = ?, email = ?, provider = ? WHERE id = ?")
    .run(values.name, values.email, values.provider, userId);
}

function getProfile(userId) {
  const row = db.prepare("SELECT data FROM profiles WHERE user_id = ?").get(userId);
  if (!row) {
    const profile = createEmptyProfile();
    upsertProfile(userId, profile);
    return profile;
  }

  try {
    return normalizeProfile(JSON.parse(row.data));
  } catch {
    const profile = createEmptyProfile();
    upsertProfile(userId, profile);
    return profile;
  }
}

function upsertProfile(userId, profile) {
  const normalizedProfile = normalizeProfile(profile);
  db.prepare(`
    INSERT INTO profiles (user_id, data, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at
  `).run(userId, JSON.stringify(normalizedProfile), Date.now());
}

function createEmptyProfile() {
  return {
    wishlist: [],
    liked: [],
    currentlyWatching: [],
    releaseReminders: [],
    reminderPreferences: createDefaultReminderPreferences(),
    reminderDeliveryLog: [],
    pushSubscriptions: [],
    pushDeliveryLog: [],
    wishlistSaved: true,
    aiRecommendations: [],
    friendRecommendationInbox: [],
    sentRecommendations: [],
    notifications: [],
    incomingRequests: [],
    outgoingRequests: [],
    friendIds: [],
    watched: [],
  };
}

function normalizeProfile(profile) {
  const emptyProfile = createEmptyProfile();
  const nextProfile = profile && typeof profile === "object" ? profile : {};
  return {
    wishlist: Array.isArray(nextProfile.wishlist) ? nextProfile.wishlist.map(normalizeMovie).filter(Boolean) : emptyProfile.wishlist,
    liked: Array.isArray(nextProfile.liked) ? nextProfile.liked.map(normalizeMovie).filter(Boolean) : emptyProfile.liked,
    currentlyWatching: Array.isArray(nextProfile.currentlyWatching) ? nextProfile.currentlyWatching.map(normalizeMovie).filter(Boolean) : emptyProfile.currentlyWatching,
    releaseReminders: Array.isArray(nextProfile.releaseReminders) ? nextProfile.releaseReminders.map(normalizeMovie).filter(Boolean) : emptyProfile.releaseReminders,
    reminderPreferences: normalizeReminderPreferences(nextProfile.reminderPreferences),
    reminderDeliveryLog: Array.isArray(nextProfile.reminderDeliveryLog) ? nextProfile.reminderDeliveryLog.filter((item) => typeof item === "string").slice(0, 500) : emptyProfile.reminderDeliveryLog,
    pushSubscriptions: Array.isArray(nextProfile.pushSubscriptions) ? nextProfile.pushSubscriptions.map(normalizePushSubscription).filter(Boolean) : emptyProfile.pushSubscriptions,
    pushDeliveryLog: Array.isArray(nextProfile.pushDeliveryLog) ? nextProfile.pushDeliveryLog.filter((item) => typeof item === "string").slice(0, 500) : emptyProfile.pushDeliveryLog,
    wishlistSaved: Boolean(nextProfile.wishlistSaved),
    aiRecommendations: Array.isArray(nextProfile.aiRecommendations) ? nextProfile.aiRecommendations.map(normalizeMovie).filter(Boolean) : emptyProfile.aiRecommendations,
    friendRecommendationInbox: Array.isArray(nextProfile.friendRecommendationInbox) ? nextProfile.friendRecommendationInbox : emptyProfile.friendRecommendationInbox,
    sentRecommendations: Array.isArray(nextProfile.sentRecommendations) ? nextProfile.sentRecommendations : emptyProfile.sentRecommendations,
    notifications: Array.isArray(nextProfile.notifications) ? nextProfile.notifications : emptyProfile.notifications,
    incomingRequests: Array.isArray(nextProfile.incomingRequests) ? nextProfile.incomingRequests : emptyProfile.incomingRequests,
    outgoingRequests: Array.isArray(nextProfile.outgoingRequests) ? nextProfile.outgoingRequests : emptyProfile.outgoingRequests,
    friendIds: Array.isArray(nextProfile.friendIds) ? nextProfile.friendIds.filter((item) => typeof item === "string") : emptyProfile.friendIds,
    watched: Array.isArray(nextProfile.watched) ? nextProfile.watched : emptyProfile.watched,
  };
}

function mergeProfileForSync(currentProfile, incomingProfile) {
  const current = normalizeProfile(currentProfile);
  const incoming = normalizeProfile(incomingProfile);
  return {
    ...current,
    ...incoming,
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

function mergeObjectsById(currentItems, incomingItems) {
  return dedupeByKey([...(incomingItems || []), ...(currentItems || [])], (item) => String(item?.id || item?.movieId || item?.endpoint || JSON.stringify(item)));
}

function normalizeMovie(movie) {
  if (!movie || typeof movie !== "object" || typeof movie.id !== "string" || typeof movie.title !== "string") {
    return null;
  }

  return {
    id: movie.id,
    title: movie.title,
    year: String(movie.year || "Year unknown"),
    type: String(movie.type || "movie"),
    meta: String(movie.meta || ""),
    summary: String(movie.summary || ""),
    poster: String(movie.poster || ""),
    genre: String(movie.genre || ""),
    director: String(movie.director || ""),
    tags: Array.isArray(movie.tags) ? movie.tags.filter((item) => typeof item === "string") : [],
    availabilityLabel: String(movie.availabilityLabel || ""),
    watchUrl: String(movie.watchUrl || ""),
    releaseLabel: String(movie.releaseLabel || ""),
    releaseDate: String(movie.releaseDate || ""),
  };
}

function createDefaultReminderPreferences() {
  return {
    enabled: true,
    leadDays: 1,
    deliveryHour: 9,
    timezone: "UTC",
  };
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
    timezone: sanitizeString(input.timezone) || defaults.timezone,
  };
}

function normalizePushSubscription(subscription) {
  if (!subscription || typeof subscription !== "object") {
    return null;
  }

  const endpoint = sanitizeString(subscription.endpoint);
  const p256dh = sanitizeString(subscription.keys?.p256dh);
  const auth = sanitizeString(subscription.keys?.auth);
  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return {
    endpoint,
    expirationTime: subscription.expirationTime == null ? null : Number(subscription.expirationTime),
    keys: { p256dh, auth },
  };
}

function dedupePushSubscriptions(subscriptions) {
  return dedupeByKey(subscriptions.map(normalizePushSubscription).filter(Boolean), (item) => item.endpoint);
}

function loadVapidKeys() {
  const configuredPublicKey = String(process.env.PUSH_VAPID_PUBLIC_KEY || "").trim();
  const configuredPrivateKey = String(process.env.PUSH_VAPID_PRIVATE_KEY || "").trim();
  if (configuredPublicKey && configuredPrivateKey) {
    return { publicKey: configuredPublicKey, privateKey: configuredPrivateKey };
  }

  try {
    if (fs.existsSync(vapidKeyPath)) {
      const stored = JSON.parse(fs.readFileSync(vapidKeyPath, "utf8"));
      if (stored?.publicKey && stored?.privateKey) {
        return {
          publicKey: String(stored.publicKey),
          privateKey: String(stored.privateKey),
        };
      }
    }
  } catch (error) {
    console.warn("Unable to read stored VAPID keys.", error);
  }

  const generated = webpush.generateVAPIDKeys();
  fs.writeFileSync(vapidKeyPath, JSON.stringify(generated, null, 2));
  console.warn("Generated local VAPID keys for browser push. Set PUSH_VAPID_PUBLIC_KEY and PUSH_VAPID_PRIVATE_KEY to keep subscriptions stable across deployments.");
  return generated;
}

function startBackgroundReminderScheduler() {
  let running = false;

  const runSweep = async () => {
    if (running) {
      return;
    }

    running = true;
    try {
      const rows = db.prepare("SELECT user_id FROM profiles").all();
      for (const row of rows) {
        const userId = row.user_id;
        const profile = getProfile(userId);
        const reminderChanged = applyScheduledReleaseReminders(profile);
        const pushChanged = await deliverPendingPushNotifications(userId, profile);
        if (reminderChanged || pushChanged) {
          upsertProfile(userId, profile);
        }
      }
    } catch (error) {
      console.error("Background reminder scheduler failed.", error);
    } finally {
      running = false;
    }
  };

  setTimeout(() => {
    void runSweep();
  }, 5_000);
  setInterval(() => {
    void runSweep();
  }, Math.max(15_000, reminderSchedulerIntervalMs));
}

async function deliverPendingPushNotifications(userId, profile) {
  if (!profile || !Array.isArray(profile.pushSubscriptions) || profile.pushSubscriptions.length === 0) {
    return false;
  }

  const pendingNotifications = profile.notifications.filter((item) => {
    return item?.type === "release-reminder-due"
      && typeof item.id === "string"
      && !profile.pushDeliveryLog.includes(item.id)
      && Number(item.createdAt || 0) >= Date.now() - (1000 * 60 * 60 * 24);
  });

  if (pendingNotifications.length === 0) {
    return false;
  }

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
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          changed = true;
          continue;
        }

        console.error("Push delivery failed.", error);
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

  const dedupedSubscriptions = dedupePushSubscriptions(activeSubscriptions);
  if (dedupedSubscriptions.length !== profile.pushSubscriptions.length) {
    changed = true;
  }
  profile.pushSubscriptions = dedupedSubscriptions;
  return changed;
}

function buildPushPayload(userId, notification) {
  return {
    title: notification.title || "Movie Buddy",
    body: notification.message || "You have a new reminder.",
    tag: `movie-buddy-${notification.type || "notice"}-${userId}`,
    data: {
      url: "/",
      notificationId: notification.id,
      type: notification.type || "system",
    },
  };
}

function applyScheduledReleaseReminders(profile) {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  const preferences = normalizeReminderPreferences(profile.reminderPreferences);
  const existingLog = Array.isArray(profile.reminderDeliveryLog) ? profile.reminderDeliveryLog.filter((item) => typeof item === "string") : [];
  let changed = profile.reminderPreferences !== preferences || existingLog.length !== (profile.reminderDeliveryLog || []).length;
  profile.reminderPreferences = preferences;
  profile.reminderDeliveryLog = Array.from(new Set(existingLog)).slice(0, 500);

  if (!preferences.enabled || !Array.isArray(profile.releaseReminders) || profile.releaseReminders.length === 0) {
    return changed;
  }

  const currentLocalParts = getTimeZoneDateParts(new Date(), preferences.timezone);
  const currentDateKey = buildDateKey(currentLocalParts.year, currentLocalParts.month, currentLocalParts.day);

  profile.releaseReminders.forEach((movie) => {
    if (!movie?.releaseDate) {
      return;
    }

    const releaseInstant = new Date(movie.releaseDate);
    if (Number.isNaN(releaseInstant.getTime())) {
      return;
    }

    const releaseLocalParts = getTimeZoneDateParts(releaseInstant, preferences.timezone);
    const releaseDateKey = buildDateKey(releaseLocalParts.year, releaseLocalParts.month, releaseLocalParts.day);
    if (currentDateKey > releaseDateKey) {
      return;
    }

    const dueDate = new Date(Date.UTC(releaseLocalParts.year, releaseLocalParts.month - 1, releaseLocalParts.day - preferences.leadDays));
    const dueDateKey = dueDate.toISOString().slice(0, 10);
    const scheduleReached = currentDateKey > dueDateKey
      || (currentDateKey === dueDateKey && currentLocalParts.hour >= preferences.deliveryHour);
    if (!scheduleReached) {
      return;
    }

    const deliveryKey = `${movie.id}:${movie.releaseDate}:${preferences.leadDays}`;
    if (profile.reminderDeliveryLog.includes(deliveryKey)) {
      return;
    }

    createNotification(profile, {
      type: "release-reminder-due",
      title: "Release reminder",
      message: buildScheduledReminderMessage(movie, preferences.leadDays),
    });
    profile.reminderDeliveryLog.unshift(deliveryKey);
    profile.reminderDeliveryLog = Array.from(new Set(profile.reminderDeliveryLog)).slice(0, 500);
    changed = true;
  });

  return changed;
}

function buildScheduledReminderMessage(movie, leadDays) {
  const timing = leadDays === 0
    ? "releases today"
    : `releases in ${leadDays} day${leadDays === 1 ? "" : "s"}`;
  const label = sanitizeString(movie.releaseLabel);
  return `${movie.title} ${timing}.${label ? ` ${label}.` : ""}`.trim();
}

function getTimeZoneDateParts(date, timeZone) {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const read = (type) => Number.parseInt(parts.find((part) => part.type === type)?.value || "0", 10) || 0;
    return {
      year: read("year"),
      month: read("month"),
      day: read("day"),
      hour: read("hour"),
    };
  } catch {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
    };
  }
}

function buildDateKey(year, month, day) {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    email: user.email,
    provider: user.provider,
    createdAt: user.created_at,
  };
}

function createNotification(profile, notification) {
  const created = {
    id: createUniqueId("notification"),
    createdAt: Date.now(),
    read: false,
    ...notification,
  };
  profile.notifications.unshift(created);
  return created;
}

function createUserHandle() {
  const taken = new Set(db.prepare("SELECT handle FROM users").all().map((row) => row.handle));
  let handle = "";
  do {
    handle = `mb-${Math.random().toString(36).slice(2, 7)}`;
  } while (taken.has(handle));
  return handle;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizePhone(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function createUniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [algorithm, salt, originalHash] = String(storedHash || "").split(":");
  if (algorithm !== "scrypt" || !salt || !originalHash) {
    return false;
  }
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(derived, "hex"));
}

function cleanupExpiredRows() {
  const now = Date.now();
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM password_resets WHERE expires_at < ?").run(now);
}