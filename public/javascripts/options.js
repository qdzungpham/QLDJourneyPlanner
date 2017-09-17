function optionsHandler(element) {
    if (element.id === 'trafficLayer') {
        if (!element.checked) {
            trafficLayer.setMap(null);
        } else {
            trafficLayer.setMap(map);
        }
    } else if (element.id === 'trafficCams') {
        if (!element.checked) {
            setMarkersOnMap(webcamMarkers, null);
        } else {
            setMarkersOnMap(webcamMarkers, map);
        }
    } else if (element.id === 'hazards') {
        if (!element.checked) {
            setMarkersOnMap(hazardMarkers, null);
        } else {
            setMarkersOnMap(hazardMarkers, map);
        }
    } else if (element.id === 'crashes') {
        if (!element.checked) {
            setMarkersOnMap(crashMarkers, null);
        } else {
            setMarkersOnMap(crashMarkers, map);
        }
    } else if (element.id === 'congestion') {
        if (!element.checked) {
            setMarkersOnMap(congestionMarkers, null);
        } else {
            setMarkersOnMap(congestionMarkers, map);
        }
    } else if (element.id === 'roadworks') {
        if (!element.checked) {
            setMarkersOnMap(roadworkMarkers, null);
        } else {
            setMarkersOnMap(roadworkMarkers, map);
        }
    } else if (element.id === 'specialEvents') {
        if (!element.checked) {
            setMarkersOnMap(specialEventMarker, null);
        } else {
            setMarkersOnMap(specialEventMarker, map);
        }
    } else if (element.id === 'flooding') {
        if (!element.checked) {
            setMarkersOnMap(floodingMarkers, null);
        } else {
            setMarkersOnMap(floodingMarkers, map);
        }
    }

}