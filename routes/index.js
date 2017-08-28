const express = require('express');
const router = express.Router();
const https = require('https');

function createQLDTrafficOptions(query) {
    const apiKey = '3e83add325cbb69ac4d8e5bf433d770b';
    const hostName = 'https://api.qldtraffic.qld.gov.au/v1/';

    return hostName + query + '?apikey=' + apiKey;
}
/* GET home page. */
router.get('/', function(req, res, next) {
    const options = createQLDTrafficOptions('events');
    const eventsReq = https.get(options, (eventsRes) => {
        const data = [];
        eventsRes.on('data', function(chunk) {
            data.push(chunk);
        });
        
        eventsRes.on('end', function() {
            const rsp = JSON.parse(data.join(''));
        })
    });

    eventsReq.on('error', (e) => {
        console.error(e);
    });

    eventsReq.end();

    res.render('index', { sample: 'Express' });
});

module.exports = router;
