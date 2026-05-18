// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html_bak.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

//inits
// Globale Variable, um uns die aktuelle Seite für die Buttons zu merken
let currentPagingState = {
    currentPage: 1,
    totalPages: 1
};

let globalMapManager = null; // static ressource

function initAndUpdateMap(lat, lon, tagsList) {
    if (!globalMapManager) {
        globalMapManager = new MapManager();
        globalMapManager.initMap(lat, lon);

        globalMapManager.onMapClick(handleMapClick);
    }
    globalMapManager.updateMarkers(lat, lon, tagsList);
}

function initApp() {
    updateLocation();

    // NEU: Button-Listener für Paging
    const btnPrev = document.getElementById('btn-prev-page');
    if (btnPrev) btnPrev.addEventListener('click', () => goToPage(currentPagingState.currentPage -1));

    const btnNext = document.getElementById('btn-next-page');
    if (btnNext) btnNext.addEventListener('click', () => goToPage(currentPagingState.currentPage+1 ));

    const devToggle = document.getElementById('dev-mode-toggle');
    if (devToggle) {
        devToggle.addEventListener('change', handleDevModeToggle);
    }

    const taggingForm = document.getElementById('tag-form');
    if (taggingForm) {
        taggingForm.addEventListener('submit', handleTaggingSubmit);
    }

    const discoveryForm = document.getElementById('discoveryFilterForm');
    if (discoveryForm) {
        discoveryForm.addEventListener('submit', handleDiscoverySubmit);
    }
}

/**
 * Holt hart die echten GPS-Koordinaten, füllt die Felder und triggert eine Suche.
 * Perfekt für den Start ODER wenn der Dev-Mode ausgeschaltet wird!
 */
function getCurrentLocation() {
    console.log("Hole echten GPS-Standort...");

    LocationHelper.findLocation((helper) => {
        const lat = helper.latitude;
        const lon = helper.longitude;

        // Formulare befüllen
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;

        if (document.getElementById('hidden_latitude')) {
            document.getElementById('hidden_latitude').value = lat;
            document.getElementById('hidden_longitude').value = lon;
        }

        console.log("Echter Standort wiederhergestellt. Lade Daten vom Server...");
        handleDiscoverySubmit(new Event('submit'));
    });
}

//Updaters


/**
 * A function to retrieve the current location and update the page.
 * It is called once the page has been fully loaded.
 */
function updateLocation() {
    const latValue = document.getElementById('latitude').value;
    const lonValue = document.getElementById('longitude').value;

    if (latValue && lonValue) {
        console.log("Koordinaten existieren bereits im Formular. Triggere initialen Fetch...");
        // Wir haben schon Koordinaten -> Einfach die AJAX-Suche auslösen!
        handleDiscoverySubmit(new Event('submit'));
    } else {
        getCurrentLocation();
    }
}

/**
 * Nimmt ein Array von GeoTag-Objekten und zeichnet die HTML-Liste sowie die Karte neu.
 */
function updateDisplay(tagsArray) {
    // 1. Die HTML-Liste finden und komplett leeren (Reset)
    const resultList = document.getElementById('discoveryResults');
    resultList.innerHTML = '';

    // 2. Für jeden GeoTag im Array ein neues <li> Element bauen
    tagsArray.forEach(function(tag) {
        const li = document.createElement('li');
        // Wir bauen den Text genau so zusammen, wie er vorher im EJS-Template aussah
        li.textContent = `${tag.name} ( ${tag.latitude},${tag.longitude}) ${tag.hashtag}`;
        resultList.appendChild(li); // Element in die Liste hängen
    });

    // 3. Die Karte aktualisieren
    // Wir holen uns die aktuellen Koordinaten des Nutzers aus den Such-Feldern
    const lat = document.getElementById('hidden_latitude').value || document.getElementById('latitude').value;
    const lon = document.getElementById('hidden_longitude').value || document.getElementById('longitude').value;

    initAndUpdateMap(lat, lon, tagsArray);
}

//Handlers

function handleTaggingSubmit(event) {
    event.preventDefault();

    // 1. Daten auslesen
    const lat = document.getElementById('latitude').value;
    const lon = document.getElementById('longitude').value;
    const name = document.getElementById('name').value;
    const hashtag = document.getElementById('hashtag').value;

    // 2. Das Payload-Dictionary bauen
    const payload = {
        latitude: lat,
        longitude: lon,
        name: name,
        hashtag: hashtag
    };

    // 3. Den AJAX POST-Request abfeuern
    fetch('/api/geotags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // WICHTIG: Sagt dem Server, dass JSON kommt!
        },
        body: JSON.stringify(payload)
    })
        .then(function(response) {
            // HTTP-Status checken
            if (response.status === 201) {
                return response.json(); // Parse die Server-Antwort als JSON
            } else {
                throw new Error("Server hat Fehler gemeldet: " + response.status);
            }
        })
        .then(function(neuerTagVomServer) {
            console.log("Erfolgreich vom Server gespeichert:", neuerTagVomServer);
            handleDiscoverySubmit(new Event('submit'));
        })
        .catch(function(error) {
            console.error("Netzwerkfehler beim POST:", error);
        });
}

function handleDiscoverySubmit(event) {
    event.preventDefault(); // Verhindert den Seiten-Reload

    // 1. Suchbegriff und Koordinaten aus dem Formular auslesen
    const searchterm = document.getElementById('searchterm').value;
    const lat = document.getElementById('hidden_latitude').value;
    const lon = document.getElementById('hidden_longitude').value;

    // 2. Die URL für unseren GET-Request zusammenbasteln
    // Das ? markiert den Beginn der Parameter, das & trennt sie.
    const url = `/api/geotags?searchterm=${searchterm}&latitude=${lat}&longitude=${lon}`;

    console.log("Sende GET Request an:", url);

    // 3. Den AJAX GET-Request abfeuern
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json' // Wir wollen JSON als Antwort, kein HTML
        }
    })
        .then(function(response) {
            if (response.ok) {
                return response.json(); // Server-Antwort in ein JS-Array verwandeln
            } else {
                throw new Error("Server Fehler: " + response.status);
            }
        })
        .then(function(serverResponse) {
            console.log("Suchergebnisse empfangen:", serverResponse);
            updateDisplay(serverResponse.tags);
            updatePagingUI(serverResponse.paging);
        })
        .catch(function(error) {
            console.error("Netzwerkfehler beim GET:", error);
        });
}

//paging



/**
 * Aktualisiert die Anzeige und den Status der Vor/Zurück-Buttons
 */
function updatePagingUI(pagingData) {
    currentPagingState = pagingData;

    const controlsDiv = document.getElementById('paging-controls');
    const infoSpan = document.getElementById('paging-info');
    const btnPrev = document.getElementById('btn-prev-page');
    const btnNext = document.getElementById('btn-next-page');

    if (!controlsDiv || !infoSpan) return;

    // Buttons einblenden
    controlsDiv.style.display = 'flex';

    // Text aktualisieren
    infoSpan.textContent = `Seite ${currentPagingState.currentPage} von ${currentPagingState.totalPages}`;

    // Buttons (de-)aktivieren gemäß den Regeln des Profs!
    btnPrev.disabled = currentPagingState.currentPage <= 1;
    btnNext.disabled = currentPagingState.currentPage >= currentPagingState.totalPages;
}

/**
 * Hilfsfunktion: Feuert eine neue Suche mit der angeforderten Seite ab
 */
function goToPage(targetPage) {
    // Verhindere out-of-bounds Klicks (Sicherheitsschicht!)
    if (targetPage < 1 || targetPage > currentPagingState.totalPages) return;

    // Suchbegriff und Koordinaten aus dem Formular holen (wie bei normaler Suche)
    const searchterm = document.getElementById('searchterm').value;
    const lat = document.getElementById('hidden_latitude').value;
    const lon = document.getElementById('hidden_longitude').value;

    // URL MIT PAGING-PARAMETER BASTELN!
    const url = `/api/geotags?searchterm=${searchterm}&latitude=${lat}&longitude=${lon}&page=${targetPage}`;

    // AJAX Call (Genau wie in handleDiscoverySubmit)
    fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    })
        .then(response => response.json())
        .then(serverResponse => {
            updateDisplay(serverResponse.tags);
            updatePagingUI(serverResponse.paging);
        })
        .catch(error => console.error("Paging Error:", error));
}




// Devmode sachen

function handleMapClick(clickedLat, clickedLon) {
    const devToggle = document.getElementById('dev-mode-toggle');

    // Nur reagieren, wenn der Dev-Mode an ist!
    if (devToggle && devToggle.checked) {
        const latStr = clickedLat.toFixed(5);
        const lonStr = clickedLon.toFixed(5);

        console.log(`Karte geklickt! Setze Koordinaten auf: ${latStr}, ${lonStr}`);

        // Formularfelder befüllen
        document.getElementById('latitude').value = latStr;
        document.getElementById('longitude').value = lonStr;

        if (document.getElementById('hidden_latitude')) {
            document.getElementById('hidden_latitude').value = latStr;
            document.getElementById('hidden_longitude').value = lonStr;
        }
        console.log("Triggere automatische Suche für neuen Standort...");
        handleDiscoverySubmit(new Event('submit'));
    }
}

function handleDevModeToggle(event) {
    const isDev = event.target.checked;

    document.getElementById('latitude').readOnly = !isDev;
    document.getElementById('longitude').readOnly = !isDev;

    // Für die Suche auch entsperren (falls du die Felder im Discovery-Formular hast)
    if (document.getElementById('hidden_latitude')) {
        document.getElementById('hidden_latitude').readOnly = !isDev;
        document.getElementById('hidden_longitude').readOnly = !isDev;
    }

    console.log("Dev Mode ist jetzt:", isDev ? "AN (Klick auf die Karte!)" : "AUS");

    if (!isDev) {
        console.log("Setze auf echten Standort zurück...");
        getCurrentLocation();
    }
}


document.addEventListener("DOMContentLoaded", initApp);