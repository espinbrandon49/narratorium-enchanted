# Narratorium
🌐 **Live Site:** https://narratorium-e41b5a6a7718.herokuapp.com/
🎥 **Demo Video:** https://youtu.be/FWBsMkzeACk

> *“Narratorium is a fire that never goes out — it changes only by what is added to it, and it burns most brightly in the moments we are present together.”*

Narratorium is a **real-time, collaborative story space** built around a single shared narrative.  
Anyone may read. Authenticated users may write — **only during shared windows of time** called *Openings*.

The story is append-only, server-authoritative, and permanent.  
Nothing is erased. Meaning emerges through accumulation.

---

## What This Is

- **One shared story**, defined and owned by the server
- **Public reading**, no account required
- **Authenticated writing**, gated by time
- **Realtime collaboration**, no refresh required
- **Append-only state**, enforced at the database level

Narratorium is **not** a document editor, chat app, or whiteboard.  
Collaboration happens by *arrival*, not overwrite.

---

## Core Rules (Canonical)

- One default story (no creation, no selection)
- Writing is append-only
- Ordering and limits are enforced server-side
- Clients send intent; the server decides
- Tokens are the source of truth

---

## The Opening

Writing is only allowed during **The Opening** — a short, recurring window shared by all users.

- Fixed schedule (anchored to UTC+01:00)
- Repeats every 12 hours
- Open for 30 minutes
- Fully enforced by the server

When the Opening is closed, the story remains readable.  
The system renders the current state and the next opening time.

> The Opening is not permission — it is presence.  
> The story does not belong to its contributors. It opens itself.

---

## Architecture Overview

### Tech Stack

- **Server:** Node.js, Express
- **Database:** MySQL (Sequelize ORM)
- **Auth:** Session-based (cookies)
- **Realtime:** Socket.io
- **Client:** React (Vite)
- **Deployment:** Heroku monolith (React build served by Express)

### Data Model (Conceptual)

- **Submission** — a persisted event (user intent)
- **Token** — the smallest immutable unit of story state

Submissions are logged.  
Tokens are authoritative.

The story is always rebuilt from tokens — never from submissions.

---

## Realtime Flow

1. Client connects via Socket.io
2. Server assigns the default story
3. Client receives a snapshot (bounded window)
4. Authenticated users submit text intent
5. Server validates, tokenizes, persists, and broadcasts patches
6. All clients update instantly

No refresh. No client authority.

---

## Limits & Integrity

- Max submission length: **200 characters**
- Max token length: **48 characters**
- Deterministic ordering via `(story_id, position)`
- Database enforces uniqueness and bounds
- Client counters are informational only

The database owns truth.

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

The app runs as a **single server**:
API, sockets, sessions, and frontend are all served together.

---

## Production Smoke Test (Gate)

- App loads from root URL
- Signup creates a session
- Login persists after refresh
- Logout clears session
- Public users can read
- Authenticated users can write during Opening
- Submissions sync live without refresh
- Socket reconnect preserves identity
- Opening open/close broadcasts correctly

---

## Scope Note

This README describes **the system as deployed**.  
The project is intentionally scoped and frozen around its core loop.

Future ideas (moderation, multiple stories, tooling) are conceptual only and **not part of this build**.
