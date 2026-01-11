# Narratorium Modernization — Canonical Build Order

**Source of truth for the Narratorium modernization.**  
This document defines the final architecture, sequencing, and non-negotiable gates.

---

## Target Stack

- **Frontend:** React + Tailwind (Enchanted Storybook Theme)
- **Backend:** Express + Sequelize + MySQL
- **Auth:** Session cookies (`express-session`)
- **HTTP:** Axios (single entrypoint)
- **Realtime:** Socket.io (patch-first)
- **Editor:** Quill (typing surface only)
- **Deployment:** Heroku monolith

**Build sequence:**  
**DB → API → Frontend → Styling → Deployment**

---

## Phase 0 — Freeze Baseline
- Tag baseline release
- Create `/REVAMP.md` (scope, decisions, gates)
- Record current repo state (commit hash)

**Gate:** Baseline is recoverable.

---

## DB

### Phase 1 — Data Layer Canonicalization
- Normalize timestamps strategy:
  - `timestamps: true` everywhere
  - keep `last_logged_in` as a domain field
- Keep `Submission.position` as the ordering truth
- Add DB constraints:
  - **UNIQUE (story_id, position)**
  - **position >= 1**
  - **submission token length max = 48 characters**
- Add server validation:
  - reject tokens > 48 chars
  - enforce max submit event length = 200 chars

**Gate:** DB enforces integrity and canonical rules.

---

## API

### Phase 2 — Backend App Composition (Express + Sessions)
- `app.js`: middleware, sessions, routes, one error handler
- `server.js`: http server + Socket.io wiring
- Environment hygiene (no hardcoded secrets)

**Gate:** Server boots cleanly using env vars only.

### Phase 3 — HTTP Auth API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- Unified response envelope: `{ ok, data, error }`

**Gate:** Session auth works across refresh.

### Phase 4 — Socket.io Realtime API
- Socket logic extracted into `/sockets`
- Business logic in `/services`
- Session-derived identity only (no client `user_id`)
- Patch-first updates:
  - `story:join`
  - `story:patch`
  - `story:resync` (escape hatch)

**Gate:** Realtime sync works without refresh.

---

## Frontend

### Phase 5 — React Core Loop
- Vite React app with routes `/`, `/login`, `/signup`
- Axios layer (single entrypoint)
- Socket layer (single entrypoint)
- Quill:
  - toolbar removed
  - typing surface only
  - plain text extraction
- Client sends intent only; server decides

**Gate:** Core loop works end-to-end locally.

---

## Styling

### Phase 6 — Tailwind + Enchanted Storybook Theme
- Tailwind installed
- Fonts:
  - Lora (body)
  - Cinzel or Cormorant (titles)
- Parchment background
- Page-card story container
- Wax-seal buttons
- Margin-note tooltips
- Minimal global CSS (fonts + Quill overrides only)

**Gate:** One styling system; whimsical + readable.

---

## Reliability

### Phase 7 — L/E/E Everywhere
- Loading states
- Empty states
- Error states (auth, limits, socket disconnect)
- No silent failures

**Gate:** No blank screens.

---

## Performance Identity

### Phase 8 — Living Window Soft Cap
- DB stores all submissions
- Render/send only the most recent **10,000 words**
- No historical browsing required

**Gate:** Performance remains stable as stories grow.

---

## Deployment

### Phase 9 — Heroku Monolith
- React build served by Express
- Production-safe session cookies
- Socket.io verified in prod
- Env vars configured

**Gate:** Deployed app passes smoke tests.

---

## Finalization

### Phase 10 — Smoke Tests
- Auth flow
- Story join
- Insert/delete patches
- Limits enforced
- Socket reconnect handling

**Gate:** Core loop passes in under 3 minutes.

### Phase 11 — README + Demo
- Modern brief README
- 60–90s demo video
- Project history + attribution note

**Gate:** App understandable in under 2 minutes.

---

## Canonical Non-Negotiables
- Patch-first realtime
- Server-authoritative identity
- No client-side security
- One HTTP client (Axios)
- One realtime client (Socket wrapper)
- One response envelope
- DB integrity constraints
- Quill = typing only
- Tailwind-only styling
- Living window (10,000 words)

```
server/
  package.json
  .env.example

  app.js                      // express app composition (middleware, sessions, routes, error handler)
  server.js                   // http server + socket.io init + attachSockets + listen

  config/
    connection.js             // sequelize connection (env-driven)
    sessionStore.js           // connect-session-sequelize store config (optional)
    cors.js                   // (optional) only if needed; monolith often avoids this

  models/
    index.js                  // init + associations (single source of truth)
    User.js
    Story.js
    Submission.js

  db/
    seed.js                   // optional (dev/demo seed)
    migrations/               // optional if you choose migrations
    schema/                   // optional SQL notes (if you keep any)

  routes/
    index.js                  // mounts /api routes
    auth.routes.js            // /api/auth/*
    story.routes.js           // optional: REST story endpoints (if any)

  controllers/
    auth.controller.js        // signup/login/logout/me (JSON-only)
    story.controller.js       // optional: REST endpoints (snapshot/resync, etc.)

  middleware/
    requireAuth.js            // REST guard (session-derived)
    validate.js               // request validation helpers (optional)
    errorHandler.js           // one error handler (REST)
    notFound.js               // 404 JSON responder

  sockets/
    index.js                  // attachSockets(io)
    story.socket.js           // story events: join/patch/resync (no DB logic)
    socketAuth.js             // session → socket user resolver (optional)

  services/
    story.service.js          // core domain: view window, insert, delete, reindex, limits
    limits.service.js         // UTC midnight reset logic (optional split)
    token.service.js          // tokenize/normalize (optional, can live in utils)

  utils/
    apiResponse.js            // { ok, data, error }
    AppError.js               // error class + codes (optional)
    dates.js                  // UTC midnight helpers
    text.js                   // normalizeWhitespace + tokenizeWords
    constants.js              // STORY_WINDOW_SIZE=10000, TOKEN_MAX=48, EVENT_MAX=200

  public/
    favicon.ico               // optional (or served from client build)

  client-build/               // NOT in repo: build output served by express (dist) (ignore via .gitignore)
```
