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
            const travelMode = getTravelMode();
            directionsService.route({
                origin: from.geometry.location,
                destination: to.geometry.location,
                travelMode: travelMode
            }, function(response, status) {
                if (status === 'OK') {
                    //console.log(response);
                    setMarkersOnMap(placesMarkers, null);
                    directionsDisplay.setDirections(response);

                    if (document.getElementById('searchPlaces').checked) {
                        var path = response.routes[0].overview_path;
                        $.ajax({
                            type: "POST",
                            url: '/journey',
                            dataType: 'json',
                            cache: false,
                            data: {result: JSON.stringify(path)}
                        }).done(function (data) {
                            //console.log(data);
                            performSearches(data);
                        })
                    }
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
                        //console.log(results);
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
                                position: place.geometry.location,
                                icon: circle,
                                title: place.name
                            });


                            google.maps.event.addListener(marker, 'click', function() {
                                service.getDetails({placeId: place.place_id}, function(place, status) {
                                    if (status == google.maps.places.PlacesServiceStatus.OK) {

                                        let content = `<h6>${place.name}</h6>
                                                        <h7><strong>Address: </strong>${place.formatted_address}</h7><br>`;
                                        const phoneNum = place.formatted_phone_number;
                                        if (phoneNum) {
                                            content += `<h7><strong>Phone Number: </strong>${phoneNum}</h7><br>`
                                        }
                                        const website = place.website;
                                        if (website) {
                                            content += `<h7><strong>Website: </strong>${website}</h7><br>`
                                        }
                                        content += `<h7><a href="${place.url}">View on Google Maps</a></h7><br>`
                                        const photos = place.photos;
                                        if (photos) {
                                            photos.forEach(function(photo) {
                                                content += `<img src="${photo.getUrl({'maxWidth': 90, 'maxHeight': 90})}" alt="" class="img-thumbnail">`;
                                            })
                                        }
                                        marker.infowindow = new google.maps.InfoWindow({
                                            content: content,
                                            maxWidth: 300,
                                            maxHeight: 300
                                        });
                                        if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
                                        marker.infowindow.open(map, marker);
                                        MAPAPP.currentInfoWindow = marker.infowindow;
                                        map.panTo(marker.getPosition());
                                    }
                                });
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

            }, 400 * i);
        }(i));
    }
}

function getTravelMode() {
    let mode;
    if (document.getElementById('DRIVING').checked) {
        mode = 'DRIVING'
    } else if (document.getElementById('BICYCLING').checked) {
        mode = 'BICYCLING'
    } else if (document.getElementById('TRANSIT').checked) {
        mode = 'TRANSIT'
    }
    return mode
}

function searchPlaces() {
    const checkBox = document.getElementById('searchPlaces');
    const input = document.getElementById('keyword');
    if (checkBox.checked) {
        input.disabled = false;
    } else if (!checkBox.checked) {
        input.disabled = true;
    }
}

