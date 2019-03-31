// global variables
let map;
const MAPAPP = {};
MAPAPP.markers = [];
MAPAPP.currentInfoWindow;
let trafficLayer;
const webcamMarkers = [];
const hazardMarkers = [];
const crashMarkers = [];
const congestionMarkers = [];
const roadworkMarkers = [];
const specialEventMarker = [];
const floodingMarkers = [];
const polyLines = [];

// request traffic camera data from server and populate markers
function getTrafficCamsData() {
  $.ajax({
    url: "webcamsData",
    dataType: "json",
    cache: false
  }).done(function(data) {
    if (data.error) {
      window.alert(
        "QldTraffic server is not responding. Please refresh the page."
      );
      return;
    }
    populateWebcamsMarkers(data);

    //console.log(data);
  });
}

// request event data from server and populate event marker
function getTrafficEventsData() {
  $.ajax({
    url: "eventsData",
    dataType: "json",
    cache: false
  }).done(function(data) {
    if (data.error) {
      window.alert(
        "QldTraffic server is not responding. Please refresh the page."
      );
      return;
    }
    //console.log(data);
    populateEventsMarkers(data);
    let infor = document.getElementById("infor");
    const currentdate = new Date();
    infor.innerHTML = `Traffic information updated at ${currentdate.getHours()}:${currentdate.getMinutes()}:${currentdate.getSeconds()}`;
    document.getElementById("loader").style.display = "none";
  });
}

function initMap() {
  const center = { lat: -27.477337, lng: 153.028441 };

  const mapOptions = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: center
  };

  map = new google.maps.Map(document.getElementById("googlemaps"), mapOptions);

  google.maps.event.addListener(map, "click", function() {
    if (MAPAPP.currentInfoWindow) MAPAPP.currentInfoWindow.close();
  });
  trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  document.getElementById("trafficLayer").checked = true;

  initAutoComplete();

  getTrafficCamsData();
  getTrafficEventsData();
}

function populateWebcamsMarkers(data) {
  $.each(data.features, function(key, val) {
    const marker = new google.maps.Marker({
      position: {
        lat: val.geometry.coordinates[1],
        lng: val.geometry.coordinates[0]
      },
      icon: "images/pin_camera.png"
    });

    const content = `<div class="card" style="width: 20rem; border-width: 0px">
                           <img class="card-img-top" src="${
                             val.properties.image_url
                           }" alt="Card image cap">
                           <div class="card-block">
                              <h6 class="card-title">${
                                val.properties.description
                              }</h6>
                              <p class="card-text">Direction: ${
                                val.properties.direction
                              }</p>
                           </div>
                         </div>`;

    marker.infowindow = new google.maps.InfoWindow({
      content: content
    });

    addMarkerListener(marker);

    webcamMarkers.push(marker);
  });

  //display traffic camera markers
  setMarkersOnMap(webcamMarkers, map);
  document.getElementById("trafficCams").checked = true;
}

function displayEventMarkers() {
  setMarkersOnMap(hazardMarkers, map);
  document.getElementById("hazards").checked = true;
  setMarkersOnMap(crashMarkers, map);
  document.getElementById("crashes").checked = true;
  setMarkersOnMap(congestionMarkers, map);
  document.getElementById("congestion").checked = true;
  setMarkersOnMap(roadworkMarkers, map);
  document.getElementById("roadworks").checked = true;
  setMarkersOnMap(specialEventMarker, map);
  document.getElementById("specialEvents").checked = true;
  setMarkersOnMap(floodingMarkers, map);
  document.getElementById("flooding").checked = true;
}

function checkEventTypeAndPolylineAssociated(eventType, marker, polyLine) {
  if (eventType === "Hazard") {
    hazardMarkers.push(marker);
    if (polyLine) {
      hazardMarkers.push(polyLine);
    }
  } else if (eventType === "Crash") {
    crashMarkers.push(marker);
    if (polyLine) {
      crashMarkers.push(polyLine);
    }
  } else if (eventType === "Congestion") {
    congestionMarkers.push(marker);
    if (polyLine) {
      congestionMarkers.push(polyLine);
    }
  } else if (eventType === "Special event") {
    specialEventMarker.push(marker);
    if (polyLine) {
      specialEventMarker.push(polyLine);
    }
  } else if (eventType === "Roadworks") {
    roadworkMarkers.push(marker);
    if (polyLine) {
      roadworkMarkers.push(polyLine);
    }
  } else if (eventType === "Flooding") {
    floodingMarkers.push(marker);
    if (polyLine) {
      floodingMarkers.push(polyLine);
    }
  }
}

function populateEventsMarkers(data) {
  $.each(data.features, function(key, val) {
    let marker;
    let polyLine;
    const eventType = val.properties.event_type;
    if (val.geometry.geometries[0].type === "Point") {
      marker = new google.maps.Marker({
        position: {
          lat: val.geometry.geometries[0].coordinates[1],
          lng: val.geometry.geometries[0].coordinates[0]
        },
        icon: eventMarkerIcons(eventType)
      });
    } else if (val.geometry.geometries[0].type === "LineString") {
      marker = new google.maps.Marker({
        position: {
          lat:
            val.geometry.geometries[0].coordinates[
              Math.floor(val.geometry.geometries[0].coordinates.length / 2)
            ][1],
          lng:
            val.geometry.geometries[0].coordinates[
              Math.floor(val.geometry.geometries[0].coordinates.length / 2)
            ][0]
        },
        icon: eventMarkerIcons(eventType)
      });

      const coordinates = [];
      $.each(val.geometry.geometries[0].coordinates, function(i, ob) {
        coordinates.push({ lat: ob[1], lng: ob[0] });
      });

      polyLine = new google.maps.Polyline({
        path: coordinates,
        geodesic: true,
        strokeColor: "#37474F",
        strokeOpacity: 1.0,
        strokeWeight: 2
        //map: map
      });

      polyLines.push(polyLine);
    }

    const content = `<h6>${val.properties.event_type}</h6>
                        <table border="0">
                          <tbody>
                            <tr>
                              <th scope="row">Suburbs/Localities</th>
                              <td>${val.properties.road_summary.locality}</td>
                            </tr>
                            <tr>
                              <th scope="row">Roads</th>
                              <td>${val.properties.road_summary.road_name}</td>
                            </tr>
                            <tr>
                              <th scope="row">Description</th>
                              <td>${val.properties.description}</td>
                            </tr>
                            <tr>
                              <th scope="row">What to expect</th>
                              <td>${val.properties.impact.impact_subtype}</td>
                            </tr>
                            <tr>
                              <th scope="row">Last updated</th>
                              <td>${val.properties.last_updated.substring(
                                0,
                                10
                              )}</td>
                            </tr>
                          </tbody>
                        </table>`;
    marker.infowindow = new google.maps.InfoWindow({
      content: content,
      maxWidth: 300
    });

    addMarkerListener(marker);

    checkEventTypeAndPolylineAssociated(eventType, marker, polyLine);
  });

  displayEventMarkers();
}

function addMarkerListener(marker) {
  google.maps.event.addListener(marker, "click", function() {
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

function eventMarkerIcons(type) {
  type = type.replace(/\s/g, "");
  return "images/pin_" + type + ".png";
}
