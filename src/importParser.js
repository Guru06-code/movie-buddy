"use strict";

function parseCsvRow(line) {
  const fields = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { field += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      fields.push(field.trim());
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field.trim());
  return fields;
}

function parseCsvText(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCsvRow(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]+/g, "_").trim());
  const rows = lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ""; });
    return row;
  });
  return { headers, rows };
}

function parseLetterboxdCsv(text) {
  const { rows } = parseCsvText(text);
  return rows.map((row) => {
    const title = row.name || row.title || "";
    const year = row.year || "";
    const rating = row.rating ? Number(row.rating) : null;
    const watchedAt = row.watched_date || row.date || null;
    if (!title) return null;
    return { title, year: String(year), rating, watchedAt: watchedAt ? new Date(watchedAt).getTime() || null : null };
  }).filter(Boolean);
}

function parseImdbCsv(text) {
  const { rows } = parseCsvText(text);
  return rows.map((row) => {
    const title = row.title || row["original_title"] || row.const || "";
    const year = row.year || "";
    const rating = row.your_rating ? Number(row.your_rating) : null;
    const watchedAt = row.date_rated || null;
    if (!title || title.startsWith("tt")) return null;
    return { title: String(title), year: String(year), rating, watchedAt: watchedAt ? new Date(watchedAt).getTime() || null : null };
  }).filter(Boolean);
}

function parseTraktJson(text) {
  let data;
  try { data = JSON.parse(text); } catch { return []; }
  const items = Array.isArray(data) ? data : (data.movies || data.shows || data.history || []);
  return items.map((item) => {
    const movie = item.movie || item.show || item;
    const title = movie.title || "";
    const year = movie.year ? String(movie.year) : "";
    const watchedAt = item.watched_at || null;
    const rating = item.rating ? Number(item.rating) : null;
    if (!title) return null;
    return { title, year, rating, watchedAt: watchedAt ? new Date(watchedAt).getTime() || null : null };
  }).filter(Boolean);
}

module.exports = { parseLetterboxdCsv, parseImdbCsv, parseTraktJson };
