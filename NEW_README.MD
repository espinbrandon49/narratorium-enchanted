Narratorium

Narratorium is a real-time, collaborative storytelling experiment built around a single, shared story.
Anyone can read. Authenticated users can contribute. The story evolves live — without refresh — as new writing is added.

This is an Etch-A-Sketch that never shakes back to its original state.

What It Is

Narratorium is not a collaborative canvas and not a shared document editor.

It is an enchanted story space:

contributions are additive, not destructive

meaning emerges through accumulation, not erasure

collaboration happens in real time, but history is preserved

The result is a living narrative shaped by many voices, constrained by scarcity rather than overwrite.

Core Philosophy

One shared story
The server defines a single canonical story. There is no story creation or selection.

Append-only collaboration
Users add text; they do not delete or overwrite existing contributions.

Server-authoritative rules
Limits are enforced by the server (not the client, not per user).

Realtime first
All connected clients converge on the same state instantly via sockets — no reloads.

Key Features

🌍 Public read access — anyone can view the story

✍️ Authenticated writing — only logged-in users can contribute

⚡ Realtime updates — live patches propagate instantly across all users

🧠 Intent-based writes — clients send text intent; the server validates and applies it

🔒 Single mutation path — all writes flow through one socket event

What Narratorium Is Not

❌ No collaborative white-out or scratch-offs

❌ No per-user authority over limits

❌ No REST story endpoints

❌ No multiple stories or drafts

❌ No silent overwrites

Conflict is resolved through what gets added, not what gets erased.

Technical Overview
Architecture

Frontend: React (Vite)

Backend: Node.js + Express

Realtime: Socket.IO

Persistence: Relational database (append-only submissions → tokens)

Data Model (Conceptual)

Submission — an immutable writing event (intent)

Token — the canonical story state derived from submissions

Realtime Flow

Client connects via socket

Server assigns the default story

Client receives a full resync snapshot

Authenticated users submit text intent

Server validates, persists, and broadcasts patches

All clients update instantly — no refresh

Limits & Constraints

Character limits are server-defined

Enforced at:

database schema

service layer

shared constants

The client may display counters (e.g. 72 / 200) but never decides limits

Why This Project

Narratorium explores a different collaboration model:

What happens when people write with each other —
not over each other — in real time?

From a technical standpoint, it demonstrates:

realtime state convergence

server-authoritative mutation

clean separation of intent and state

deliberate system design guided by philosophy, not just features

Status

This project is intentionally scoped and frozen around its core loop:

realtime collaborative writing

single shared story

append-only contributions

Future ideas (moderation roles, enhanced tooling) are conceptual only and not part of the current build.
