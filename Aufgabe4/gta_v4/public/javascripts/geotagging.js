// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html_bak.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function(onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

/**
 * TODO: 'updateLocation'
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
    // 1. Schauen, ob schon Koordinaten vom Server im HTML stehen
    const latValue = document.getElementById('latitude').value;
    const lonValue = document.getElementById('longitude').value;

    // 1. Daten-Brücke auslesen (Müssen wir nur einmal machen!)
    const mapElement = document.getElementById('map');
    const tagsJsonString = mapElement.getAttribute('data-tags');
    const tagsList = tagsJsonString ? JSON.parse(tagsJsonString) : [];

    if (latValue && lonValue) {
        // Fall A: Server hat die Koordinaten schon geliefert! Kein GPS nötig.
        console.log("Koordinaten existieren bereits, lade Karte direkt.");
        initAndUpdateMap(latValue, lonValue, tagsList);
    } else {
        // Fall B: Felder sind leer (erster Seitenaufruf). Wir müssen das GPS anfunken.
        console.log("Felder leer, starte GPS-Abfrage.");

        LocationHelper.findLocation((helper) => {
            const lat = helper.latitude;
            const lon = helper.longitude;

            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lon;
            document.getElementById('hidden_latitude').value = lat;
            document.getElementById('hidden_longitude').value = lon;

            initAndUpdateMap(lat, lon, tagsList);
        });
    }
}

function initAndUpdateMap(lat, lon, tagsList) {
    const mapManager = new MapManager();
    mapManager.initMap(lat, lon);
    mapManager.updateMarkers(lat, lon, tagsList);
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation()
});