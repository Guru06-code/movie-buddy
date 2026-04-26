"use strict";
const https = require("node:https");
const { smtpConfig, resendApiKey } = require("./config");
const { log } = require("./logger");

let nodemailer = null;
try { nodemailer = require("nodemailer"); } catch { /* optional */ }

async function sendResendEmail(to, subject, text) {
  return new Promise((resolve) => {
    const body = JSON.stringify({
      from: smtpConfig.from || "Movie Buddy <onboarding@resend.dev>",
      to,
      subject,
      text,
    });
    const req = https.request({
      hostname: "api.resend.com",
      path: "/emails",
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = "";
      res.on("data", (chunk) => { raw += chunk; });
      res.on("end", () => {
        const ok = res.statusCode >= 200 && res.statusCode < 300;
        if (ok) log("info", "Email sent via Resend", { to, subject });
        else log("error", "Resend API error", { status: res.statusCode, body: raw.slice(0, 200), to });
        resolve(ok);
      });
    });
    req.on("error", (e) => { log("error", "Resend request failed", { error: String(e) }); resolve(false); });
    req.write(body);
    req.end();
  });
}

async function sendSmtpEmail(to, subject, text) {
  if (!nodemailer || !smtpConfig.host || !smtpConfig.user) return false;
  try {
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host, port: smtpConfig.port, secure: smtpConfig.port === 465,
      auth: { user: smtpConfig.user, pass: smtpConfig.pass },
    });
    await transporter.sendMail({ from: smtpConfig.from, to, subject, text });
    log("info", "Email sent via SMTP", { to, subject });
    return true;
  } catch (error) {
    log("error", "SMTP send failed", { error: String(error), to });
    return false;
  }
}

async function sendEmail(to, subject, text) {
  if (resendApiKey) return sendResendEmail(to, subject, text);
  if (nodemailer && smtpConfig.host && smtpConfig.user) return sendSmtpEmail(to, subject, text);
  log("warn", "Email not configured — OTP for development", { to, subject, text });
  return false;
}

module.exports = { sendEmail, sendSmtpEmail };
