const SequelizeStore = require("connect-session-sequelize")(require("express-session").Store);
const sequelize = require("./connection");

function createSessionStore() {
    const store = new SequelizeStore({
        db: sequelize,
        tableName: "sessions",
        checkExpirationInterval: 15 * 60 * 1000, // 15 min
        expiration: Number(process.env.SESSION_TTL_MS || 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    return store;
}

module.exports = createSessionStore;
