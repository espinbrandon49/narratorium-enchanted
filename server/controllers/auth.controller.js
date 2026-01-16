const { User } = require("../models");
const { ok, fail } = require("../utils/apiResponse");

exports.signup = async (req, res, next) => {
    try {
        const { username, email, password } = req.body || {};

        if (!username || !email || !password) {
            return fail(
                res,
                { code: "INVALID_SIGNUP", message: "username, email, and password are required" },
                400
            );
        }

        const user = await User.create({ username, email, password });

        req.session.userId = user.id;

        ok(res, {
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !user.checkPassword(password)) {
            return fail(res, { code: "INVALID_CREDENTIALS" }, 401);
        }

        req.session.userId = user.id;

        ok(res, {
            id: user.id,
            username: user.username,
            email: user.email,
        });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => ok(res));
};

exports.me = async (req, res, next) => {
    try {
        if (!req.session.userId) {
            return ok(res, null);
        }

        const user = await User.findByPk(req.session.userId, {
            attributes: ["id", "username", "email"],
        });

        ok(res, user);
    } catch (err) {
        next(err);
    }
};
