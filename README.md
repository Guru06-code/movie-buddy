# Movie Buddy

Movie Buddy runs as a single Node.js app that serves the frontend and a SQLite-backed API from the same origin.

## Run

```powershell
cd "d:\AI Projects\movie-buddy-web"
node server.js
```

Open http://127.0.0.1:4173.

If `node server.js` fails from the workspace root, you are in the wrong folder. Start it from `d:\AI Projects\movie-buddy-web`.

## Current feature set

- Email/password auth is server-backed instead of localStorage.
- Profiles, wishlists, liked titles, currently watching, release reminders, friend requests, notifications, and recommendation state are stored in SQLite under `data/movie-buddy.sqlite`.
- Sessions are persisted with an HTTP-only cookie.
- Title search is server-backed and cached. The server combines IMDb suggestion search with OMDb enrichment and caches search, detail, and poster responses in memory.
- The home dashboard is server-backed through `/api/home/dashboard`.
- AI recommendations now use only titles the user explicitly marked as liked.
- Release radar, trending, anticipated titles, and OTT/watch links are live-data driven when TMDb is configured.
- A dedicated library editor lets you reorder and reclassify wishlist, liked, currently watching, and reminder shelves.
- Release reminders now persist lead time, delivery hour, and timezone settings, and due reminder notifications are generated on the server when state refreshes.
- Browser push reminders are supported through a service worker and a background server scheduler, so release alerts can fire even when the Movie Buddy tab is closed.

## Live Dashboard And OTT Data

Movie Buddy supports two home-data modes:

- With `TMDB_API_KEY`: trending, anticipated, upcoming, release labels, and region-aware OTT providers come from TMDb.
- Without `TMDB_API_KEY`: the app falls back to public-feed enrichment and JustWatch search links, so the dashboard still works but OTT provider detail is best-effort.

Set these before starting the app if you want the full live-discovery path:

```powershell
$env:TMDB_API_KEY="your-tmdb-api-key"
$env:TMDB_REGION="US"
node server.js
```

Notes:

- `TMDB_REGION` controls provider and release-region lookup. Default is `US`.
- Without TMDb, the app still runs and the cards fall back to OTT search links instead of direct provider metadata.

## Browser Push Reminders

Movie Buddy can deliver release reminders as browser push notifications on localhost or a deployed HTTPS origin.

- The browser prompts for notification permission from the reminder settings panel in the library editor.
- The server runs a background reminder sweep every 60 seconds by default and sends due reminders to stored browser subscriptions.
- If `PUSH_VAPID_PUBLIC_KEY` and `PUSH_VAPID_PRIVATE_KEY` are not set, Movie Buddy generates and stores local VAPID keys in `data/movie-buddy-vapid.json`.

Optional environment variables:

```powershell
$env:PUSH_VAPID_PUBLIC_KEY="your-public-vapid-key"
$env:PUSH_VAPID_PRIVATE_KEY="your-private-vapid-key"
$env:PUSH_VAPID_SUBJECT="mailto:you@example.com"
$env:REMINDER_SCHEDULER_INTERVAL_MS="60000"
node server.js
```

Notes:

- Keep the same VAPID keys across deploys or existing browser subscriptions will need to be re-enabled.
- Browser push requires notification permission plus either `localhost` or HTTPS.

## OAuth Buttons

The Google, Apple, and Microsoft buttons read provider app configuration from server environment variables.

Until those credentials are configured, the buttons still work in prototype mode by asking for a name and email, then creating a social account through the OAuth backend endpoint. Replace this demo flow before go-live.

```powershell
$env:GOOGLE_CLIENT_ID="your-google-web-client-id"
$env:MICROSOFT_CLIENT_ID="your-microsoft-entra-app-client-id"
$env:MICROSOFT_AUTHORITY="https://login.microsoftonline.com/common"
$env:APPLE_CLIENT_ID="your-apple-services-id"
$env:APPLE_REDIRECT_URI="http://127.0.0.1:4173"
node server.js
```

Provider notes:

- Google: authorize `http://127.0.0.1:4173` as a JavaScript origin for the web client.
- Microsoft: register `http://127.0.0.1:4173` as a SPA redirect URI for popup sign-in.
- Apple: the redirect URI must exactly match the Services ID configuration in Apple Developer.

## Password Reset

Password reset is server-backed, but OTP delivery is still development mode. The server returns a preview OTP so the flow can be tested locally without SMTP or SMS credentials.

## End-To-End Test

Playwright coverage is included for the main flow, social notifications, and the library editor plus reminder-preference flow.

```powershell
cd "d:\AI Projects\movie-buddy-web"
npm install
npm run test:e2e
```

The Playwright config starts the local server automatically against `http://127.0.0.1:4173/api/health`.