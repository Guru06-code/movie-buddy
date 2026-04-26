"use strict";
const { log } = require("./logger");

const fast2smsKey = String(process.env.FAST2SMS_API_KEY || "").trim();

async function sendSms(to, body) {
  if (!fast2smsKey) {
    log("warn", `[SMS dev] To: ${to} — ${body}`);
    return false;
  }
  try {
    const r = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: { "authorization": fast2smsKey, "Content-Type": "application/json" },
      body: JSON.stringify({ route: "q", message: body, language: "english", flash: 0, numbers: to.replace(/^\+91/, "") }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.return) { log("warn", "Fast2SMS failed", { status: r.status, msg: data?.message }); return false; }
    log("info", `SMS sent via Fast2SMS to ${to}`);
    return true;
  } catch (err) {
    log("warn", "Fast2SMS error", { error: String(err) });
    return false;
  }
}

module.exports = { sendSms };
