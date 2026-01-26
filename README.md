# Narratorium

A real-time collaborative story space where authenticated users contribute text to a shared, server-authoritative narrative. Writing is gated by time-based “Openings” enforced by the server. Reading is public; writing requires login.

---

## Tech Stack

- **Server:** Node.js, Express, Sequelize (MySQL)
- **Auth:** Session-based (cookies)
- **Realtime:** Socket.io
- **Client:** React (Vite build)
- **Deployment:** Heroku monolith (React build served by Express)

---

## Local Setup

### Environment Variables
```
DB_NAME
DB_USER
DB_PASSWORD
DB_HOST
DB_PORT

SESSION_SECRET
SESSION_TTL_MS
CLIENT_ORIGIN
DEFAULT_STORY_NAME
NODE_ENV
```

### Run
```
npm install
npm run build
npm start
```

App runs as a single server serving API, sockets, and frontend.

---

## Core Behavior

- One server-defined default story
- Public read (join + resync)
- Authenticated write only
- Append-only story state
- Server enforces token limits and ordering
- Time-based Opening window enforced server-side

---

## Smoke Test Checklist (Prod Gate)

- App loads from root URL
- Signup creates user and session
- Login persists after refresh
- Logout clears session
- Public user can read story
- Authenticated user can submit during Opening
- Submission appears live without refresh
- Socket reconnect does not break session
- Opening open/close events broadcast correctly

---

## Notes

This README is intentionally minimal and reflects the system **as deployed**, not future plans.  
A portfolio README will replace this after production verification.
