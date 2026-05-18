// File origin: VS1LAB A2 

/**
 * from VS1LAB A3
 * 
 * A class to help using the Leaflet map service.
 */
 // eslint-disable-next-line no-unused-vars
 class MapManager {

    #map
    #defaultIcon
    #markers
    constructor() {
        // Default Icon of Leaflet can not be loaded in our environment, so it  was manually added to the repo
        this.#defaultIcon = L.icon({
           iconUrl: '/images/marker.svg',
           shadowUrl: '/images/marker-shadow.svg',
           iconSize: [25, 41],
           iconAnchor: [12, 41],
           popupAnchor: [1, -34],
           shadowSize: [41, 41]
        });
    }
    
    /**
    * Initialize a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {number} zoom The map zoom, defaults to 18
    */
    initMap(latitude, longitude, zoom = 18) {
        // set up dynamic Leaflet map
        this.#map = L.map('map').setView([latitude, longitude], zoom);
        var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
        L.tileLayer(
            'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; ' + mapLink + ' Contributors'}).addTo(this.#map);
        this.#markers = L.layerGroup().addTo(this.#map);
    }

    /**
    * Update the Markers of a Leaflet map
    * @param {number} latitude The map center latitude
    * @param {number} longitude The map center longitude
    * @param {{latitude, longitude, name}[]} tags The map tags, defaults to just the current location
     * @param {number} radiusInMeters The radius of the circle in meters, defaults to 1000 (1km)
    */
    updateMarkers(latitude, longitude, tags = [], radiusInMeters=1000) {
        // delete all markers
        this.#markers.clearLayers();


        // 2. Den roten Umkreis-Kreis um den aktuellen Standort zeichnen
        L.circle([latitude, longitude], {
            color: 'red',          // Linienfarbe
            fillColor: '#f03',     // Füllfarbe
            fillOpacity: 0.1,      // Wie durchsichtig (0.1 = sehr transparent)
            radius: radiusInMeters // Radius in Metern
        }).addTo(this.#markers);

        // 3. Den "Your Location" Marker setzen
        L.marker([latitude, longitude], { icon: this.#defaultIcon })
            .bindPopup("Your Location")
            .addTo(this.#markers);


        L.marker([latitude, longitude], { icon: this.#defaultIcon })
            .bindPopup("Your Location")
            .addTo(this.#markers);
        for (const tag of tags) {
            L.marker([tag.latitude,tag.longitude], { icon: this.#defaultIcon })
                .bindPopup(tag.name)
                .addTo(this.#markers);  
        }
    }

    /**
     * Erlaubt es, von außen auf Klicks in der Karte zu reagieren.
     * @param {function} callback Eine Funktion, die lat und lon übergeben bekommt.
     */
    onMapClick(callback) {
        if (this.#map) {
            this.#map.on('click', (event) => {
                // Leaflet speichert die Koordinaten im event.latlng Objekt
                callback(event.latlng.lat, event.latlng.lng);
            });
        }
    }
}