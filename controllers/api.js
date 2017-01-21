const validator = require('validator');
const passport = require('passport');

const User = require('../models/User');

/**
 * POST /api/signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('firstName', 'First name was not valid.').notEmpty();
    req.assert('lastName', 'Last name was not valid.').notEmpty();
    req.assert('email', 'Email is not valid.').isEmail();
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirmPassword', 'Passwords do not match.').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const user = new User({
        profile: {
            firstName: req.body.firstName,
            lastName: req.body.lastName
        },
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (existingUser) {
            return res.status(400).json([{
                msg: 'Account with that email address already exists.'
            }]);
        }
        user.save((err) => {
            if (err) {
                return res.status(500).json([{
                    msg: "Server failure."
                }]);
            }
            req.logIn(user, (err) => {
                return res.status(200).json({
                    user: user
                });
            });
        });
    });
};

/**
 * POST /api/login
 * Sign in to API using email and password.
 */
exports.postLogin = (req, res, next) => {
    req.assert('email', 'Email is not valid.').isEmail();
    req.assert('password', 'Password cannot be blank.').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json([{
                msg: "Server failure."
            }]);
        }
        if (!user) {
            return res.status(401).json([{
                msg: "Unauthorized: email and password do not match."
            }]);
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json([{
                    msg: "Server failure."
                }]);
            }
            return res.status(200).json({
                user: user
            });
        });
    })(req, res, next);
};

/**
 * POST /api/account
 * Update account info.
 */
exports.postAccount = (req, res, next) => {
    req.assert('id', 'User id was not specified.').notEmpty();
    req.assert('key', 'Key was not specified.').notEmpty();
    req.assert('value', 'Value was not specified.').notEmpty();
    if (req.body.key == 'email' && req.body.value) {
        req.assert('value', 'Email value is not valid.').isEmail();
    }

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const id = req.body.id;
    const key = req.body.key;
    const value = req.body.value;

    User.findById(id, (err, user) => {
        if (err) {
            return next(err);
        }
        if (key == 'email') {
            user.email = value;
        } else if (key == 'firstName' || key == 'lastName' || key == 'location' || key == 'website') {
            user.profile.key = value;
        } else {
            return res.status(400).json([{
                msg: "Invalid key."
            }]);
        }
        user.save((err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                msg: value + ' has been changed.'
            });
        });
    });
};

/**
 * POST /api/account/balance
 * Deposit money to, or remove money from a user's account.
 */
exports.postBalance = (req, res, next) => {
    req.assert('id', 'User id was not specified.').notEmpty();
    req.assert('value', 'Value was not specified/is not valid.').notEmpty().isFloat().gt(0);

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const id = req.body.id;
    const value = Math.round(parseFloat(req.body.value) * 100) / 100;

    User.findById(id, (err, user) => {
        if (err) {
            return next(err);
        }
        var balance = parseFloat(user.account.balance);
        if (balance + value < 0) {
            user.account.balance = 0;
            return res.status(200).json({
                msg: 'Balance has been changed to 0.'
            });
        }
        user.account.balance = Math.round((balance + value) * 100) / 100;
        user.save((err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                msg: 'Balance has been changed.',
                balance: user.account.balance
            });
        });
    });
};
