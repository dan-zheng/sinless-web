const validator = require('validator');
const passport = require('passport');

/**
 * POST /api/login
 * Sign in to API using email and password.
 */
exports.postLogin = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        res.status(400).json({
            message: "Email/password not specified."
        });
        return;
    }
    if (!validator.isEmail(req.body.email)) {
        res.status(400).json({
            message: "Email is invalid."
        });
        return;
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            res.status(400).json({
                message: "Authentication failure."
            });
            return;
        }
        if (!user) {
            res.status(401).json({
                message: "Unauthorized: email and password do not match."
            });
            return;
        }
        req.logIn(user, (err) => {
            if (err) {
                res.status(400).json({
                    message: "Authentication failure."
                });
                return;
            }
            res.status(200).json({
                user: user
            });
            return;
        });
    })(req, res, next);
};
