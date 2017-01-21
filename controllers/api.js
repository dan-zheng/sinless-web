const validator = require('validator');
const passport = require('passport');

const User = require('../models/User');

/**
 * POST /api/login
 * Sign in to API using email and password.
 */
exports.postLogin = (req, res, next) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({
            message: "Email/password not specified."
        });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.status(400).json({
            message: "Invalid email."
        });
    }

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(400).json({
                message: "Authentication failure."
            });
        }
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized: email and password do not match."
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(400).json({
                    message: "Authentication failure."
                });
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
    const id = req.body.id;
    const key = req.body.key;
    const value = req.body.value;

    if (!id) {
        return res.status(400).json({
            message: "User id not specified."
        });
    }
    if (!key || !value) {
        return res.status(400).json({
            message: "Key/value not specified."
        });
    }
    if (key != 'email' && key != 'firstName' && key != 'lastName' && key != 'location' && key != 'website') {
        return res.status(400).json({
            message: "Invalid key."
        });
    }
    if (key == 'email' && !validator.isEmail(value)) {
        return res.status(400).json({
            message: "Invalid value."
        });
    } else if (value.length === 0 &&
        (key == 'firstName' || key == 'lastName' || key == 'location' || key == 'website')) {
        return res.status(400).json({
            message: "Invalid value."
        });
    }

    User.findById(id, (err, user) => {
        if (err) {
            return next(err);
        }
        if (key == 'email') {
            user.email = value;
        } else if (key == 'firstName' || key == 'lastName' || key == 'location' || key == 'website') {
            user.profile.key = value;
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
    const id = req.body.id;
    const value = Math.round(parseFloat(req.body.value) * 100) / 100;

    if (!id) {
        return res.status(400).json({
            message: "User id not specified."
        });
    }
    if (!req.body.value || isNaN(value) || value === 0) {
        return res.status(400).json({
            message: "Value not specified/valid."
        });
    }

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
