"use strict";
const { anthropicApiKey } = require("./config");
const { log } = require("./logger");

let Anthropic = null;
try { Anthropic = require("@anthropic-ai/sdk"); } catch { /* optional */ }

async function getAiRecommendations(likedTitles, watchedTitles) {
  if (!Anthropic || !anthropicApiKey) return null;
  const client = new Anthropic({ apiKey: anthropicApiKey });
  const likedList = likedTitles.slice(0, 10).join(", ") || "none yet";
  const watchedList = watchedTitles.slice(0, 5).join(", ") || "none yet";
  const prompt = `You are a film critic with deep knowledge of world cinema. A user has liked these movies: ${likedList}. They have also watched: ${watchedList}. Recommend exactly 6 movies they haven't seen yet. Return ONLY a valid JSON array with no extra text, in this format: [{"title": "Movie Title", "year": "2023", "reason": "One sentence explaining why they'll love it", "basedOn": "Exact title from their liked list that inspired this pick"}]. Choose diverse, high-quality films matching their taste.`;
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const text = msg.content[0]?.text || "[]";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return null;
    const recs = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(recs)) return null;
    return recs.map((r) => ({
      title: String(r.title || ""),
      year: String(r.year || ""),
      reason: String(r.reason || ""),
      basedOn: String(r.basedOn || ""),
    })).filter((r) => r.title);
  } catch (error) {
    log("warn", "AI recommendations failed", { error: String(error) });
    return null;
  }
}

module.exports = { getAiRecommendations };
