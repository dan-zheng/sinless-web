var request = require('superagent');
var util = require('util');

/**
 * GET /nessie/account
 * Get a customer account.
 */
exports.getAccount = (req, res, next) => {
    req.assert('id', 'Id is empty/not valid.').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }
    console.log("req.param['id']: " + req.param("id"));
    console.log(process.env.NESSIE_API_ID);

    const url = 'http://api.reimaginebanking.com/customers/' + req.param("id") + '/accounts?key=' + process.env.NESSIE_API_KEY;

    console.log(url);
    request
        .get(url)
        .end((err, res) => {
            console.log("res: " + res);
            if (err) {
                console.log(err);
                return err;
            }
            console.log(res.body);
            return res.body;
        });
};

/**
 * POST /nessie/account
 * Create a customer account.
 */
exports.postCreateAccount = (req, res, next) => {
    req.assert('id', 'Id is empty/not valid.').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        return res.status(400).json(errors);
    }

    const url = 'http://www.api.reimaginebanking.com/customers/' + process.env.NESSIE_API_ID + '/accounts';

    request
        .get(url)
        .set('key', process.env.NESSIE_API_KEY)
        .set('Accept', 'application/json')
        .set('id', req.body.id)
        .end((err, res) => {
            if (err) {
                console.log(err);
                return res.status(400).json(err);
            }
            console.log(res);
            return res.status(200).json(res);
        });
};
