const { User } = require("../models");
const { ok, fail } = require("../utils/apiResponse");

exports.signup = async (req, res, next) => {
    try {
        const user = await User.create(req.body);
        req.session.userId = user.id;
        ok(res, { id: user.id });
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
        ok(res, { id: user.id });
    } catch (err) {
        next(err);
    }
};

exports.logout = (req, res) => {
    req.session.destroy(() => ok(res));
};

exports.me = (req, res) => {
    ok(res, req.session.userId ? { id: req.session.userId } : null);
};
