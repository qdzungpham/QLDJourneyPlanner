let startPoint;
let destination;
let from;
let to;
function initAutoComplete() {
    startPoint = new google.maps.places.Autocomplete(document.getElementById('startPoint'));
    destination = new google.maps.places.Autocomplete(document.getElementById('destination'));
    map.addListener('bounds_changed', function() {
        startPoint.setBounds(map.getBounds());
        destination.setBounds(map.getBounds());
    });

    startPoint.addListener('place_changed', function() {
        from = startPoint.getPlace();
    });

    destination.addListener('place_changed', function() {
        to = destination.getPlace();
    })

}

function findJourney() {

    if (from && to) {
        if (from.geometry.viewport && to.geometry.viewport) {
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            directionsDisplay.setMap(map);
            directionsService.route({
                origin: from.geometry.location,
                destination: to.geometry.location,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    console.log(response);
                    directionsDisplay.setDirections(response);
                    var routeboxer = new RouteBoxer();
                    var distance = 0.01; // km
                    var path = response.routes[0].overview_path;
                    var bounds = routeboxer.box(path, distance);
                    console.log(bounds.length);
                    /*
                    var path = response.routes[0].overview_path;
                    $.ajax({
                        type: "POST",
                        url: '/journey',
                        dataType: 'json',
                        cache: false,
                        data: {result: JSON.stringify(response)}
                    }).done(function(data){
                        console.log(data);
                    })
                    */
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    }
}