const https = require('https')

function createOptions(query) {
    const apiKey = '3e83add325cbb69ac4d8e5bf433d770b';
    const hostName = 'https://api.qldtraffic.qld.gov.au/v1/';

    return hostName + query + '?apikey=' + apiKey;
}
let rsp = null;
exports.rsp = rsp;
module.exports = {

    getTrafficData: function (query) {
        //let rsp = null;
        const options = createOptions(query);
        const req = https.get(options, (res) => {
            const body = [];
            res.on('data',function(chunk) {
                //console.log('BODY: ' + chunk);
                body.push(chunk);
            });

            res.on('end', function() {
                console.log('here');
                const bodyString = body.join('');
                rsp = JSON.parse(bodyString);

            });
        });
        req.on('error', function(e) {
            console.error(e);
        });

        req.end();
    }
}

