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
 * POST /api/user/data
 * Get user data from user id.
 */
exports.postGetUserData = (req, res, next) => {
    req.assert('id', 'Id is empty/not valid.').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    User.findOne({ _id: req.body.id }, (err, user) => {
        if (err) {
            return res.status(500).json([{
                msg: 'Server failure.'
            }]);
        }
        if (!user) {
            return res.status(400).json([{
                msg: 'No user with that id exists.'
            }]);
        }
        user.save((err) => {
            if (err) {
                return res.status(500).json([{
                    msg: 'Server failure.'
                }]);
            }
            req.logIn(user, (err) => {
                return res.status(200).json({
                    data: user.data
                });
            });
        });
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
        if (err) {
            return res.status(500).json([{
                msg: 'Server failure.'
            }]);
        }
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
 * Create a new local account with good data for demo purposes.
 */
exports.postSignupHack = (req, res, next) => {
    const email = req.body.email || "a@a.com";
    const password = req.body.password || "asdf";
    const firstName = req.body.firstName || "Gordon";
    const lastName = req.body.firstName || "Ramsay";
    const user = new User({
        profile: {
            firstName: firstName,
            lastName: lastName
        },
        email: email,
        password: password
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
                existingUser.data.push({
                    date: temp,
                    swearCount: 0,
                    timerCount: 0,
                    actions: []
                });
                var entry = existingUser.data[i];
                let temp2 = moment(temp).subtract(15, 'minutes');
                for (var j = 0; j < numOfActions; j++) {
                    var change = 0;
                    var type;
                    var rand = Math.random();
                    if (rand < 0.4) {
                        type = 'swear';
                        if (entry.swearCount >= user.account.dailySwearMax) {
                            change = 1;
                        }
                        entry.swearCount++;
                    } else if (rand > 0.4 && rand < 0.8) {
                        type = 'timer';
                        if (entry.timerCount >= user.account.dailyTimerMax) {
                            change = 1;
                            existingUser.account.balance = Math.max(0, user.account.balance - 1);
                            entry.totalMoneyLost += 1;
                        }
                        entry.timerCount++;
                    } else {
                        type = 'timerDone';
                        change = 1;
                        existingUser.account.balance = Math.max(0, user.account.balance - 1);
                        entry.totalMoneyEarned += 1;
                        entry.timerDoneCount++;
                    }
                    temp2 = moment(temp2).add(5, 'minutes');
                    existingUser.data[i].actions.push({
                        time: temp2,
                        actionType: type,
                        amountDeducted: change
                    });
                }
                console.log();
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
            var temp2 = moment(temp).subtract(15, 'minutes');
            for (let j = 0; j < numOfActions; j++) {
                let change = 0;
                let type;
                let rand = Math.random();
                if (rand < 0.4) {
                    type = 'swear';
                    if (entry.swearCount >= user.account.dailySwearMax) {
                        change = 1;
                    }
                    entry.swearCount++;
                } else if (rand > 0.4 && rand < 0.8) {
                    type = 'timer';
                    if (entry.timerCount >= user.account.dailyTimerMax) {
                        change = 1;
                        user.account.balance = Math.max(0, user.account.balance - 1);
                        entry.totalMoneyLost += 1;
                    }
                    entry.timerCount++;
                } else {
                    type = 'timerDone';
                    change = 1;
                    user.account.balance = Math.max(0, user.account.balance - 1);
                    entry.totalMoneyEarned += 1;
                    entry.timerDoneCount++;
                }
                temp2 = moment(temp2).add(5, 'minutes');
                user.data[i].actions.push({
                    time: temp2,
                    actionType: type,
                    amountDeducted: change
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
        } else if (key == 'dailySwearMax' || key == 'dailyTimerMax') {
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

    console.log(req.body);

    const errors = req.validationErrors();

    if (errors) {
        console.log(errors);
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
            currDate = moment(parseInt(req.body.time));
        }
        var currDateStart = moment(currDate);
        currDateStart = currDateStart.startOf('day');

        var count = 0;
        while (true) {
            var entry = user.data[count];
            if (user.data.length === 0 || entry.date.isBefore(currDateStart, 'day')) {
                user.data.splice(count, 0, {
                    date: currDateStart,
                    swearCount: 0,
                    timerCount: 0,
                    actions: []
                });
                console.log(user.data);
                entry = user.data[count];
                var change = 0;
                if (req.body.type == 'swear') {
                    if (entry.swearCount == user.account.dailySwearMax) {
                        change = 1;
                        user.account.balance = Math.max(0, user.account.balance - 0.25);
                        user.account.totalMoneyLost += 0.25;
                    } else {
                        entry.swearCount++;
                    }
                } else if (req.body.type == 'timer') {
                    if (entry.timerCount == user.account.dailyTimerMax) {
                        change = 1;
                        user.account.balance = Math.max(0, user.account.balance - 1);
                        user.account.totalMoneyLost += 1;
                    } else {
                        entry.timerCount++;
                    }
                } else if (req.body.type == 'timerDone') {
                    change = 1;
                    user.account.balance = Math.max(0, user.account.balance - 1);
                    user.account.totalMoneyEarned += 1;
                    entry.timerDoneCount++;
                } else {
                    return res.status(400).json([{
                        msg: "Action type is not valid."
                    }]);
                }
                entry.actions.push({
                    time: currDate,
                    actionType: req.body.type,
                    amountDeducted: change
                });
                break;
            } else if (entry.date.isSame(currDateStart, 'day')) {
                // TODO: Account for time differences
                // var count2 = entry.actions.length - 1;
                let change = 0;
                if (req.body.type == 'swear') {
                    if (entry.swearCount >= user.account.dailySwearMax) {
                        change = 1;
                        user.account.balance = Math.max(0, user.account.balance - 0.25);
                        user.account.totalMoneyLost += 0.25;
                    }
                    entry.swearCount++;
                } else if (req.body.type == 'timer') {
                    if (entry.timerCount >= user.account.dailyTimerMax) {
                        change = 1;
                        user.account.balance = Math.max(0, user.account.balance - 1);
                        user.account.totalMoneyLost += 1;
                    }
                    entry.timerCount++;
                } else if (req.body.type == 'timerDone') {
                    change = 1;
                    user.account.balance = Math.max(0, user.account.balance - 1);
                    user.account.totalMoneyEarned += 1;
                    entry.timerDoneCount++;
                } else {
                    return res.status(400).json([{
                        msg: "Action type is not valid."
                    }]);
                }
                entry.actions.push({
                    time: currDate,
                    actionType: req.body.type,
                    amountDeducted: change
                });
                break;
            } else if (entry.date.isAfter(currDateStart, 'day')) {
                count++;
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
