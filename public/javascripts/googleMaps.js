let map;
const MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
const webcamMarkers = [];
const hazardMarkers = [];
const crashMarkers = [];
const congestionMarkers = [];
const roadworkMarkers = [];
const specialEventMarker = [];
const floodingMarkers = [];
const polyLines = [];



function getTrafficCamsData() {
    $.ajax({
        url: '/webcamsData',
        dataType: 'json',
        cache: false
    }).done(function(data){
        if (data.error) {
            window.alert('QldTraffic server is not responding. Please refresh the page.');
            return
        }
        populateWebcamsMarkers(data);

        console.log(data);
    })

}

function getTrafficEventsData() {
    $.ajax({
        url: '/eventsData',
        dataType: 'json',
        cache: false
    }).done(function(data){
        if (data.error) {
            window.alert('QldTraffic server is not responding. Please refresh the page.');
            return
        }
        console.log(data);
        populateEventsMarkers(data);
        let infor = document.getElementById('infor');
        const currentdate = new Date();
        infor.innerHTML = `Traffic information updated at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
        document.getElementById("loader").style.display = "none";
    })

}

function initMap() {
    const center = {lat: -27.477337, lng: 153.028441};

    const mapOptions = {
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: center
    };

    map = new google.maps.Map(document.getElementById('googlemaps'), mapOptions);

    google.maps.event.addListener(map, 'click', function() {
        if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
    });
    initAutoComplete();

    getTrafficCamsData();
    getTrafficEventsData();


}

function populateWebcamsMarkers(data) {

    $.each(data.features, function(key, val) {
        const marker = new google.maps.Marker({
            position: {lat: val.geometry.coordinates[1], lng: val.geometry.coordinates[0]},
            icon: 'http://localhost:3000/images/pin_camera.png'
        });

        const content = `<div class="card" style="width: 20rem; border-width: 0px">
                           <img id="refresh" class="card-img-top" src="${val.properties.image_url}" alt="Card image cap">
                           <div class="card-block">
                              <h6 class="card-title">${val.properties.description}</h6>
                              <p class="card-text">Direction: ${val.properties.direction}</p>
                           </div>
                         </div>`

        marker.infowindow = new google.maps.InfoWindow({
            content: content
        });

        addMarkerListener(marker);

        webcamMarkers.push(marker);

    });

    //display traffic camera markers
    setMarkersOnMap(webcamMarkers, map);
    document.getElementById('trafficCams').checked = true;
}

function populateEventsMarkers(data) {
    $.each(data.features, function(key, val) {
        let marker;
        let polyLine;
        const eventType = val.properties.event_type;
        if (val.geometry.geometries[0].type === "Point") {
            marker = new google.maps.Marker({
                position: {lat: val.geometry.geometries[0].coordinates[1], lng: val.geometry.geometries[0].coordinates[0]},
                icon: eventMarkerIcons(eventType)
            });
        } else if (val.geometry.geometries[0].type === "LineString") {
            marker = new google.maps.Marker({
                position: {lat: val.geometry.geometries[0].coordinates[Math.floor(val.geometry.geometries[0].coordinates.length/2)][1], lng: val.geometry.geometries[0].coordinates[Math.floor(val.geometry.geometries[0].coordinates.length/2)][0]},
                icon: eventMarkerIcons(eventType)
            });

            const coordinates = [];
            $.each(val.geometry.geometries[0].coordinates, function(i, ob) {
                coordinates.push({lat: ob[1], lng: ob[0]});
            })

            polyLine = new google.maps.Polyline({
                path: coordinates,
                geodesic: true,
                strokeColor: '#37474F',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                //map: map
            });

            polyLines.push(polyLine);

        }

        const content = '<table class="table">' +
                        '<tr>' +
                            '<td>Mark</td>' +
                            '<td>Ottasdz adsad asdasd o</td>' +
                        '</tr>' +
                        '<tr>' +
                            '<td>Mark</td>' +
                            '<td>Ottasdz adsad asdasd o</td>' +
                        '</tr>' +
                        '</table>';
        marker.infowindow = new google.maps.InfoWindow({
            content: content
        })

        addMarkerListener(marker);

        if (eventType === 'Hazard') {
            hazardMarkers.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                hazardMarkers.push(polyLine)
            }
        } else if (eventType === 'Crash') {
            crashMarkers.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                crashMarkers.push(polyLine)
            }
        } else if (eventType === 'Congestion') {
            congestionMarkers.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                congestionMarkers.push(polyLine)
            }
        } else if (eventType === 'Special event') {
            specialEventMarker.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                specialEventMarker.push(polyLine)
            }
        } else if (eventType === 'Roadworks') {
            roadworkMarkers.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                roadworkMarkers.push(polyLine)
            }
        } else if (eventType === 'Flooding') {
            floodingMarkers.push(marker);
            if (checkPolyLineExisted(polyLine)) {
                floodingMarkers.push(polyLine)
            }
        }
    });

    setMarkersOnMap(hazardMarkers, map);
    document.getElementById('hazards').checked = true;
    setMarkersOnMap(crashMarkers, map);
    document.getElementById('crashes').checked = true;
    setMarkersOnMap(congestionMarkers, map);
    document.getElementById('congestion').checked = true;
    setMarkersOnMap(roadworkMarkers, map);
    document.getElementById('roadworks').checked = true;
    setMarkersOnMap(specialEventMarker, map);
    document.getElementById('specialEvents').checked = true;
    setMarkersOnMap(floodingMarkers, map);
    document.getElementById('flooding').checked = true;
    //setMarkersOnMap(polyLines, map);
}

function addMarkerListener(marker) {
    google.maps.event.addListener(marker, 'click', function() {
        if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
        marker.infowindow.open(map, marker);
        MAPAPP.currentInfoWindow = marker.infowindow;
        map.panTo(marker.getPosition());
    });
}

function setMarkersOnMap(markerList, map) {
    for (let i = 0; i < markerList.length; i++) {
        markerList[i].setMap(map);
    }
}

function checkPolyLineExisted(polyLine) {
    return polyLine;
}

function eventMarkerIcons(type) {
    type = type.replace(/\s/g, '');
    return 'http://localhost:3000/images/pin_' + type + '.png'
}



