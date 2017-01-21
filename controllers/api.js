const validator = require('validator');
const passport = require('passport');
const mongoose = require('mongoose');
const moment = require('moment');

const User = require('../models/User');

/**
 * POST /api/signup
 * Create a new local account.
 */
exports.postSignup = (req, res, next) => {
    req.assert('firstName', 'First name is not valid.').notEmpty();
    req.assert('lastName', 'Last name is not valid.').notEmpty();
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
    } else if (req.body.key == 'balance' && req.body.value) {
        req.assert('value', 'Balance value was not specified/is not valid.').notEmpty().isFloat().gte(0);
    } else if (req.body.key == 'dailySwearMax' && req.body.value) {
        req.assert('value', 'Daily swear max value was not specified/is not valid.').notEmpty().isInt().gte(0);
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
            return res.status(500).json([{
                msg: "Server failure."
            }]);
        }
        if (!user) {
            return res.status(400).json([{
                msg: "User could not be found."
            }]);
        }
        if (key == 'email') {
            user[key] = value;
        } else if (key == 'balance') {
            user.account[key] = Math.round(parseFloat(req.body.value) * 100) / 100;
        } else if (key == 'dailySwearMax') {
            user.account[key] = value;
        } else if (key == 'firstName' || key == 'lastName' || key == 'location' || key == 'website') {
            user.profile[key] = value;
        } else {
            return res.status(400).json([{
                msg: "Invalid key."
            }]);
        }
        user.save((err) => {
            if (err) {
                return res.status(500).json([{
                    msg: "Server failure."
                }]);
            }
            return res.status(200).json({
                msg: key + ' has been changed.',
                value: value
            });
        });
    });
};

/**
 * POST /api/account/action/swear
 * Update daily swear count.
 */
exports.postActionSwear = (req, res, next) => {
    req.assert('id', 'User id was not specified.').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }
    var count = req.body.count || 1;
    User.findById(req.body.id, (err, user) => {
        if (err) {
            return res.status(500).json([{
                msg: "Server failure."
            }]);
        }
        if (!user) {
            return res.status(400).json([{
                msg: "User could not be found."
            }]);
        }
        var currDate = moment();

        user.data.swear.push({
            date: currDate,
            swearCount: count
        });
        user.save((err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                msg: 'Swear data has been updated.'
            });
        });
    });
};
