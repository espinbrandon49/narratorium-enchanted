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
