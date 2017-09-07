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

router.get('/explore', function(req, res, next) {

});

router.post('/journey', function(req, res, next) {
    const parsed = JSON.parse(req.body.result);
    const arr = [];
    parsed.forEach(function(entry) {
        arr.push([entry.lng, entry.lat]);
    });
    console.log(arr);
    let distance = 0.1;
    let boxes = boxer.box(arr, distance);
    while (boxes.length > 10) {
        distance += 0.1;
        boxes = boxer.box(arr, distance);
    }
    console.log(boxes.length);
    res.json(boxes);


});
/*
const a = [ { lat: -27.467340000000004, lng: 153.02826000000002 },
    { lat: -27.467630000000003, lng: 153.02794 },
    { lat: -27.468040000000002, lng: 153.02741 },
    { lat: -27.468370000000004, lng: 153.02698 },
    { lat: -27.468740000000004, lng: 153.02733 },
    { lat: -27.468790000000002, lng: 153.02738000000002 },
    { lat: -27.46899, lng: 153.02756000000002 },
    { lat: -27.470620000000004, lng: 153.02917000000002 },
    { lat: -27.472050000000003, lng: 153.03058000000001 },
    { lat: -27.472120000000004, lng: 153.03061000000002 },
    { lat: -27.472140000000003, lng: 153.03061000000002 },
    { lat: -27.472260000000002, lng: 153.03049000000001 },
    { lat: -27.474780000000003, lng: 153.02724 },
    { lat: -27.4752, lng: 153.02667000000002 },
    { lat: -27.475230000000003, lng: 153.02665000000002 },
    { lat: -27.475260000000002, lng: 153.02663 },
    { lat: -27.47548, lng: 153.02632 },
    { lat: -27.47568, lng: 153.02611000000002 },
    { lat: -27.475890000000003, lng: 153.02613000000002 },
    { lat: -27.47596, lng: 153.02615 },
    { lat: -27.476180000000003, lng: 153.02631000000002 },
    { lat: -27.476580000000002, lng: 153.02661 },
    { lat: -27.476860000000002, lng: 153.02687 },
    { lat: -27.477480000000003, lng: 153.02749 },
    { lat: -27.477100000000004, lng: 153.02796 },
    { lat: -27.477330000000002, lng: 153.02818000000002 } ];

//const parsed = JSON.parse(req.body.result[0]);
const arr = [];
a.forEach(function(entry) {
    arr.push([entry.lng, entry.lat]);
});
const boxes = boxer.box(arr, 0.1);
console.log(boxes.length);

const locations = [];
boxes.forEach(function(box) {

    googleMapsClient.placesNearby({
        location: box,
        //keyword: 'bars'
    }, function(err, response) {
        if (!err) {
            console.log(response);
            locations.push(response);
            console.log('hi')
        }
    });
});

*/
module.exports = router;
