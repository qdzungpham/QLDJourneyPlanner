let startPoint;
let destination;
let from;
let to;
let placesMarkers = [];
let currentRoute;
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
            if (currentRoute) currentRoute.setMap(null);
            var directionsService = new google.maps.DirectionsService;
            var directionsDisplay = new google.maps.DirectionsRenderer;
            currentRoute = directionsDisplay;
            directionsDisplay.setMap(map);
            directionsService.route({
                origin: from.geometry.location,
                destination: to.geometry.location,
                travelMode: 'DRIVING'
            }, function(response, status) {
                if (status === 'OK') {
                    console.log(response);
                    directionsDisplay.setDirections(response);

                    var path = response.routes[0].overview_path;
                    $.ajax({
                        type: "POST",
                        url: '/journey',
                        dataType: 'json',
                        cache: false,
                        data: {result: JSON.stringify(path)}
                    }).done(function(data){
                        console.log(data);
                        performSearches(data);
                    })

                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            });
        }
    }
}

function convertToLatLngBounds(box) {

    var lowestLatitude = box.bbox[1];
    var lowestLongitude = box.bbox[0];
    var highestLatitude = box.bbox[3];
    var highestLongitude = box.bbox[2];
    var southWest = new google.maps.LatLng(lowestLatitude, lowestLongitude);
    var northEast = new google.maps.LatLng(highestLatitude, highestLongitude);
    var bound = new google.maps.LatLngBounds(southWest, northEast);
    return bound;
}

function performSearches(boxes) {
    setMarkersOnMap(placesMarkers, null);
    placesMarkers = [];
    const keyword = document.getElementById('keyword').value;
    for (var i = 0; i < boxes.length; i++) {
        (function(i) {
            setTimeout(function() {
                const bound = convertToLatLngBounds(boxes[i]);
                const request = {
                    bounds: bound,
                    keyword: keyword
                };
                const service = new google.maps.places.PlacesService(map);
                service.nearbySearch(request, function(results, status) {
                    if (status == google.maps.places.PlacesServiceStatus.OK) {
                        console.log(results);
                        results.forEach(function(place) {
                            var circle ={
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: '#B71C1C',
                                fillOpacity: 1,
                                scale: 4.5,
                                strokeColor: 'white',
                                strokeWeight: 1
                            };
                            const marker = new google.maps.Marker({
                                //map: map,
                                position: place.geometry.location,
                                icon: circle
                            });
                            const infowindow = new google.maps.InfoWindow();
                            marker.infowindow = new google.maps.InfoWindow({
                                content: place.name
                            })
                            addMarkerListener(marker);

                            if (bound.contains(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()))) {
                                placesMarkers.push(marker);
                                marker.setMap(map);
                            }
                        })
                    } else {
                        console.log(status);
                    }
                })

            }, 400 * i);
        }(i));
    }
}

/*
boxes.forEach(function(box) {
    const bound = convertToLatLngBounds(box);
    const request = {
        bounds: bound,
        keyword: 'bars'
    };
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, function(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
            console.log(results);
            results.forEach(function(place) {
                var circle ={
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'red',
                    fillOpacity: 1,
                    scale: 4.5,
                    strokeColor: 'white',
                    strokeWeight: 1
                };
                const marker = new google.maps.Marker({
                    //map: map,
                    position: place.geometry.location,
                    icon: circle
                });
                const infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.setContent(place.name);
                    infowindow.open(map, this);
                });
                if (bound.contains(new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng()))) {
                    placesMarkers.push(marker);
                    marker.setMap(map);
                }
            })
        } else {
            console.log(status);
        }
    })
});
*/