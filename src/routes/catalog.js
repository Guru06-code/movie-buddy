"use strict";
const { tmdbRegion, omdbApiKey } = require("../config");
const { sendJson } = require("../http");
const { getProfile } = require("../db");
const { searchCatalogTitles, fetchCatalogDetails, resolveCatalogPoster, buildHomeDashboard, fetchTmdbTrailer, fetchTMDbTitleDetail, fetchTMDbDiscoverMovies, normalizeCatalogType, resolveLiveTitleEnhancement } = require("../catalog");

// TMDb genre IDs: 28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime,
//   18=Drama, 10751=Family, 14=Fantasy, 27=Horror, 9648=Mystery,
//   10749=Romance, 878=Sci-Fi, 53=Thriller
const moodGenreMap = {
  excited:      [28, 12],
  romantic:     [10749, 18],
  thoughtful:   [18],
  thrilled:     [53, 80, 9648],
  nostalgic:    [18, 10751, 35],
  adventurous:  [12, 14, 16, 878],
  emotional:    [18, 10751, 10749],
  funny:        [35, 16, 10751],
  scary:        [27, 53],
  documentary:  [99],
};

const ALLOWED_MOOD_LANGS = new Set(["", "en", "hi", "ta", "te", "ml", "ko", "ja", "fr", "es"]);

const curatedListsData = [
  { id: "list-arthouse",       name: "Arthouse Essentials",    description: "Slow cinema, bold visions.",                       genreIds: [18],          withoutEnglish: true,  minVotes: 1000 },
  { id: "list-thrillers",      name: "Edge-of-Seat Thrillers", description: "Crime, tension, psychological depth.",              genreIds: [53, 80, 9648], withoutEnglish: false, minVotes: 500  },
  { id: "list-world-cinema",   name: "World Cinema",           description: "Korean, Japanese, Indian, Spanish masterworks.",    genreIds: [18, 53, 10749], withoutEnglish: true, minVotes: 500  },
  { id: "list-crowd-pleasers", name: "Crowd Pleasers",         description: "Popular, rewatchable, universally loved.",          genreIds: [28, 12, 878],  withoutEnglish: false, minVotes: 2000 },
  { id: "list-feel-good",      name: "Feel-Good Picks",        description: "Warm, funny, and life-affirming.",                  genreIds: [35, 10749],    withoutEnglish: false, minVotes: 500  },
];

async function handleCatalogRoutes(req, res, url, userId) {
  const method = req.method;
  const path = url.pathname;

  if (method === "GET" && path === "/api/health") {
    sendJson(res, 200, { ok: true });
    return true;
  }

  if (method === "GET" && (path === "/api/catalog/search" || path === "/api/search")) {
    const query = String(url.searchParams.get("q") || "").trim();
    if (!query) { sendJson(res, 200, { titles: [] }); return true; }
    const titles = await searchCatalogTitles(query);
    sendJson(res, 200, { titles });
    return true;
  }

  if (method === "GET" && path === "/api/catalog/detail") {
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) { sendJson(res, 400, { error: "id is required." }); return true; }
    const [detail, poster] = await Promise.all([
      fetchCatalogDetails(id),
      resolveCatalogPoster({ id, title: String(url.searchParams.get("title") || ""), year: String(url.searchParams.get("year") || ""), type: String(url.searchParams.get("type") || "movie") }),
    ]);
    sendJson(res, 200, { detail: detail || null, poster: poster || "" });
    return true;
  }

  if (method === "GET" && path === "/api/catalog/trailer") {
    const tmdbId = String(url.searchParams.get("tmdb_id") || "").trim();
    if (!tmdbId) { sendJson(res, 200, { url: null }); return true; }
    const trailerUrl = await fetchTmdbTrailer(tmdbId);
    sendJson(res, 200, { url: trailerUrl });
    return true;
  }

  if (method === "GET" && path === "/api/catalog/tmdb-detail") {
    const tmdbId = String(url.searchParams.get("tmdb_id") || "").trim();
    const type = normalizeCatalogType(String(url.searchParams.get("type") || "movie").trim());
    if (!tmdbId) { sendJson(res, 200, { movie: null }); return true; }
    const movie = await fetchTMDbTitleDetail(type, tmdbId);
    sendJson(res, 200, { movie: movie || null });
    return true;
  }

  if (method === "GET" && path === "/api/catalog/poster") {
    const title = String(url.searchParams.get("title") || "").trim();
    const year = String(url.searchParams.get("year") || "").trim();
    const type = normalizeCatalogType(String(url.searchParams.get("type") || "movie").trim());
    if (!title) { sendJson(res, 200, { poster: "" }); return true; }
    let poster = "";
    // Try OMDb title lookup first (works without TMDb key)
    if (omdbApiKey) {
      try {
        const qs = new URLSearchParams({ apikey: omdbApiKey, t: title, plot: "short" });
        if (year) qs.set("y", year);
        const { fetchWithTimeout, normalizePosterUrl } = require("../catalog");
        const res2 = await fetchWithTimeout(`https://www.omdbapi.com/?${qs}`);
        const data = await res2.json().catch(() => ({}));
        if (data?.Response === "True" && data.Poster && data.Poster !== "N/A") {
          poster = normalizePosterUrl(data.Poster) || "";
        }
      } catch { /* fall through */ }
    }
    // Fall back to TMDb enrichment if available
    if (!poster) {
      const enriched = await resolveLiveTitleEnhancement({ title, year, type });
      poster = enriched?.poster || "";
    }
    sendJson(res, 200, { poster });
    return true;
  }

  if (method === "GET" && path === "/api/home/dashboard") {
    const dashboard = await buildHomeDashboard(userId, tmdbRegion);
    sendJson(res, 200, { dashboard });
    return true;
  }

  if (method === "GET" && path === "/api/users/search") {
    const { db, sanitizeUser } = require("../db");
    const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
    if (!query) { sendJson(res, 200, { users: [] }); return true; }
    const pattern = `%${query}%`;
    const users = (await db.execute({
      sql: `SELECT id, handle, name, email, provider, created_at FROM users WHERE id != ? AND (LOWER(name) LIKE ? OR LOWER(handle) LIKE ? OR LOWER(id) LIKE ?) ORDER BY name ASC LIMIT 20`,
      args: [userId, pattern, pattern, pattern],
    })).rows.map(sanitizeUser);
    sendJson(res, 200, { users });
    return true;
  }

  if (method === "GET" && path === "/api/mood/discover") {
    const mood = String(url.searchParams.get("mood") || "").trim().toLowerCase();
    const rawLang = String(url.searchParams.get("lang") || "").trim().toLowerCase();
    const lang = ALLOWED_MOOD_LANGS.has(rawLang) ? rawLang : "";
    const genreIds = moodGenreMap[mood] || moodGenreMap.thoughtful;
    const profile = await getProfile(userId);
    const watchedIds = new Set((profile.watched || []).map((i) => i.movieId));
    const likedIds = new Set((profile.liked || []).map((i) => i.id));
    let picks = [];
    try {
      const candidates = await fetchTMDbDiscoverMovies(genreIds, tmdbRegion, { limit: 16, lang });
      picks = candidates.filter((m) => !watchedIds.has(m.id) && !likedIds.has(m.id)).slice(0, 8);
    } catch { picks = []; }
    sendJson(res, 200, { mood, picks });
    return true;
  }

  if (method === "GET" && path === "/api/lists/curated") {
    const profile = await getProfile(userId);
    const watchedIds = new Set((profile.watched || []).map((i) => i.movieId));
    const likedIds = new Set((profile.liked || []).map((i) => i.id));
    const listsWithMovies = await Promise.all(curatedListsData.map(async (list) => {
      let movies = [];
      try {
        const candidates = await fetchTMDbDiscoverMovies(list.genreIds, tmdbRegion, { withoutEnglish: list.withoutEnglish, minVotes: list.minVotes, limit: 12 });
        movies = candidates.filter((m) => !watchedIds.has(m.id) && !likedIds.has(m.id)).slice(0, 6);
      } catch { movies = []; }
      return { id: list.id, name: list.name, description: list.description, movies };
    }));
    sendJson(res, 200, { lists: listsWithMovies });
    return true;
  }

  return false;
}

module.exports = { handleCatalogRoutes };
