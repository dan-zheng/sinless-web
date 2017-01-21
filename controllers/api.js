const validator = require('validator');
const passport = require('passport');
const mongoose = require('mongoose');
const moment = require('moment');
const chance = new require('chance')();

const User = require('../models/User');

/**
 * GET /api
 * API home page.
 */
exports.index = (req, res) => {
    res.render('api/home', {
        title: 'API',
        user: req.user
    });
};


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
 * POST /api/signup/hack
 * Create a new local account with good dates.
 */
exports.postSignupHack = (req, res, next) => {
    const email = req.body.email || "a@a.com";
    const password = req.body.password || "asdf";
    const user = new User({
        profile: {
            firstName: "John",
            lastName: "Smith"
        },
        email: "a@a.com",
        password: "12345"
    });

    var numOfActions = req.body.numOfActions || 3;

    User.findOne({ email: email }, (err, existingUser) => {
        if (err) {
            return res.status(500).json([{
                msg: "Server failure."
            }]);
        }
        if (existingUser) {
            existingUser.email = email;
            existingUser.password = password;
            existingUser.data = [];
            let temp = moment();
            for (var i = 0; i < 7; i++) {
                temp = moment(temp).subtract(1, 'days');
                console.log(temp);
                existingUser.data.push({
                    date: temp,
                    swearCount: 0,
                    timerCount: 0,
                    actions: []
                });
                var entry = existingUser.data[i];
                for (var j = 0; j < numOfActions; j++) {
                    var penalty = 0;
                    var type;
                    if (Math.random() < 0.5) {
                        type = 'swear';
                        if (entry.swearCount >= user.account.dailySwearMax) {
                            penalty = 1;
                        }
                        entry.swearCount++;
                    } else {
                        type = 'timer';
                        if (entry.timerCount >= user.account.dailyTimerMax) {
                            penalty = 1;
                        }
                        entry.timerCount++;
                    }
                    temp.subtract(15, 'minutes');
                    existingUser.data[i].actions.push({
                        time: temp.add(5, 'minutes'),
                        actionType: type,
                        amountDeducted: penalty
                    });
                }
            }
            existingUser.save((err) => {
                if (err) {
                    return res.status(500).json([{
                        msg: "Server failure."
                    }]);
                }
                req.logIn(existingUser, (err) => {
                    return res.status(200).json({
                        user: existingUser
                    });
                });
            });
            return;
        }
        let temp = moment();
        for (let i = 0; i < 7; i++) {
            temp = moment(temp).subtract(1, 'days');
            user.data.push({
                date: temp,
                swearCount: 0,
                timerCount: 0,
                actions: []
            });
            let entry = user.data[i];
            for (let j = 0; j < numOfActions; j++) {
                let penalty = 0;
                let type;
                if (Math.random() < 0.5) {
                    type = 'swear';
                    if (entry.swearCount >= user.account.dailySwearMax) {
                        penalty = 1;
                    }
                    entry.swearCount++;
                } else {
                    type = 'timer';
                    if (entry.timerCount >= user.account.dailyTimerMax) {
                        penalty = 1;
                    }
                    entry.timerCount++;
                }
                temp.add(3, 'hours');
                user.data[i].actions.push({
                    time: temp.add(5, 'minutes'),
                    actionType: type,
                    amountDeducted: penalty
                });
            }
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
        } else if (key == 'timeOfLastText') {
            user.account[key] = moment(value);
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
 * POST /api/account/action/
 * Update actions for a user.
 */
exports.postAction = (req, res, next) => {
    req.assert('id', 'User id was not specified.').notEmpty();
    req.assert('type', 'Action type is not valid.').isValidActionType();

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
        var currDate;
        if (!req.body.time) {
            currDate = moment();

        } else {
            currDate = moment(req.body.time);
        }
        var currDateStart = moment(currDate);
        currDateStart = currDateStart.startOf('day');

        var count = user.data.length - 1;
        while (true) {
            var entry = user.data[count];
            if (user.data.length === 0 || entry.date.isBefore(currDateStart, 'day')) {
                user.data.splice(count + 1, 0, {
                    date: currDateStart,
                    swearCount: 0,
                    timerCount: 0,
                    actions: []
                });
                console.log(user.data);
                entry = user.data[count + 1];
                var penalty = 0;
                if (req.body.type == 'swear') {
                    if (entry.swearCount == user.account.dailySwearMax) {
                        penalty = 1;
                    } else {
                        entry.swearCount++;
                    }
                } else if (req.body.type == 'timer') {
                    if (entry.timerCount == user.account.dailyTimerMax) {
                        penalty = 1;
                    } else {
                        entry.timerCount++;
                    }
                } else {
                    return res.status(400).json([{
                        msg: "Action type is not valid."
                    }]);
                }
                entry.actions.push({
                    time: currDate,
                    actionType: req.body.type,
                    amountDeducted: penalty
                });
                break;
            } else if (entry.date.isSame(currDateStart, 'day')) {
                // TODO: Account for time differences
                // var count2 = entry.actions.length - 1;
                let penalty = 0;
                if (req.body.type == 'swear') {
                    if (entry.swearCount >= user.account.dailySwearMax) {
                        penalty = 1;
                    }
                    entry.swearCount++;
                } else if (req.body.type == 'timer') {
                    if (entry.timerCount >= user.account.dailyTimerMax) {
                        penalty = 1;
                    }
                    entry.timerCount++;
                } else {
                    return res.status(400).json([{
                        msg: "Action type is not valid."
                    }]);
                }
                entry.actions.push({
                    time: currDate,
                    actionType: req.body.type,
                    amountDeducted: penalty
                });
                break;
            } else if (entry.date.isAfter(currDateStart, 'day')) {
                count--;
            }
        }
        user.save((err) => {
            if (err) {
                return res.status(500).json([{
                    msg: "Server failure."
                }]);
            }
            return res.status(200).json({
                msg: 'Action data has been updated.'
            });
        });
    });
};
