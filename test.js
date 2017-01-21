var request = require('superagent');
var express = require('express');
var app = express();
var http = require('http');
var Req = require('request');
var util = require('util');

app.get('/create_account', function(req, res) {
    res.send("hey");

    var id = '5883cf161756fc834d8ebe42';
    var bod = {
        'type': 'Credit Card',
        'nickname': 'Sinless',
        'rewards': 0,
        'balance': 1000,
        'account_number': '0000000000000000'
    };

    var options = {
        host: 'api.reimaginebanking.com',
        path: '/customers/' + id + '/accounts?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    REQ.write(JSON.stringify(bod));
    REQ.end();


});

app.get('/get_account_by_id', function(req, res) {
    res.send("hey");

    var id = '5883acf01756fc834d8eb83e';



    var options = {
        host: 'api.reimaginebanking.com',
        path: '/customers/' + id + '/accounts?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    REQ.end();


});

app.get('/register_user', function(req, res) {


    res.send("hey");

    var bod = {
        'first_name': 'Sin',
        'last_name': 'less',
        'address': {
            'street_number': '1275',
            'street_name': 'howard street',
            'city': 'West Lafayette',
            'state': 'IN',
            'zip': '47906'
        }
    };


    var options = {
        host: 'api.reimaginebanking.com',
        path: '/customers?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + util.inspect(chunk));
        });
    });
    REQ.write(JSON.stringify(bod));
    REQ.end();
});

app.get('/get_user_by_id', function(req, res) {
    res.send("hey");

    var id = '5883c8791756fc834d8ebd3a';



    var options = {
        host: 'api.reimaginebanking.com',
        path: '/customers/' + id + '?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        //console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    REQ.end();


});

app.get('/transaction_to_sinless', function(req, res) {
    res.send("hey");

    var id = '5883c54e1756fc834d8ebce8';  // parameter

    var bod = {
        "medium": "balance",
        "payee_id": "5883cfa51756fc834d8ebe48",
        "amount": 0.01, // parameter
        "transaction_date": "2017-01-21",
        "description": "you lost money bruh"
    };


    var options = {
        host: 'api.reimaginebanking.com',
        path: '/accounts/' + id + '/transfers?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    REQ.write(JSON.stringify(bod));
    REQ.end();


});

app.get('/transaction_from_sinless_to_user', function(req, res) {
    res.send("hey");

    var id = '5883cfa51756fc834d8ebe48';

    var bod = {
        "medium": "balance",
        "payee_id": "5883ad531756fc834d8eb843", // parameter
        "amount": 0.01,
        "transaction_date": "2017-01-21",
        "description": "you got money bruh"
    };


    var options = {
        host: 'api.reimaginebanking.com',
        path: '/accounts/' + id + '/transfers?key=66e71e57f1c2b3bb334fd4100a1f3259',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }

    };

    var REQ = http.request(options, function(res, error) {

        if (error) {
            console.log(error);
        }
        console.log('STATUS: ' + res.statusCode);
        // console.log('HEADERS: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function(chunk) {
            console.log('BODY: ' + chunk);
        });
    });
    REQ.write(JSON.stringify(bod));
    REQ.end();


});

app.listen(8080, function() {
    console.log("magic happens at 8080");
});
