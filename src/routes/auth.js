"use strict";
const { oauthConfig, googleClientId, resetLifetimeMs } = require("../config");
const { log } = require("../logger");
const { sendJson, readJsonBody } = require("../http");
const {
  db,
  getUserById, findUserByEmail, findUserByGoogleId, findUserForReset, findUserByPhone,
  insertUser, updateUserBasics, updateUserGoogleId, sanitizeUser,
  isHandleAvailable,
  createSession, createUniqueId, getUserSessions, deleteUserSession,
  hashPassword, verifyPassword, normalizeEmail, normalizePhone,
  upsertProfile, createEmptyProfile,
} = require("../db");

function getDeviceInfo(req) {
  const ua = String(req.headers?.["user-agent"] || "");
  let os = "Unknown device";
  let browser = "Unknown browser";
  if (/iPhone/.test(ua))                              os = "iPhone";
  else if (/iPad/.test(ua))                           os = "iPad";
  else if (/Android/.test(ua))                        os = "Android";
  else if (/Windows NT/.test(ua))                     os = "Windows";
  else if (/Mac OS X/.test(ua))                       os = "Mac";
  else if (/Linux/.test(ua))                          os = "Linux";
  if (/Edg\//.test(ua))                               browser = "Edge";
  else if (/OPR\/|Opera/.test(ua))                    browser = "Opera";
  else if (/Chrome\//.test(ua))                       browser = "Chrome";
  else if (/Firefox\//.test(ua))                      browser = "Firefox";
  else if (/Safari\//.test(ua))                       browser = "Safari";
  return `${browser} on ${os}`;
}
const { buildAppState, buildProviderConfig } = require("../catalog");
const { sendEmail } = require("../email");
const { sendSms } = require("../sms");

async function handleAuthRoutes(req, res, url, session) {
  const method = req.method;
  const path = url.pathname;

  // ── Session ──────────────────────────────────────────────────────────────
  if (method === "GET" && path === "/api/auth/session") {
    if (!session) { sendJson(res, 200, { user: null }); return true; }
    sendJson(res, 200, await buildAppState(session.userId));
    return true;
  }

  if (method === "GET" && path === "/api/auth/providers") {
    sendJson(res, 200, buildProviderConfig(oauthConfig));
    return true;
  }

  // ── Handle availability check ────────────────────────────────────────────
  if (method === "GET" && path === "/api/auth/check-handle") {
    const raw = String(url.searchParams.get("handle") || "").trim().toLowerCase();
    const handle = raw.replace(/[^a-z0-9_.-]/g, "");
    if (!handle || handle.length < 3) {
      sendJson(res, 200, { available: false, error: "Handle must be at least 3 characters." });
      return true;
    }
    if (handle.length > 30) {
      sendJson(res, 200, { available: false, error: "Handle must be 30 characters or fewer." });
      return true;
    }
    const available = await isHandleAvailable(handle);
    sendJson(res, 200, { available, handle });
    return true;
  }

  // ── Signup step 1: validate + send email OTP ─────────────────────────────
  if (method === "POST" && path === "/api/auth/signup") {
    const body = await readJsonBody(req);
    const name = String(body?.name || "").trim();
    const rawHandle = String(body?.handle || "").trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "");
    const email = normalizeEmail(body?.email);
    const phone = normalizePhone(body?.phone);
    const password = String(body?.password || "");

    if (!name) { sendJson(res, 400, { error: "Enter your display name." }); return true; }
    if (!rawHandle || rawHandle.length < 3) { sendJson(res, 400, { error: "Choose a @handle with at least 3 characters (letters, numbers, _ . -)." }); return true; }
    if (rawHandle.length > 30) { sendJson(res, 400, { error: "Handle must be 30 characters or fewer." }); return true; }
    if (!email) { sendJson(res, 400, { error: "Enter a valid email address." }); return true; }
    if (password.length < 6) { sendJson(res, 400, { error: "Password must be at least 6 characters." }); return true; }

    if (!(await isHandleAvailable(rawHandle))) {
      sendJson(res, 409, { error: "That handle is already taken — try another." });
      return true;
    }
    if (await findUserByEmail(email)) {
      sendJson(res, 409, { error: "An account with this email already exists." });
      return true;
    }

    const verifyId = createUniqueId("ev");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    await db.execute({ sql: "DELETE FROM email_verifications WHERE email = ?", args: [email] });
    await db.execute({
      sql: "INSERT INTO email_verifications (id, email, otp, name, handle, phone, password_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: [verifyId, email, otp, name, rawHandle, phone || "", hashPassword(password), now, now + resetLifetimeMs],
    });

    const emailSent = await sendEmail(
      email,
      "Movie Buddy — verify your email",
      `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't sign up, you can ignore this.`,
    );
    sendJson(res, 200, {
      ok: true, verifyId,
      ...(emailSent ? {} : { previewOtp: otp }),
      message: emailSent
        ? `A 6-digit code was sent to ${email}. Enter it below.`
        : `Dev mode — SMTP not configured. Code: ${otp}`,
    });
    return true;
  }

  // ── Signup step 2: verify OTP → create account ───────────────────────────
  if (method === "POST" && path === "/api/auth/signup/verify") {
    const body = await readJsonBody(req);
    const verifyId = String(body?.verifyId || "").trim();
    const otp = String(body?.otp || "").trim();

    if (!verifyId || !otp) { sendJson(res, 400, { error: "Verification ID and code are required." }); return true; }

    const row = (await db.execute({ sql: "SELECT * FROM email_verifications WHERE id = ?", args: [verifyId] })).rows[0] || null;
    if (!row) { sendJson(res, 400, { error: "Verification session not found. Go back and request a new code." }); return true; }
    if (Number(row.expires_at) < Date.now()) { sendJson(res, 400, { error: "Code expired. Go back and request a new one." }); return true; }
    if (row.otp !== otp) { sendJson(res, 400, { error: "Incorrect code. Check your email and try again." }); return true; }

    // Race-condition guard
    if (!(await isHandleAvailable(row.handle))) {
      await db.execute({ sql: "DELETE FROM email_verifications WHERE id = ?", args: [verifyId] });
      sendJson(res, 409, { error: "That handle was just taken. Go back and choose another." });
      return true;
    }
    if (await findUserByEmail(row.email)) {
      await db.execute({ sql: "DELETE FROM email_verifications WHERE id = ?", args: [verifyId] });
      sendJson(res, 409, { error: "An account with this email already exists." });
      return true;
    }

    const user = {
      id: createUniqueId("user"),
      handle: row.handle,
      name: row.name,
      email: row.email,
      phone: row.phone,
      password_hash: row.password_hash,
      provider: "password",
      created_at: Date.now(),
    };
    await insertUser(user);
    await upsertProfile(user.id, createEmptyProfile());
    await db.execute({ sql: "DELETE FROM email_verifications WHERE id = ?", args: [verifyId] });

    const token = await createSession(user.id, getDeviceInfo(req));
    setSessionCookie(res, token);
    sendJson(res, 201, await buildAppState(user.id));
    return true;
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  if (method === "POST" && path === "/api/auth/login") {
    const body = await readJsonBody(req);
    const loginEmail = normalizeEmail(body?.email);
    const loginPhone = normalizePhone(body?.phone);
    const loginPassword = String(body?.password || "");
    const loginOtp = String(body?.otp || "").trim();
    const loginId = String(body?.loginId || "").trim();

    // Phone + OTP
    if (loginPhone && loginOtp && loginId) {
      const row = (await db.execute({ sql: "SELECT * FROM password_resets WHERE id = ? AND identifier = ?", args: [loginId, loginPhone] })).rows[0] || null;
      if (!row || Number(row.expires_at) < Date.now() || row.otp !== loginOtp) {
        sendJson(res, 401, { error: "Invalid or expired code. Request a new one." });
        return true;
      }
      const user = await getUserById(row.user_id);
      if (!user) { sendJson(res, 404, { error: "Account not found." }); return true; }
      await db.execute({ sql: "DELETE FROM password_resets WHERE id = ?", args: [loginId] });
      const token = await createSession(user.id, getDeviceInfo(req));
      setSessionCookie(res, token);
      sendJson(res, 200, await buildAppState(user.id));
      return true;
    }

    // Phone + password
    if (loginPhone && loginPassword) {
      const user = await findUserByPhone(loginPhone);
      if (!user || !verifyPassword(loginPassword, user.password_hash)) {
        sendJson(res, 401, { error: "Incorrect phone number or password." });
        return true;
      }
      const token = await createSession(user.id, getDeviceInfo(req));
      setSessionCookie(res, token);
      sendJson(res, 200, await buildAppState(user.id));
      return true;
    }

    // Email + password (existing)
    const user = await findUserByEmail(loginEmail);
    if (!user || !verifyPassword(loginPassword, user.password_hash)) {
      sendJson(res, 401, { error: "Incorrect email or password." });
      return true;
    }
    const token = await createSession(user.id, getDeviceInfo(req));
    setSessionCookie(res, token);
    sendJson(res, 200, await buildAppState(user.id));
    return true;
  }

  // ── Phone OTP send (for phone login) ─────────────────────────────────────
  if (method === "POST" && path === "/api/auth/phone-otp") {
    const body = await readJsonBody(req);
    const phone = normalizePhone(body?.phone);
    if (!phone) { sendJson(res, 400, { error: "Enter your phone number." }); return true; }
    const user = await findUserByPhone(phone);
    if (!user) { sendJson(res, 404, { error: "No account found with that phone number." }); return true; }

    const loginId = createUniqueId("reset");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    await db.execute({ sql: "DELETE FROM password_resets WHERE user_id = ?", args: [user.id] });
    await db.execute({
      sql: "INSERT INTO password_resets (id, user_id, identifier, otp, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [loginId, user.id, phone, otp, now, now + resetLifetimeMs],
    });

    const smsSent = await sendSms(phone, `Your Movie Buddy login code: ${otp}. Valid 10 min.`);
    sendJson(res, 200, {
      ok: true, loginId,
      ...(smsSent ? {} : { previewOtp: otp }),
      message: smsSent ? "A login code was sent to your phone." : `Dev mode — Fast2SMS not configured. Code: ${otp}`,
    });
    return true;
  }

  // ── OAuth ─────────────────────────────────────────────────────────────────
  if (method === "POST" && path === "/api/auth/oauth") {
    const body = await readJsonBody(req);
    const provider = String(body?.provider || "").trim().toLowerCase();
    const idToken = String(body?.idToken || body?.providerId || "").trim();
    const name = String(body?.name || "").trim();
    const email = normalizeEmail(body?.email);

    if (!["google", "microsoft", "apple"].includes(provider)) {
      sendJson(res, 400, { error: "Provider authentication payload was incomplete." });
      return true;
    }

    let verifiedEmail = email;
    let verifiedName = name;
    let googleId = null;

    if (provider === "google" && googleClientId && idToken) {
      try {
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.aud !== googleClientId) {
          sendJson(res, 401, { error: "Google token audience mismatch." });
          return true;
        }
        verifiedEmail = normalizeEmail(tokenInfo.email);
        verifiedName = String(tokenInfo.name || name).trim();
        googleId = String(tokenInfo.sub || "").trim();
      } catch (error) {
        log("warn", "Google token verification failed", { error: String(error) });
      }
    }

    if (!verifiedName || !verifiedEmail) {
      sendJson(res, 400, { error: "Provider authentication payload was incomplete." });
      return true;
    }

    let user = googleId ? await findUserByGoogleId(googleId) : null;
    if (!user) user = await findUserByEmail(verifiedEmail);

    if (!user) {
      const providerId = googleId || String(body?.providerId || "").trim();
      // Generate a handle from the verified name
      const baseHandle = verifiedName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "user";
      let handle = baseHandle;
      let suffix = 1;
      while (!(await isHandleAvailable(handle))) {
        handle = `${baseHandle}${suffix++}`;
      }
      user = {
        id: `social-${provider}-${(providerId || verifiedEmail).replace(/[^a-z0-9-]/gi, "-")}`,
        handle, name: verifiedName, email: verifiedEmail, phone: "",
        password_hash: hashPassword(`${provider}:${providerId}:${verifiedEmail}`),
        provider, created_at: Date.now(), google_id: googleId,
      };
      await insertUser(user);
      await upsertProfile(user.id, createEmptyProfile());
    } else {
      await updateUserBasics(user.id, { name: verifiedName, email: verifiedEmail, provider });
      if (googleId && !user.google_id) await updateUserGoogleId(user.id, googleId);
    }

    const token = await createSession(user.id, getDeviceInfo(req));
    setSessionCookie(res, token);
    sendJson(res, 200, await buildAppState(user.id));
    return true;
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  if (method === "POST" && path === "/api/auth/logout") {
    if (session) await db.execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [session.token] });
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
    return true;
  }

  // ── Active sessions (device management) ──────────────────────────────────
  if (method === "GET" && path === "/api/auth/sessions") {
    if (!session) { sendJson(res, 401, { error: "Not logged in." }); return true; }
    const rows = await getUserSessions(session.userId);
    const sessions = rows.map((s) => ({
      token: s.token,
      isCurrent: s.token === session.token,
      deviceInfo: s.device_info || "Unknown device",
      createdAt: s.created_at,
      expiresAt: s.expires_at,
    }));
    sendJson(res, 200, { sessions });
    return true;
  }

  if (method === "DELETE" && path.startsWith("/api/auth/sessions/")) {
    if (!session) { sendJson(res, 401, { error: "Not logged in." }); return true; }
    const targetToken = decodeURIComponent(path.replace("/api/auth/sessions/", ""));
    if (targetToken === session.token) {
      sendJson(res, 400, { error: "Use /api/auth/logout to end your current session." });
      return true;
    }
    await deleteUserSession(targetToken, session.userId);
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (method === "DELETE" && path === "/api/auth/sessions") {
    if (!session) { sendJson(res, 401, { error: "Not logged in." }); return true; }
    await db.execute({
      sql: "DELETE FROM sessions WHERE user_id = ? AND token != ?",
      args: [session.userId, session.token],
    });
    sendJson(res, 200, { ok: true });
    return true;
  }

  // ── Password reset ────────────────────────────────────────────────────────
  if (method === "POST" && path === "/api/auth/reset/request") {
    const body = await readJsonBody(req);
    const method2 = String(body?.method || "email").trim() === "phone" ? "phone" : "email";
    const identifier = method2 === "email" ? normalizeEmail(body?.identifier) : normalizePhone(body?.identifier);
    if (!identifier) {
      sendJson(res, 400, { error: `Enter your ${method2 === "email" ? "email" : "phone number"} first.` });
      return true;
    }
    const user = await findUserForReset(method2, identifier);
    if (!user) { sendJson(res, 404, { error: `No account found for that ${method2}.` }); return true; }
    const resetId = createUniqueId("reset");
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const now = Date.now();
    await db.execute({ sql: "DELETE FROM password_resets WHERE user_id = ?", args: [user.id] });
    await db.execute({
      sql: "INSERT INTO password_resets (id, user_id, identifier, otp, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)",
      args: [resetId, user.id, identifier, otp, now, now + resetLifetimeMs],
    });
    let delivered = false;
    if (method2 === "email") {
      delivered = await sendEmail(identifier, "Movie Buddy — your password reset code", `Your one-time code is: ${otp}\n\nThis code expires in 10 minutes.`);
    } else {
      delivered = await sendSms(identifier, `Your Movie Buddy reset code: ${otp}. Valid 10 min.`);
    }
    sendJson(res, 200, {
      ok: true, resetId,
      ...(delivered ? {} : { previewOtp: otp }),
      message: delivered ? `A reset code was sent to your ${method2}. Enter it below.` : `Dev OTP (not configured). Code: ${otp}`,
    });
    return true;
  }

  if (method === "POST" && path === "/api/auth/reset/confirm") {
    const body = await readJsonBody(req);
    const resetId = String(body?.resetId || "").trim();
    const otp = String(body?.otp || "").trim();
    const password = String(body?.password || "");
    if (!resetId || !otp) { sendJson(res, 400, { error: "Send an OTP before trying to reset the password." }); return true; }
    if (password.length < 6) { sendJson(res, 400, { error: "Use a password with at least 6 characters." }); return true; }
    const resetRow = (await db.execute({ sql: "SELECT * FROM password_resets WHERE id = ?", args: [resetId] })).rows[0] || null;
    if (!resetRow || Number(resetRow.expires_at) < Date.now()) { sendJson(res, 400, { error: "Reset session expired. Try sending OTP again." }); return true; }
    if (resetRow.otp !== otp) { sendJson(res, 400, { error: "Incorrect OTP. Use the latest code shown above." }); return true; }
    await db.execute({ sql: "UPDATE users SET password_hash = ? WHERE id = ?", args: [hashPassword(password), resetRow.user_id] });
    await db.execute({ sql: "DELETE FROM password_resets WHERE id = ?", args: [resetId] });
    sendJson(res, 200, { ok: true, message: "Password updated. Login with your new password." });
    return true;
  }

  return false;
}

function setSessionCookie(response, token) {
  const { sessionLifetimeMs } = require("../config");
  response.setHeader("Set-Cookie", `mb_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${Math.floor(sessionLifetimeMs / 1000)}`);
}

function clearSessionCookie(response) {
  response.setHeader("Set-Cookie", "mb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0");
}

module.exports = { handleAuthRoutes, setSessionCookie, clearSessionCookie };
