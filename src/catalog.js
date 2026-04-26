"use strict";
const { omdbApiKey, tmdbApiKey, tmdbRegion, externalFetchTimeoutMs, omdbMaxPages } = require("./config");
const { log } = require("./logger");
const { getProfile, dedupeByKey, normalizeMovie, applyScheduledReleaseReminders, upsertProfile, getUserById, sanitizeUser } = require("./db");

// ---- Fetch helpers ----

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs || externalFetchTimeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function fetchWithRetry(url, options, timeoutMs, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try { return await fetchWithTimeout(url, options, timeoutMs); }
    catch (error) {
      lastError = error;
      if (i < retries) await new Promise((resolve) => setTimeout(resolve, 300 * (i + 1)));
    }
  }
  throw lastError;
}

// ---- Cache helpers ----

function createResponseCache(ttlMs, maxEntries) {
  return { ttlMs, maxEntries, values: new Map(), inflight: new Map() };
}

async function readThroughCache(cache, key, loader) {
  const cached = cache.values.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (cache.inflight.has(key)) return cache.inflight.get(key);
  const pending = Promise.resolve().then(loader)
    .then((value) => {
      cache.values.set(key, { value, expiresAt: Date.now() + cache.ttlMs });
      cache.inflight.delete(key);
      pruneResponseCache(cache);
      return value;
    })
    .catch((error) => { cache.inflight.delete(key); throw error; });
  cache.inflight.set(key, pending);
  return pending;
}

function pruneResponseCache(cache) {
  while (cache.values.size > cache.maxEntries) {
    const oldestKey = cache.values.keys().next().value;
    cache.values.delete(oldestKey);
  }
}

const catalogSearchCache = createResponseCache(1000 * 60 * 10, 200);
const catalogDetailCache = createResponseCache(1000 * 60 * 60 * 24, 1000);
const catalogPosterCache = createResponseCache(1000 * 60 * 60 * 24, 1000);
const homeDashboardCache = createResponseCache(1000 * 60 * 20, 60);
const tmdbExternalCache = createResponseCache(1000 * 60 * 60 * 24, 1500);
const tmdbDetailCache = createResponseCache(1000 * 60 * 60 * 24, 1500);
const itunesFeedCache = createResponseCache(1000 * 60 * 30, 40);
const tvMazeFeedCache = createResponseCache(1000 * 60 * 20, 40);
const moodDiscoverCache = createResponseCache(1000 * 60 * 60 * 2, 50);
const tmdbTopRatedCache = createResponseCache(1000 * 60 * 60 * 6, 10);

const TMDB_GENRE_ID_TO_TAG = {
  28: "action", 12: "adventure", 16: "animation", 35: "comedy",
  80: "crime", 99: "documentary", 18: "drama", 10751: "family",
  14: "fantasy", 36: "history", 27: "horror", 9648: "mystery",
  10749: "romance", 878: "sci-fi", 53: "thriller", 10752: "war", 37: "western",
};

const TMDB_LANG_TO_TAG = {
  ko: "korean", ja: "japanese", fr: "french", es: "spanish",
  hi: "hindi", zh: "chinese", it: "italian", de: "german", pt: "portuguese",
};

// ---- Search ----

async function searchCatalogTitles(query) {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return [];
  return readThroughCache(catalogSearchCache, normalizedQuery, async () => {
    const [imdbResults, omdbResults, tmdbResults] = await Promise.all([
      fetchImdbSearchResults(normalizedQuery),
      fetchOmdbSearchResults(normalizedQuery),
      fetchTMDbSearchResults(query.trim()), // pass original casing for best TMDb matching
    ]);
    // Enrich legacy (IMDB/OMDB) results through the full pipeline
    const legacyItems = dedupeCatalogResultsById([...imdbResults, ...omdbResults]).slice(0, 15);
    const enriched = (await Promise.all(legacyItems.map((item) => buildCatalogSearchResult(item)))).filter(Boolean);
    // TMDb results already carry poster + summary — skip the per-item detail calls
    const legacyTitlesNorm = new Set(enriched.map((r) => normalizeSearchText(r.title)));
    const tmdbDirect = tmdbResults
      .filter((r) => !legacyTitlesNorm.has(normalizeSearchText(r.title)))
      .slice(0, 20);
    return [...enriched, ...tmdbDirect].sort(compareCatalogTitlesForQuery(normalizedQuery));
  });
}

// Language codes to search in parallel — covers every major Indian language + global popular ones
const TMDB_SEARCH_LANGUAGES = ["en-US", "hi-IN", "kn-IN", "ta-IN", "te-IN", "ml-IN", "mr-IN", "bn-IN", "pa-IN", "gu-IN", "ko-KR", "ja-JP", "zh-CN", "fr-FR", "es-ES", "de-DE", "pt-BR", "ar-SA", "ru-RU", "tr-TR"];

async function fetchTMDbSearchResults(query) {
  if (!tmdbApiKey) return [];
  try {
    // Run all language searches in parallel — each surfaces films ranked highly in that language
    const searches = await Promise.allSettled(
      TMDB_SEARCH_LANGUAGES.map((lang) =>
        fetchTMDbList("/search/multi", { query, language: lang, include_adult: "false" })
      )
    );
    // Merge all pages, dedup by TMDb id
    const seenIds = new Set();
    const merged = [];
    for (const result of searches) {
      if (result.status !== "fulfilled") continue;
      for (const r of (result.value.results || [])) {
        if (!r.id || seenIds.has(r.id)) continue;
        if ((r.media_type !== "movie" && r.media_type !== "tv") || (!r.title && !r.name)) continue;
        if (!r.poster_path) continue;
        seenIds.add(r.id);
        merged.push(r);
      }
    }
    return merged.map((r) => buildTMDbSearchItem(r));
  } catch {
    return [];
  }
}

function buildTMDbSearchItem(r) {
  const isTV = r.media_type === "tv";
  const title = String(r.title || r.name || "").trim();
  const year = String(((isTV ? r.first_air_date : r.release_date) || "").slice(0, 4) || "");
  const genreTags = (r.genre_ids || []).map((id) => TMDB_GENRE_ID_TO_TAG[id]).filter(Boolean);
  const langTag = TMDB_LANG_TO_TAG[r.original_language] || null;
  const rating = Number(r.vote_average || 0) > 0 ? `TMDb ${Number(r.vote_average).toFixed(1)}` : "";
  const genre = genreTags.slice(0, 2).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
  const meta = [genre, rating].filter(Boolean).join(" • ") || (isTV ? "Series" : "Movie");
  return {
    id: `tmdb-${isTV ? "series" : "movie"}-${r.id}`,
    title,
    year,
    type: isTV ? "series" : "movie",
    meta,
    summary: sanitizeString(r.overview) || "No description available.",
    poster: `https://image.tmdb.org/t/p/w500${r.poster_path}`,
    genre,
    tags: [...new Set([...genreTags, ...(langTag ? [langTag] : [])])],
    popularityScore: Number(r.popularity || 0) * 1000,
    availabilityLabel: "Search OTT",
    watchUrl: buildJustWatchSearchUrl(title),
    releaseLabel: "",
    releaseDate: "",
  };
}

async function buildCatalogSearchResult(item) {
  const [details, poster] = await Promise.all([fetchCatalogDetails(item.id), resolveCatalogPoster(item)]);
  const type = normalizeCatalogType(details?.Type || item.type);
  const genre = sanitizeString(details?.Genre);
  const creator = type === "series" ? sanitizeString(details?.Writer) : sanitizeString(details?.Director);
  const metaParts = [genre, creator].filter(Boolean).slice(0, 2);
  const enh = await resolveLiveTitleEnhancement({ imdbId: item.id, title: item.title, year: item.year, type, poster, summary: sanitizeString(details?.Plot) || item.summary, genre, director: creator }) || {};
  const finalPoster = enh.poster || poster;
  if (!finalPoster) return null; // skip titles with no poster at all
  return {
    id: enh.id || item.id,
    title: enh.title || item.title,
    year: String(enh.year || item.year || details?.Year || "Year unknown"),
    type: enh.type || type,
    meta: enh.meta || metaParts.join(" • ") || item.meta || item.id,
    summary: enh.summary || sanitizeString(details?.Plot) || item.summary || "No description available for this title yet.",
    poster: finalPoster,
    genre: enh.genre || genre,
    director: enh.director || creator,
    tags: enh.tags || buildCatalogTags(genre, item.title),
    popularityScore: calculateCatalogPopularity(details, item.rank),
    availabilityLabel: enh.availabilityLabel || "Search OTT",
    watchUrl: enh.watchUrl || buildJustWatchSearchUrl(item.title),
    releaseLabel: enh.releaseLabel || "",
    releaseDate: enh.releaseDate || "",
  };
}

async function fetchImdbSearchResults(query) {
  const bucket = encodeURIComponent(query[0] || "a");
  const response = await fetchWithRetry(`https://v3.sg.media-imdb.com/suggestion/${bucket}/${encodeURIComponent(query)}.json`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload?.d)) return [];
  return payload.d.filter(isSearchableImdbEntry).map((entry) => ({
    id: entry.id, title: String(entry.l || "").trim(), year: String(entry.y || ""),
    type: normalizeCatalogType(entry.qid || entry.q), meta: sanitizeString(entry.s),
    summary: "", poster: normalizePosterUrl(entry.i?.imageUrl), rank: Number(entry.rank || 0),
  }));
}

async function fetchOmdbSearchResults(query) {
  if (!omdbApiKey) return [];
  const firstPageResponse = await fetchWithRetry(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&s=${encodeURIComponent(query)}&page=1`);
  const firstPagePayload = await firstPageResponse.json().catch(() => ({}));
  if (!firstPageResponse.ok || firstPagePayload?.Response === "False") return [];
  const totalResults = Number.parseInt(String(firstPagePayload.totalResults || "0"), 10) || 0;
  const totalPages = Math.min(omdbMaxPages, Math.max(1, Math.ceil(totalResults / 10)));
  const extraPages = await Promise.all(Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => {
    const page = index + 2;
    return fetchWithRetry(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&s=${encodeURIComponent(query)}&page=${page}`)
      .then((r) => r.json().catch(() => ({ Response: "False" })));
  }));
  return dedupeCatalogResultsById([
    ...(firstPagePayload.Search || []),
    ...extraPages.flatMap((p) => p?.Response === "True" ? p.Search || [] : []),
  ].map((entry) => ({
    id: entry.imdbID, title: String(entry.Title || "").trim(), year: String(entry.Year || ""),
    type: normalizeCatalogType(entry.Type), meta: "", summary: "", poster: normalizePosterUrl(entry.Poster), rank: 0,
  })));
}

async function fetchCatalogDetails(imdbId) {
  if (!omdbApiKey || !imdbId) return null;
  return readThroughCache(catalogDetailCache, imdbId, async () => {
    const response = await fetchWithRetry(`https://www.omdbapi.com/?apikey=${encodeURIComponent(omdbApiKey)}&i=${encodeURIComponent(imdbId)}&plot=short`);
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload?.Response === "False") return null;
    return payload;
  });
}

async function resolveCatalogPoster(item) {
  const directPoster = normalizePosterUrl(item.details?.Poster || item.poster);
  if (directPoster) return directPoster;
  const cacheKey = `${normalizeSearchText(item.title)}:${String(item.year || "")}:${item.type}`;
  return readThroughCache(catalogPosterCache, cacheKey, async () => {
    const posterLoaders = item.type === "series"
      ? [() => fetchTvMazePoster(item.title, item.year), () => fetchItunesPoster(item.title, item.year)]
      : [() => fetchItunesPoster(item.title, item.year), () => fetchTvMazePoster(item.title, item.year)];
    return pickFastestCatalogPoster(posterLoaders);
  });
}

async function pickFastestCatalogPoster(loaders) {
  const tasks = loaders.map((loadPoster) => Promise.resolve().then(loadPoster).then((url) => {
    const normalized = normalizePosterUrl(url);
    if (!normalized) throw new Error("Poster unavailable");
    return normalized;
  }));
  try { return await Promise.any(tasks); } catch { return ""; }
}

async function fetchItunesPoster(title, year) {
  const response = await fetchWithTimeout(`https://itunes.apple.com/search?term=${encodeURIComponent(title)}&media=movie&entity=movie&limit=8`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(payload?.results)) return "";
  const match = pickBestPosterCandidate(payload.results.map((item) => ({
    title: item.trackName, year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : "",
    poster: item.artworkUrl100 ? item.artworkUrl100.replace(/100x100bb/g, "600x600bb") : "",
  })), title, year);
  return normalizePosterUrl(match?.poster);
}

async function fetchTvMazePoster(title, year) {
  const response = await fetchWithTimeout(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(title)}`);
  const payload = await response.json().catch(() => ([]));
  if (!response.ok || !Array.isArray(payload)) return "";
  const match = pickBestPosterCandidate(payload.map((item) => ({
    title: item.show?.name, year: item.show?.premiered ? new Date(item.show.premiered).getFullYear() : "",
    poster: item.show?.image?.original || item.show?.image?.medium || "",
  })), title, year);
  return normalizePosterUrl(match?.poster);
}

function pickBestPosterCandidate(candidates, title, year) {
  const normalizedTitle = normalizeSearchText(title);
  const targetYear = Number.parseInt(String(year || "0"), 10) || 0;
  return candidates
    .filter((c) => normalizePosterUrl(c.poster))
    .map((c) => ({ ...c, score: scoreCatalogSearchTerm(normalizeSearchText(c.title), normalizedTitle, 1000) + (targetYear && Number(c.year) === targetYear ? 120 : 0) }))
    .sort((a, b) => b.score - a.score)[0] || null;
}

// ---- TMDB trailer ----

async function fetchTmdbTrailer(tmdbId) {
  if (!tmdbApiKey || !tmdbId) return null;
  try {
    const url = new URL(`https://api.themoviedb.org/3/movie/${tmdbId}/videos`);
    url.searchParams.set("api_key", tmdbApiKey);
    const response = await fetchWithTimeout(url.toString());
    const data = await response.json().catch(() => ({}));
    const trailer = (data.results || []).find((v) => v.type === "Trailer" && v.site === "YouTube");
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
  } catch { return null; }
}

// ---- Home dashboard ----

async function buildHomeDashboard(userId, region) {
  const storedProfile = await getProfile(userId);
  const profile = await withComputedRecommendations(storedProfile, userId);
  const [sections, liked, currentlyWatching, wishlist, releaseReminders, aiRecommendations] = await Promise.all([
    fetchGlobalHomeSections(region),
    enrichMovieCollection(profile.liked, region, 6),
    enrichMovieCollection(profile.currentlyWatching, region, 6),
    enrichMovieCollection(profile.wishlist, region, 6),
    enrichMovieCollection(profile.releaseReminders, region, 6),
    enrichMovieCollection(profile.aiRecommendations, region, 8),
  ]);
  return {
    source: sections.source, message: sections.message,
    sections: { trending: sections.trending, anticipated: sections.anticipated, upcoming: sections.upcoming },
    library: { liked, currentlyWatching, wishlist, releaseReminders, aiRecommendations },
  };
}

async function fetchGlobalHomeSections(region) {
  const sourceKey = tmdbApiKey ? `tmdb:${region}` : `fallback:${region}`;
  return readThroughCache(homeDashboardCache, sourceKey, async () => {
    if (tmdbApiKey) {
      try { return await fetchTMDbHomeSections(region); }
      catch (error) { log("warn", "TMDb home discovery failed, falling back to public feeds", { error: String(error) }); }
    }
    return fetchFallbackHomeSections(region);
  });
}

async function fetchTMDbHomeSections(region) {
  const today = new Date().toISOString().slice(0, 10);
  const inNinetyDays = new Date(Date.now() + (1000 * 60 * 60 * 24 * 90)).toISOString().slice(0, 10);
  const [trendingRes, popMoviesRes, popTVRes, upcomingMoviesRes, upcomingTVRes] = await Promise.allSettled([
    fetchTMDbList("/trending/all/week", { language: "en-US" }),
    fetchTMDbList("/movie/popular", { language: "en-US" }),
    fetchTMDbList("/tv/popular", { language: "en-US" }),
    fetchTMDbList("/movie/upcoming", { language: "en-US", region }),
    fetchTMDbList("/discover/tv", { language: "en-US", include_null_first_air_dates: "false", sort_by: "popularity.desc", "first_air_date.gte": today, "first_air_date.lte": inNinetyDays }),
  ]);
  const getResults = (r) => r.status === "fulfilled" ? (r.value.results || []) : [];
  const trendingRaw = getResults(trendingRes).filter((i) => i.media_type !== "person");
  const popMoviesRaw = getResults(popMoviesRes).map((i) => ({ ...i, media_type: "movie" }));
  const popTVRaw = getResults(popTVRes).map((i) => ({ ...i, media_type: "tv" }));
  const upcomingMoviesRaw = getResults(upcomingMoviesRes)
    .map((i) => ({ ...i, media_type: "movie" }))
    .filter((i) => (i.release_date || "") >= today);
  const upcomingTVRaw = getResults(upcomingTVRes).map((i) => ({ ...i, media_type: "tv" }));
  const allTrending = dedupeByKey([...trendingRaw, ...popMoviesRaw, ...popTVRaw], (i) => `${i.media_type}:${i.id}`)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const allUpcomingByDate = dedupeByKey([...upcomingMoviesRaw, ...upcomingTVRaw], (i) => `${i.media_type}:${i.id}`)
    .sort((a, b) => getTmdbReleaseTimestamp(a) - getTmdbReleaseTimestamp(b));
  const allUpcomingByPop = dedupeByKey([...upcomingMoviesRaw, ...upcomingTVRaw], (i) => `${i.media_type}:${i.id}`)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const trending = allTrending.slice(0, 30).map((i) => buildTMDbItem(i, i.media_type)).filter(Boolean);
  const upcoming = allUpcomingByDate.slice(0, 30).map((i) => buildTMDbItem(i, i.media_type, { hideRating: true })).filter(Boolean);
  const anticipated = allUpcomingByPop.slice(0, 20).map((i) => buildTMDbItem(i, i.media_type)).filter(Boolean);
  return {
    source: "tmdb", message: `Live movie and OTT data powered by TMDb for ${region}.`,
    trending, anticipated, upcoming,
  };
}

async function fetchFallbackHomeSections(region) {
  const [itunesMovies, tvUpcoming] = await Promise.all([fetchItunesTopMovies(region), fetchTvMazeUpcoming(region)]);
  const trending = dedupeByKey([...itunesMovies.slice(0, 4), ...tvUpcoming.slice(0, 4)], (i) => `${i.type}:${normalizeSearchText(i.title)}`).slice(0, 6).map((i) => normalizeLiveMovie(i)).filter(Boolean);
  return {
    source: "fallback-live",
    message: "Live public feeds are active. Add TMDb for region-aware OTT providers and richer release metadata.",
    trending, anticipated: [...tvUpcoming, ...itunesMovies].slice(0, 6).map((i) => normalizeLiveMovie(i)).filter(Boolean),
    upcoming: tvUpcoming.slice(0, 6).map((i) => normalizeLiveMovie(i)).filter(Boolean),
  };
}

async function enrichMovieCollection(movies, region, limit) {
  const slice = (movies || []).slice(0, limit);
  return Promise.all(slice.map((movie) => resolveLiveTitleEnhancement(movie, region)));
}

async function resolveLiveTitleEnhancement(movie, region = tmdbRegion) {
  const fallback = normalizeLiveMovie(movie);
  if (!tmdbApiKey) return fallback;
  try {
    const ref = await resolveTMDbReference(movie);
    if (!ref) return fallback;
    const detail = await fetchTMDbTitleDetail(ref.type, ref.id, region);
    return detail || fallback;
  } catch { return fallback; }
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
    if (rawId.startsWith("tmdb-")) {
      const parts = rawId.split("-");
      const type = parts[1] === "series" ? "series" : "movie";
      const id = Number(parts[2]);
      if (id) return { id, type };
    }
    const endpoint = normalizedType === "series" ? "/search/tv" : "/search/movie";
    const payload = await fetchTMDbList(endpoint, { query: normalizedTitle, year: normalizedType === "movie" ? String(movie?.year || "") : undefined, first_air_date_year: normalizedType === "series" ? String(movie?.year || "") : undefined, include_adult: "false", language: "en-US" });
    const match = pickBestTMDbSearchMatch(payload.results || [], normalizedTitle, movie?.year);
    return match ? { id: match.id, type: normalizedType } : null;
  });
}

async function fetchTMDbTitleDetail(type, tmdbId, region = tmdbRegion) {
  const mediaType = type === "series" ? "tv" : "movie";
  const cacheKey = `${mediaType}:${tmdbId}:${region}`;
  return readThroughCache(tmdbDetailCache, cacheKey, async () => {
    const payload = await fetchTMDbList(`/${mediaType}/${tmdbId}`, { language: "en-US", append_to_response: mediaType === "movie" ? "watch/providers,external_ids,release_dates,credits" : "watch/providers,external_ids,content_ratings,credits" });
    return mapTMDbPayloadToMovie(payload, type, region);
  });
}

function mapTMDbPayloadToMovie(payload, type, region) {
  if (!payload || typeof payload !== "object" || !payload.id) return null;
  const title = sanitizeString(payload.title || payload.name);
  const year = String((payload.release_date || payload.first_air_date || "").slice(0, 4) || "Year unknown");
  const genre = Array.isArray(payload.genres) ? payload.genres.map((i) => i.name).filter(Boolean).slice(0, 2).join(", ") : "";
  const rating = Number(payload.vote_average || 0) > 0 ? `TMDb ${Number(payload.vote_average || 0).toFixed(1)}` : "";
  const meta = [genre, rating].filter(Boolean).join(" • ") || `${type === "series" ? "Series" : "Movie"}`;
  const providers = getTMDbProviders(payload, region);
  const watchUrl = sanitizeString(payload["watch/providers"]?.results?.[region]?.link) || buildJustWatchSearchUrl(title);
  const imdbId = sanitizeString(payload.external_ids?.imdb_id);
  return {
    id: imdbId || `tmdb-${type}-${payload.id}`, title, year, type, meta,
    summary: sanitizeString(payload.overview) || "No description available for this title yet.",
    poster: payload.poster_path ? `https://image.tmdb.org/t/p/w780${payload.poster_path}` : "",
    genre,
    director: sanitizeString(payload.credits?.crew?.find((c) => c.job === "Director")?.name || ""),
    cast: (payload.credits?.cast || []).slice(0, 5).map((a) => sanitizeString(a.name)).filter(Boolean),
    providers,
    tags: buildCatalogTags(genre, title),
    availabilityLabel: providers.length > 0 ? providers.join(", ") : "Search OTT",
    watchUrl, releaseLabel: buildTMDbReleaseLabel(payload, type, region),
    releaseDate: type === "series"
      ? sanitizeString(payload.next_episode_to_air?.air_date || payload.first_air_date)
      : sanitizeString(pickTMDbMovieReleaseDate(payload.release_dates?.results, region) || payload.release_date),
    popularityScore: Number(payload.popularity || 0) * 1000,
    ids: { tmdb: String(payload.id) },
  };
}

function buildTMDbReleaseLabel(payload, type, region) {
  if (type === "series") {
    const next = payload.next_episode_to_air?.air_date;
    if (next) return `Next episode ${formatReleaseDateLabel(next)}`;
    if (payload.first_air_date) return `First aired ${formatReleaseDateLabel(payload.first_air_date)}`;
    return "";
  }
  const releaseDate = pickTMDbMovieReleaseDate(payload.release_dates?.results, region) || payload.release_date;
  return releaseDate ? `Releases ${formatReleaseDateLabel(releaseDate)}` : "";
}

function pickTMDbMovieReleaseDate(results, region) {
  const regionEntry = Array.isArray(results) ? results.find((i) => i.iso_3166_1 === region) : null;
  const datedEntry = regionEntry?.release_dates?.find((i) => sanitizeString(i.release_date));
  return datedEntry?.release_date || "";
}

function getTMDbProviders(payload, region) {
  const providerResult = payload["watch/providers"]?.results?.[region];
  const providers = [...(providerResult?.flatrate || []), ...(providerResult?.rent || []), ...(providerResult?.buy || [])]
    .map((i) => sanitizeString(i.provider_name)).filter(Boolean);
  return [...new Set(providers)].slice(0, 3);
}

async function fetchTMDbList(endpoint, params = {}) {
  if (!tmdbApiKey) throw new Error("TMDb is not configured.");
  const url = new URL(`https://api.themoviedb.org/3${endpoint}`);
  url.searchParams.set("api_key", tmdbApiKey);
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value); });
  const response = await fetchWithRetry(url);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.status_message || `TMDb request failed for ${endpoint}.`);
  return payload;
}

function buildTMDbLightItem(raw) {
  if (!raw?.id || !raw?.title) return null;
  const title = sanitizeString(raw.title);
  if (!title) return null;
  const year = String((raw.release_date || "").slice(0, 4) || "Year unknown");
  const genreTags = (raw.genre_ids || []).map((id) => TMDB_GENRE_ID_TO_TAG[id]).filter(Boolean);
  const langTag = TMDB_LANG_TO_TAG[raw.original_language] || null;
  const tags = [...new Set([...genreTags, ...(langTag ? [langTag] : [])])];
  const genre = genreTags.slice(0, 2).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
  return {
    id: `tmdb-movie-${raw.id}`,
    title, year, type: "movie",
    meta: genre || "Movie",
    summary: sanitizeString(raw.overview) || "No description available.",
    poster: raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : "",
    genre, tags,
    availabilityLabel: "Search OTT",
    watchUrl: buildJustWatchSearchUrl(title),
    releaseLabel: "",
    popularityScore: Number(raw.popularity || 0) * 1000,
    ids: { tmdb: String(raw.id) },
  };
}

function buildTMDbItem(raw, mediaType, options = {}) {
  if (!raw?.id) return null;
  const isTV = mediaType === "tv";
  const title = sanitizeString(isTV ? (raw.name || raw.title) : (raw.title || raw.name));
  if (!title) return null;
  const rawDate = isTV ? (raw.first_air_date || raw.release_date) : (raw.release_date || raw.first_air_date);
  const year = String((rawDate || "").slice(0, 4) || "Year unknown");
  const type = isTV ? "series" : "movie";
  const genreTags = (raw.genre_ids || []).map((id) => TMDB_GENRE_ID_TO_TAG[id]).filter(Boolean);
  const langTag = TMDB_LANG_TO_TAG[raw.original_language] || null;
  const tags = [...new Set([...genreTags, ...(langTag ? [langTag] : [])])];
  const genre = genreTags.slice(0, 2).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(", ");
  const rating = !options.hideRating && Number(raw.vote_average || 0) > 0 ? `TMDb ${Number(raw.vote_average || 0).toFixed(1)}` : "";
  const meta = [genre, rating].filter(Boolean).join(" • ") || (isTV ? "Series" : "Movie");
  const poster = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : "";
  if (!poster) return null;
  return {
    id: `tmdb-${type}-${raw.id}`,
    title, year, type, meta,
    summary: sanitizeString(raw.overview) || "No description available.",
    poster, genre, tags,
    availabilityLabel: "Search OTT",
    watchUrl: buildJustWatchSearchUrl(title),
    releaseLabel: rawDate ? `${isTV ? "Airs" : "Releases"} ${formatReleaseDateLabel(rawDate)}` : "",
    releaseDate: sanitizeString(rawDate),
    popularityScore: Number(raw.popularity || 0) * 1000,
    originalLanguage: raw.original_language || "",
    ids: { tmdb: String(raw.id) },
  };
}

async function fetchTMDbDiscoverMovies(genreIds, region, options = {}) {
  const langKey = options.lang || (options.withoutEnglish ? "noneng" : "all");
  const cacheKey = `discover:${genreIds.join(",")}:${region}:${langKey}`;
  return readThroughCache(moodDiscoverCache, cacheKey, async () => {
    const params = {
      language: "en-US", sort_by: "vote_average.desc",
      "vote_count.gte": options.minVotes || 500,
      include_adult: false, with_genres: genreIds.join(","),
    };
    if (options.lang) params.with_original_language = options.lang;
    else if (options.withoutEnglish) params.without_original_language = "en";
    const payload = await fetchTMDbList("/discover/movie", params);
    return (payload.results || []).map(buildTMDbLightItem).filter(Boolean).slice(0, options.limit || 12);
  });
}

function selectTMDbMatchFromFind(payload, type) {
  if (type === "series") return Array.isArray(payload?.tv_results) ? payload.tv_results[0] || null : null;
  return Array.isArray(payload?.movie_results) ? payload.movie_results[0] || null : null;
}

function pickBestTMDbSearchMatch(results, title, year) {
  const normalizedTitle = normalizeSearchText(title);
  const targetYear = Number.parseInt(String(year || "0"), 10) || 0;
  return (results || []).map((item) => {
    const candidateTitle = normalizeSearchText(item.title || item.name || "");
    const candidateYear = Number.parseInt(String(item.release_date || item.first_air_date || "0").slice(0, 4), 10) || 0;
    return { ...item, score: scoreCatalogSearchTerm(candidateTitle, normalizedTitle, 1000) + (targetYear && candidateYear === targetYear ? 180 : 0) + Number(item.popularity || 0) };
  }).sort((a, b) => b.score - a.score)[0] || null;
}

async function fetchItunesTopMovies(region) {
  const regionKey = String(region || "us").toLowerCase();
  return readThroughCache(itunesFeedCache, `itunes:${regionKey}`, async () => {
    const response = await fetchWithRetry(`https://rss.marketingtools.apple.com/api/v2/${regionKey}/movies/top-movies/25/movies.json`);
    const payload = await response.json().catch(() => ({}));
    const results = Array.isArray(payload?.feed?.results) ? payload.feed.results : [];
    return results.map((item) => ({
      id: `itunes-${item.id}`, title: sanitizeString(item.name), year: String(item.releaseDate || "").slice(0, 4) || "Year unknown",
      type: "movie", meta: "Apple top chart", summary: sanitizeString(item.artistName) || "Live chart title from Apple Movies.",
      poster: normalizePosterUrl(item.artworkUrl100 ? item.artworkUrl100.replace(/200x200/g, "600x600") : ""),
      tags: ["live", "chart", "movie"], availabilityLabel: "Apple charting now",
      watchUrl: buildJustWatchSearchUrl(item.name),
      releaseLabel: item.releaseDate ? `Released ${formatReleaseDateLabel(item.releaseDate)}` : "",
      releaseDate: sanitizeString(item.releaseDate), popularityScore: 500000,
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
    const response = await fetchWithTimeout(`https://api.tvmaze.com/schedule/web?country=${encodeURIComponent(region || "US")}&date=${dateKey}`);
    const payload = await response.json().catch(() => ([]));
    return Array.isArray(payload) ? payload : [];
  })));
  return dedupeByKey(pages.flat().map((item) => ({
    id: `tvmaze-${item.show?.id || item.id}`, title: sanitizeString(item.show?.name),
    year: String(item.show?.premiered || "").slice(0, 4) || "Year unknown", type: "series",
    meta: sanitizeString(item.show?.genres?.slice(0, 2).join(", ")) || "Upcoming series",
    summary: sanitizeString(item.show?.summary).replace(/<[^>]+>/g, "") || "Upcoming episode schedule from TVMaze.",
    poster: normalizePosterUrl(item.show?.image?.original || item.show?.image?.medium || ""),
    tags: ["live", "upcoming", "series"], availabilityLabel: sanitizeString(item.show?.network?.name || item.show?.webChannel?.name) || "Search OTT",
    watchUrl: buildJustWatchSearchUrl(item.show?.name),
    releaseLabel: item.airstamp ? `Airs ${formatReleaseDateLabel(item.airstamp)}` : "",
    releaseDate: sanitizeString(item.airstamp), popularityScore: Number(item.show?.weight || 0) * 1000,
  })).filter((item) => isRenderableHomeTitle(item)), (item) => item.id).slice(0, 12);
}

// ---- Recommendation engine ----

async function withComputedRecommendations(profile, userId) {
  return { ...profile, aiRecommendations: await buildServerAiRecommendations(profile, userId) };
}

async function buildServerAiRecommendations(profile, userId) {
  if (!Array.isArray(profile?.liked) || profile.liked.length === 0) return [];
  const tasteSignals = await collectServerTasteSignals(profile, userId);
  const watchedIds = new Set((profile.watched || []).map((i) => i.movieId));
  const wishlistIds = new Set((profile.wishlist || []).map((i) => i.id));
  const likedIds = new Set((profile.liked || []).map((i) => i.id));
  const watchingIds = new Set((profile.currentlyWatching || []).map((i) => i.id));

  let candidates = [];
  if (tmdbApiKey) {
    try {
      const cacheKey = "ai-candidates";
      candidates = await readThroughCache(tmdbTopRatedCache, cacheKey, async () => {
        const [topRated, trending] = await Promise.all([
          fetchTMDbList("/movie/top_rated", { language: "en-US", page: 1 }),
          fetchTMDbList("/trending/movie/week", { language: "en-US" }),
        ]);
        return dedupeByKey([
          ...(trending.results || []),
          ...(topRated.results || []),
        ], (r) => String(r.id)).map(buildTMDbLightItem).filter(Boolean);
      });
    } catch (error) {
      log("warn", "TMDb candidate fetch failed for recommendations", { error: String(error) });
    }
  }

  if (candidates.length === 0) return [];

  const likedMovies = profile.liked || [];
  return candidates
    .filter((m) => !watchedIds.has(m.id) && !wishlistIds.has(m.id) && !likedIds.has(m.id) && !watchingIds.has(m.id))
    .map((movie) => {
      const tasteScore = (movie.tags || []).reduce((total, tag) => total + (tasteSignals.get(tag) || 0), 0);
      let basedOn = null;
      let bestOverlap = 0;
      for (const liked of likedMovies) {
        const overlap = (movie.tags || []).filter((t) => (liked.tags || []).includes(t)).length;
        if (overlap > bestOverlap) { bestOverlap = overlap; basedOn = liked.title; }
      }
      return { movie: { ...movie, basedOn }, score: tasteScore };
    })
    .sort((a, b) => b.score - a.score || a.movie.title.localeCompare(b.movie.title))
    .slice(0, 8).map((e) => e.movie);
}

async function collectServerTasteSignals(profile, userId) {
  const counts = new Map();
  (profile.liked || []).forEach((movie) => { (movie.tags || []).forEach((tag) => { counts.set(tag, (counts.get(tag) || 0) + 3); }); });
  (profile.watched || []).forEach((item) => {
    const watchedMovie = [...(profile.liked || []), ...(profile.wishlist || [])].find((m) => m.id === item.movieId);
    (watchedMovie?.tags || []).forEach((tag) => { counts.set(tag, (counts.get(tag) || 0) + 1); });
  });
  await Promise.all((profile.friendIds || []).map(async (friendId) => {
    const friendProfile = await getProfile(friendId);
    (friendProfile.liked || []).forEach((movie) => { (movie.tags || []).forEach((tag) => { counts.set(tag, (counts.get(tag) || 0) + 1); }); });
    (friendProfile.sentRecommendations || []).forEach((item) => {
      if (item.toUserId === userId) { (item.movie?.tags || []).forEach((tag) => { counts.set(tag, (counts.get(tag) || 0) + 2); }); }
    });
  }));
  return counts;
}

async function buildAppState(userId) {
  const user = sanitizeUser(await getUserById(userId));
  const storedProfile = await getProfile(userId);
  const reminderUpdatesApplied = applyScheduledReleaseReminders(storedProfile);
  if (reminderUpdatesApplied) await upsertProfile(userId, storedProfile);
  const profile = await withComputedRecommendations(storedProfile, userId);
  const relatedIds = new Set(profile.friendIds);
  profile.incomingRequests.forEach((i) => relatedIds.add(i.fromUserId));
  profile.outgoingRequests.forEach((i) => relatedIds.add(i.toUserId));
  profile.friendRecommendationInbox.forEach((i) => relatedIds.add(i.fromUserId));
  profile.sentRecommendations.forEach((i) => relatedIds.add(i.toUserId));
  const relatedUsers = (await Promise.all([...relatedIds].map(getUserById))).filter(Boolean).map(sanitizeUser);
  return { user, profile, relatedUsers };
}

function buildProviderConfig(oauthConfig) {
  return {
    providers: {
      google: { configured: Boolean(oauthConfig.googleClientId), clientId: oauthConfig.googleClientId },
      microsoft: { configured: Boolean(oauthConfig.microsoftClientId), clientId: oauthConfig.microsoftClientId, authority: oauthConfig.microsoftAuthority },
      apple: { configured: Boolean(oauthConfig.appleClientId && oauthConfig.appleRedirectUri), clientId: oauthConfig.appleClientId, redirectUri: oauthConfig.appleRedirectUri },
    },
  };
}

// ---- Utility functions ----

function normalizeLiveMovie(movie) {
  if (!isRenderableHomeTitle(movie)) return null;
  const normalized = normalizeMovie(movie) || normalizeMovie({ id: String(movie?.id || createUniqueId("live")), title: String(movie?.title || "Unknown title"), year: String(movie?.year || "Year unknown"), type: normalizeCatalogType(movie?.type), meta: String(movie?.meta || ""), summary: String(movie?.summary || "No description available for this title yet."), poster: String(movie?.poster || ""), genre: String(movie?.genre || ""), director: String(movie?.director || ""), tags: Array.isArray(movie?.tags) ? movie.tags : [], availabilityLabel: String(movie?.availabilityLabel || "Search OTT"), watchUrl: String(movie?.watchUrl || buildJustWatchSearchUrl(movie?.title || "")), releaseLabel: String(movie?.releaseLabel || ""), releaseDate: String(movie?.releaseDate || "") });
  return normalized;
}

function createUniqueId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function isRenderableHomeTitle(movie) {
  const title = sanitizeString(movie?.title);
  if (!title || /^(unknown title|untitled)$/i.test(title)) return false;
  return Boolean(normalizePosterUrl(movie?.poster));
}

function getTmdbReleaseTimestamp(item) {
  return new Date(item.release_date || item.first_air_date || "9999-12-31").getTime();
}

function formatReleaseDateLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "").slice(0, 10);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function buildJustWatchSearchUrl(title) {
  return `https://www.justwatch.com/us/search?q=${encodeURIComponent(title || "")}`;
}

function sanitizeString(value) {
  const next = String(value || "").trim();
  return next && next !== "N/A" ? next : "";
}

function normalizePosterUrl(value) {
  const poster = String(value || "").trim();
  if (!poster || !poster.startsWith("http")) return "";
  return poster.replace(/^http:\/\//i, "https://");
}

function normalizeSearchText(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();
}

function normalizeCatalogType(value) {
  const type = String(value || "").toLowerCase();
  return type.includes("series") ? "series" : "movie";
}

function isSearchableImdbEntry(entry) {
  if (!entry || typeof entry.id !== "string" || !entry.id.startsWith("tt") || !entry.l) return false;
  return ["movie", "tvseries", "tvminiseries", "tvmovie"].includes(String(entry.qid || "").toLowerCase());
}

function dedupeCatalogResultsById(items) {
  const seen = new Set();
  return items.filter((item) => {
    const id = item?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id); return true;
  });
}

function tokenizeSearchText(value) {
  return String(value || "").toLowerCase().split(/[^a-z0-9]+/).map((p) => p.trim()).filter(Boolean);
}

function calculateCatalogResultSearchScore(movie, query) {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return 0;
  const normalizedTitle = normalizeSearchText(movie.title);
  const titleWords = tokenizeSearchText(movie.title);
  const shortQuery = normalizedQuery.length <= 3;
  const titleScore = scoreCatalogSearchTerm(normalizedTitle, normalizedQuery, 2200);
  const wordScore = Math.max(...titleWords.map((word) => scoreCatalogSearchTerm(word, normalizedQuery, 1900)), 0);
  const metaScore = shortQuery ? 0 : scoreCatalogSearchTerm(normalizeSearchText(movie.meta), normalizedQuery, 700);
  const tagScore = shortQuery ? 0 : Math.max(...(Array.isArray(movie.tags) ? movie.tags : []).map((tag) => scoreCatalogSearchTerm(normalizeSearchText(tag), normalizedQuery, 900)), 0);
  const prefixBonus = normalizedTitle.startsWith(normalizedQuery) ? 1200 : titleWords.some((w) => w.startsWith(normalizedQuery)) ? 900 : 0;
  const bestScore = Math.max(titleScore, wordScore, metaScore, tagScore);
  if (bestScore === 0) return 0;
  return bestScore + prefixBonus + Math.min(400, (movie.popularityScore || 0) / 50000);
}

function compareCatalogTitles(left, right) {
  const popularityDelta = (right.popularityScore || 0) - (left.popularityScore || 0);
  if (popularityDelta !== 0) return popularityDelta;
  const yearDelta = Number.parseInt(String(right.year || "0"), 10) - Number.parseInt(String(left.year || "0"), 10);
  if (!Number.isNaN(yearDelta) && yearDelta !== 0) return yearDelta;
  return String(left.title || "").localeCompare(String(right.title || ""));
}

function compareCatalogTitlesForQuery(query) {
  return (left, right) => {
    const matchDelta = calculateCatalogResultSearchScore(right, query) - calculateCatalogResultSearchScore(left, query);
    if (matchDelta !== 0) return matchDelta;
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
  const genreTags = genre ? genre.split(",").map((i) => i.trim().toLowerCase()) : [];
  const titleTags = String(title || "").toLowerCase().split(/\s+/).filter((w) => w.length > 3).slice(0, 3);
  return [...new Set([...genreTags, ...titleTags])];
}

function scoreCatalogSearchTerm(candidate, query, baseScore) {
  if (!candidate || !query) return 0;
  if (candidate === query) return baseScore + 400;
  if (candidate.startsWith(query)) return baseScore + 260 - Math.max(0, candidate.length - query.length);
  if (candidate.includes(query)) return baseScore + 160;
  return 0;
}

module.exports = {
  fetchWithTimeout, fetchWithRetry,
  searchCatalogTitles, fetchCatalogDetails, resolveCatalogPoster, resolveLiveTitleEnhancement,
  fetchTmdbTrailer, fetchTMDbTitleDetail, buildHomeDashboard, fetchTMDbDiscoverMovies,
  withComputedRecommendations, buildAppState, buildProviderConfig,
  sanitizeString, normalizePosterUrl, normalizeSearchText, normalizeCatalogType, buildJustWatchSearchUrl,
  buildCatalogTags, dedupeByKey: dedupeCatalogResultsById,
};
