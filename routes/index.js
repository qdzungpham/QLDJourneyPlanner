const express = require('express');
const router = express.Router();
const https = require('https');

function createTrafficDataOptions(query) {
    const apiKey = '3e83add325cbb69ac4d8e5bf433d770b';
    const hostName = 'https://api.qldtraffic.qld.gov.au/v1/';

    return hostName + query + '?apikey=' + apiKey;
}
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { sample: 'Express' });
});

router.get('/webcamsData', function(req, res, next) {
    const options = createTrafficDataOptions('webcams');
    const webcamsReq = https.get(options, (webcamsRes) => {
        const data = [];
        webcamsRes.on('data', function(chunk) {
            data.push(chunk);
        });

        webcamsRes.on('end', function() {
            const rsp = JSON.parse(data.join(''));

            res.json(rsp);

            res.end();
        })
    });

    webcamsReq.on('error', (e) => {
        console.error(e);
    });

    webcamsReq.end();
});

router.get('/eventsData', function(req, res, next) {
    const options = createTrafficDataOptions('events');
    const eventsReq = https.get(options, (eventsRes) => {
        const data = [];
        eventsRes.on('data', function(chunk) {
            data.push(chunk);
        });

        eventsRes.on('end', function() {
            const rsp = JSON.parse(data.join(''));

            res.json(rsp);

            res.end();
        })
    });

    eventsReq.on('error', (e) => {
        console.error(e);
    });

    eventsReq.end();
});

module.exports = router;
