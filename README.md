# NARRATORIUM 

## Description 
Narratorium is a collabrative story-telling website designed to allow anyone on the site to contribute to a single story. User contributions are limited by day, but otherwise the content of the story is determined entirely by the consensus of all users, even if that consensus is a chaotic string of words competing for space and existence. 

The site is build on a websocket connection using Socket.io and is capable of updating in real time as users make changes. Upon making a change to the story, the server database and the client-side for every other user is updated.

The site can be accessed [here](https://narratorium.herokuapp.com/).
* Username - guest@tryme.com
* Password - literati

# 
# [![A video thumbnail shows the homepage of the NARRATORIUM application with a play button overlaying the view.](./public/images/demo_video_image.png)](https://user-images.githubusercontent.com/102924713/183820514-704c1e23-6693-48f4-ab18-77de0a7ed6d3.mp4)

## Table of Contents

* [Usage](#usage)
* [Features](#features)
* [Contribution](#contributing)
* [Credits](#credits)
* [Installation](#installation)
* [License](#license)
***

## Usage 

To use the site visit the live link above. Anyone can view the story, but making changes requires signing up. Once logged in, double click a word to insert text after that word, or to delete the selected word. 

Character and delete limits reset every day; if you believe the limits should have reset try refreshing the page. The reset is independant of time zones.
***

## Features

The site includes some key features that help encourage creativity over simply adding random text. Firstly, users must create an account and log in, and changes per day are limited. Users can add up to 100 characters a day and delete 10 words; these limits can be seen in the rich text edior on the site. The character counter is dynamic, while typing in the editor it changes to reflect how many characters you would have left if you submitted your changes, but your actual limit only alters on submission.

The site also allows users to click on a word to display a brief tooltip showing the username of the submittor and a timestamp, so that anyone can peruse the variety of people who have contributed to the story. 

The site also has the capacity to support several additional features, such as the ability to rename a story, add a story, and preserve the formatting of the text users submit. These features are currently under development.
***

## Contributing

To contribute, send in a pull request! 
***

## Installation
Browser:
* Runs in the browser
* Deployed Link: [https://narratorium.herokuapp.com/](https://narratorium.herokuapp.com/)

Clone:

Download and install [Node.js](https://nodejs.org/en/download/)
Clone the repository
```bash
git@github.com:Corasinth/narratorium.git
```
Run npm install to install the npm dependencies from the [package.json](./package.json)
```bash
npm install
```
Create the development database
* Go to the directory of schema.sql

* Open a MySQL shell and enter this command
```
source schema.sql
```
Seed the database with test data (optional)

* Open a terminal and enter this command 
```
npm run seed
```
Invoke the application to start the server
* In the terminal enter this command
```
npm run watch
```
***

## Credits

The icon was sourced from [flaticon.io](https://www.flaticon.com/free-icon/pen-tool_1014859?term=pen&page=1&position=10&page=1&position=10&related_id=1014859&origin=tag)

### Created by:

[Abdur-Rauf Ahmed](https://github.com/Corasinth)  
[Brandon Espinosa](https://github.com/espinbrandon49)  
[Damien Armstrong](https://github.com/pirosvs)  
[Seah Oh](https://github.com/seannoh)  
***

## [License](./LICENSE)
This website uses the open-source MIT License.
***


Phase 1 Gate Check (Token-related)

✅ Token exists
✅ DB enforces max length
✅ Server enforces max length
✅ Canonical timestamps
✅ No transport leakage

Token portion of Phase 1 is now solid.

If you want next:

full story.service.js tokenization flow

or submit-event length enforcement (200)

or Phase 1 FREEZE commit message

Just say which.

what is the purpose of the token?

Short, canonical answer — no fluff.

What a Token Is (in Narratorium)

A token is the smallest immutable unit of story state.

One word (or symbol) = one token.

It exists so the system can enforce order, limits, and concurrency safely.

Why tokens exist (the real reasons)
1️⃣ Deterministic ordering (no ambiguity)

Stories are built word-by-word, not message-by-message.

Tokens give you:

Stable ordering (position)

Predictable reindexing

Conflict-safe inserts

Without tokens, “insert text at position 37” becomes ambiguous.

2️⃣ Concurrency safety (multi-user edits)

Multiple users can submit at the same time.

Tokens allow:

Increment-based reindexing

UNIQUE (story_id, position) enforcement

Safe windowed inserts without collisions

This is why DB constraints matter.

3️⃣ Fairness + limits enforcement

Your app has daily limits.

Tokens make it trivial to enforce:

Character budgets

Submission size caps

Delete costs per word

Limits apply to tokens, not arbitrary blobs.

4️⃣ Replay, audit, and resync

Tokens make the story rebuildable.

You can:

Rehydrate a story from tokens

Stream partial windows (last N tokens)

Resync a client after disconnect

This is critical for sockets.

5️⃣ Future features become easy

Tokens unlock features without refactors:

Undo / rollback

Highlighting who wrote what

Moderation / redaction

AI summaries per token range

Time-travel playback

Why NOT just store strings?
Strings	Tokens
Hard to reindex	Deterministic
Race conditions	DB-safe
Hard limits	Easy limits
Painful diffing	Natural diff
Poor sockets fit	Perfect sockets fit

Strings are fine for blogs.
They fail under live collaboration.

Important clarification (your design intent)

In Narratorium:

Submission = event (“user X submitted 5 words at pos 12”)

Token = state (“the word ‘dragon’ exists at position 14”)

This separation is intentional and correct.

If you removed tokens…

You would:

Lose DB-enforced ordering guarantees

Push integrity into socket logic (❌)

Make concurrency bugs inevitable

Block future features

Tokens are not over-engineering here —
they are the minimum correct abstraction.

Bottom line

Tokens exist so the database—not sockets—owns truth.

That’s why Phase 1 is DB-first.

If you want, next I can:

Show a before/after of a socket insert with tokens

Diagram the Submission → Token → Story flow

Or confirm whether tokens should be words or graphemes

Just say which.

so submissions are turned into tokens?

Yes — exactly.
Here is the canonical model, stated cleanly and unambiguously:

Canonical Rule

Submissions are transient events.
Tokens are persistent state.

A submission is input.
A token is what actually exists in the story.

What happens when a user submits text

User submits:

"the red dragon sleeps"

Step-by-step (authoritative flow)

Submission is received

Validate auth

Validate length ≤ 200 chars

Validate limits

Submission is normalized

Whitespace normalized

Split into tokens

["the", "red", "dragon", "sleeps"]


Tokens are inserted

Each token becomes a row

Each token gets:

story_id

position

user_id

created_at

Submission may be logged

Optional

For audit / replay / analytics only

Story state = tokens

Always rebuilt from tokens

Never from submissions

Why this separation matters
Concern	Submission	Token
User input	✅	❌
Ordering	❌	✅
Concurrency	❌	✅
Limits	⚠️	✅
Persistence	⚠️	✅
Rebuild story	❌	✅
Invariants (never break these)

Tokens are append-only state

Positions are globally ordered per story

Submissions never own ordering

Sockets never mutate ordering directly

DB enforces uniqueness and limits

Very important architectural note

Your current code treats Submission as both:

event and

state

That is fine for now, but:

🔜 Phase 2+ should shift ordering to Tokens
🔒 Phase 1 just establishes the canonical rules.

Practical simplification (if you want it)

If you decide later that:

Submissions are unnecessary long-term

You can:

Make submissions ephemeral (not stored)

Or remove them entirely

Tokens still remain correct.

Final one-line answer

Yes — submissions are turned into tokens, and tokens are the story.

If you want next:

exact story.service.js insert logic

socket → service → DB flow

or whether submissions should even be stored

Say the word.

Submissions are transient events.

we are storing submissions in the db?

Short answer first, then the precise clarification you’re asking for.

Short answer (canonical)

Yes — right now, submissions are stored in the DB.
But they are log entries, not authoritative story state.

That’s what “transient events” means in architecture terms, not “never persisted.”

The important distinction (this is the key)

When we say:

“Submissions are transient events”

we mean conceptually, not physically.

Transient ≠ not stored

Transient = not the source of truth

How this works in Narratorium (clean mental model)
1️⃣ Submissions (event log)

Stored in DB ✅

Represent what happened

Used for:

Audit / moderation

Analytics

Abuse detection

Replay (optional)

Never used to rebuild story state

Think: “User X submitted text Y at time T.”

2️⃣ Tokens (state)

Stored in DB ✅

Represent what exists

Used for:

Rendering stories

Ordering

Resyncing clients

Concurrency control

Single source of truth

Think: “These words exist at these positions.”

Why we still store submissions (even though they’re transient)

Because deleting them would cost you power later.

What submissions give you that tokens don’t

Original unnormalized text

Submission boundaries

Intent (one action vs many tokens)

Rate-limiting / abuse analysis

Easy rollback of one action

They are cheap to store and valuable to keep.

What would be wrong (and what you’re avoiding)

❌ Treating submissions as:

Ordered story content

Renderable source

Rebuild input

That’s the architectural mistake.

You are not making that mistake.

If we rewrote the rule precisely

Submissions are persisted events, but not authoritative state.
Tokens are persisted state and the only ordering truth.

That is the exact, correct phrasing.

Final clarity check (binary)
Question	Answer
Are submissions stored in the DB?	✅ Yes
Are they transient in memory only?	❌ No
Are they the source of truth?	❌ No
Are tokens the source of truth?	✅ Yes
Is this architecture sound?	✅ Yes (portfolio-grade)

If you want, next we can:

Rename Submission to SubmissionEvent (purely semantic)

Decide whether submissions should ever be deleted

Define retention rules (keep forever vs prune)

But your understanding right now is correct.

I get it, Submission is fine

Perfect 👍
That means you’ve locked the correct mental model, which is the hard part.

To make it explicit (and to freeze it):