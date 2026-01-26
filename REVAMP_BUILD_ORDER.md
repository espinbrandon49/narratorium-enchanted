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
- Keep Token.position as the ordering truth (deterministic ordering is token-based)
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

# Phase 5 — React Core Loop (FREEZE TEXT)

## Paradigm (Option C): Server-defined default story
- MVP supports **one default story** chosen by the server.
- Story is **publicly readable** (unauthenticated users can view/resync and receive live updates).
- Story is **editable only by authenticated users** (session-derived identity; server-enforced).
- Client does **not** implement story selection, story creation, or multi-story routing.

---

## Scope (What Phase 5 builds)

### Routes
- Vite React app with:
  - `/` (story view + input)
  - `/login`
  - `/signup`

### Transport layers (single entrypoints)
- **HTTP (Axios) single entrypoint**
  - Used **only** for `/api/auth/*`
  - No axios/fetch anywhere outside the HTTP client module
- **Socket single entrypoint**
  - Used **only** for story realtime
  - No raw `socket.emit/on` outside the socket client module

### Editor (Quill)
- Quill is used as **typing surface only**
  - Toolbar removed
  - Plain text extraction only
  - Client sends **intent** only (`submit_event` as plain text)

### Realtime core loop (socket-first)
- On `/` load:
  - connect socket
  - join **default story** (no client-provided storyId)
  - resync snapshot
- Writing:
  - authenticated users can emit `story:patch` with `{ submit_event }`
  - unauthenticated users cannot patch (UI disabled + server rejects)

### Reliability (minimum L/E/E)
- `/` has:
  - loading state (initial connect/resync)
  - empty state (no tokens yet)
  - error state + retry (connect/resync failure)
- submit has:
  - disabled while sending
  - clear error surfaced if rejected (401 / too long / etc.)

---

## Explicit MVP Anti-Goals (Forbidden in Phase 5)
- ❌ No REST story/token endpoints (no `/api/story`, no `/api/token`)
- ❌ No story controllers/routes added
- ❌ No story list, selection UI, or `/story/:id` routing
- ❌ No story creation
- ❌ No second write path (sockets are the only write path)
- ❌ No client authority over story existence (server decides default story)

---

## README “Project Soul” Note (Required)
Add this sentence near the top of the README (or a short “Philosophy” section):

> “This is an Etch-A-Sketch that never shakes back to its original state.”

---

## Gate (Phase 5)
✅ **Gate:** Core loop works end-to-end locally:
- A brand-new visitor can open `/` and **read** the default story (initial snapshot + live updates) without logging in.
- An authenticated user can **write** by submitting plain-text `submit_event` and see updates propagate without refresh.
- Axios usage is confined to the single auth client module.
- Socket usage is confined to the single socket client module.
- No story selection logic exists in the client, and no REST story endpoints exist on the server.

**Phase 5 FREEZE condition:** Once the gate passes, tag/freeze and proceed to Phase 6 only if a new capability is required.

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

Phase 8 — Living Window Soft Cap (Token-Based)

DB stores all submissions + tokens (full history preserved server-side)

Client renders/receives only the most recent STORY_WINDOW_SIZE tokens (default: 10,000)

“Most recent” is defined by highest Token.position

No historical browsing in MVP (older tokens never sent to client)

Gate: Realtime + resync payload stays bounded; performance remains stable as stories grow.

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

**************FRONTEND*****************
client/
├─ package.json
├─ vite.config.js
├─ index.html
└─ src/
   ├─ main.jsx                # Vite entry
   ├─ App.jsx                 # Router + AppShell only
   │
   ├─ app/
   │  ├─ AppShell.jsx         # Layout, nav, auth status
   │  └─ routes.jsx           # Route definitions ONLY
   │
   ├─ pages/
   │  ├─ StoryPage.jsx        # "/" – core loop
   │  ├─ LoginPage.jsx        # "/login"
   │  └─ SignupPage.jsx       # "/signup"
   │
   ├─ realtime/
   │  ├─ socket.js            # 🔒 SINGLE socket entrypoint
   │  └─ story.js             # story-specific socket helpers
   │
   ├─ api/
   │  ├─ http.js              # 🔒 SINGLE axios instance
   │  └─ auth.js              # login/signup/logout/me
   │
   ├─ editor/
   │  └─ QuillEditor.jsx      # typing surface only (no toolbar)
   │
   ├─ hooks/
   │  ├─ useAuth.js           # auth state (REST-backed)
   │  └─ useStory.js          # story state (socket-backed)
   │
   ├─ components/
   │  ├─ StoryView.jsx        # renders tokens
   │  ├─ SubmitBar.jsx        # submit intent UI
   │  └─ LoadingState.jsx
   │
   ├─ state/
   │  └─ storyReducer.js      # optional local reducer
   │
   ├─ styles/
   │  └─ app.css
   │
   └─ utils/
      └─ guards.js            # small invariants (optional)
