const express = require('express');
const router = express.Router();
const https = require('https');
const RouteBoxer = require('geojson.lib.routeboxer'),
    boxer = new RouteBoxer();

const googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyCzrKaRm0lltEbxcSSZz4MFEj1k3N0OBtY'
});

function createTrafficDataOptions(query) {
    const apiKey = '3e83add325cbb69ac4d8e5bf433d770b';
    const hostName = 'https://api.qldtraffic.qld.gov.au/v1/';

    return hostName + query + '?apikey=' + apiKey;
}
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { sample: 'Express' });
});

function createFoursquareOptions(date, location) {
    const hostName = 'https://api.foursquare.com/v2/venues/explore?';
    const clientID = 'WJK1EZ1YRHIWAUQFZLJWYFF5L05FFJHNCFWZT2L34L55EMCK';
    const clientSecret = '2DTWKBRK5QSTKFXECE1AHAS2OCZJWDEARC1YZXI3AQ0R5Q4T';
    return hostName + 'v=' + date + '&near=' + location + '&client_id=' + clientID + '&client_secret=' + clientSecret;
}

router.get('/webcamsData', function(req, res, next) {
    const options = createTrafficDataOptions('webcams');
    const webcamsReq = https.get(options, (webcamsRes) => {
        const data = [];
        webcamsRes.on('data', function(chunk) {
            data.push(chunk);
        });

        webcamsRes.on('end', function() {
            if (webcamsRes.statusCode !== 504) {
                const rsp = JSON.parse(data.join(''));
                res.json(rsp);
            } else {
                res.json({error: webcamsRes.statusCode});
                console.log(webcamsRes.statusCode)
            }
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
            if (eventsRes.statusCode !== 504) {
                const rsp = JSON.parse(data.join(''));
                res.json(rsp);
            } else {
                res.json({error: eventsRes.statusCode});
                console.log(eventsRes.statusCode)
            }
            res.end();
        })


    });

    eventsReq.on('error', (e) => {
        console.error(e);
    });

    eventsReq.end();
});


router.post('/journey', function(req, res, next) {
    const parsed = JSON.parse(req.body.result);
    const arr = [];
    parsed.forEach(function(entry) {
        arr.push([entry.lng, entry.lat]);
    });
    //console.log(arr);
    let distance = 0.1;
    let boxes = boxer.box(arr, distance);

    while (boxes.length > 30) {
        distance += 0.1;
        boxes = boxer.box(arr, distance);
    }

    //console.log(boxes.length);
    res.json(boxes);


});

module.exports = router;
