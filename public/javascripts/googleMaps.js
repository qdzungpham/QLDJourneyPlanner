let map;
const MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;

$(document).ready(function() {

});

function webcamsData() {
    $.ajax({
        url: '/webcamsData',
        dataType: 'json',
        cache: false
    }).done(function(data){
        populateWebcamsMarkers(data);
        console.log(data);
    })

}

function eventsData() {
    $.ajax({
        url: '/eventsData',
        dataType: 'json',
        cache: false
    }).done(function(data){
        console.log(data);
        populateEventsMarkers(data);
    })

}

function initMap() {
    const center = {lat: -27.477337, lng: 153.028441};

    const mapOptions = {
        zoom: 8,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center,
    };

    map = new google.maps.Map(document.getElementById('googlemaps'), mapOptions);
    webcamsData();
    eventsData();

}

function populateWebcamsMarkers(data) {

    $.each(data.features, function(key, val) {
        const marker = new google.maps.Marker({

            position: {lat: val.geometry.coordinates[1], lng: val.geometry.coordinates[0]},
            map: map,
        });

        const content = '<div class="card" style="width: 20rem;">' +
                        '<img class="card-img-top" src="' + val.properties.image_url + '" alt="Card image cap">' +
                        '<div class="card-block">' +
                        '<p class="card-text">' + val.properties.description + '</p>' +
                        '<a href="#" class="btn btn-primary">Refresh</a>' +
                        '</div>' +
                        '</div>';

        marker.infowindow = new google.maps.InfoWindow({
            content: content
        });

        google.maps.event.addListener(marker, 'click', function() {
            if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
            marker.infowindow.open(map, marker);
            MAPAPP.currentInfoWindow = marker.infowindow;
            map.panTo(marker.getPosition());
        });

        google.maps.event.addListener(map, 'click', function() {
            if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
        });

        MAPAPP.markers.push(marker);

    });
}

function populateEventsMarkers(data) {
    $.each(data.features, function(key, val) {
        if (val.geometry.geometries[0].type === "Point") {
            const marker = new google.maps.Marker({
                position: {lat: val.geometry.geometries[0].coordinates[1], lng: val.geometry.geometries[0].coordinates[0]},
                map: map,
            });
        } else if (val.geometry.geometries[0].type === "LineString") {
            const marker = new google.maps.Marker({
                position: {lat: val.geometry.geometries[0].coordinates[Math.floor(val.geometry.geometries[0].coordinates.length/2)][1], lng: val.geometry.geometries[0].coordinates[Math.floor(val.geometry.geometries[0].coordinates.length/2)][0]},
                map: map,
            });

            const coordinates = [];
            $.each(val.geometry.geometries[0].coordinates, function(i, ob) {
                coordinates.push({lat: ob[1], lng: ob[0]});
            })

            const path = new google.maps.Polyline({
                path: coordinates,
                geodesic: true,
                strokeColor: '#37474F',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                map: map
            });
        }

    })
}