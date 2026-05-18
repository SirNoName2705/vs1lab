// File origin: VS1LAB A3

/**
 * This script is a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * A class for in-memory-storage of geotags
 *
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 *
 * Provide a method 'addGeoTag' to add a geotag to the store.
 *
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 *
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 *
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields.
 */

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // Erdradius in Kilometern
    var dLat = (lat2 - lat1) * (Math.PI / 180);
    var dLon = (lon2 - lon1) * (Math.PI / 180);
    var lat1Rad = lat1 * (Math.PI / 180);
    var lat2Rad = lat2 * (Math.PI / 180);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon/2) * Math.sin(dLon/2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distanz in Kilometern
}

class InMemoryGeoTagStore {

    // 1. Das private Array.
    // In modernem JS macht das '#' Präfix die Variable von außen absolut unzugänglich.
    #tags = [];
    #currentId = 0; // Unser Auto-Increment Zähler für die REST-API
    /**
     * Fügt einen GeoTag zum Store hinzu und vergibt eine ID.
     * (Für POST /api/geotag)
     */
    addGeoTag(geoTag) {
        if (!geoTag.id) {
            this.#currentId++;
            geoTag.id = this.#currentId.toString(); // IDs immer als String
        }
        this.#tags.push(geoTag);
        return geoTag; // Wichtig: Für die API müssen wir den Tag inkl. neuer ID zurückgeben!
    }

    /**
     * Holt einen spezifischen GeoTag anhand seiner ID. (Für GET /api/geotags/:id)
     */
    getGeoTagById(id) {
        // .find gibt das erste Element zurück, das die Bedingung erfüllt (oder undefined)
        return this.#tags.find(tag => tag.id === id.toString());
    }

    /**
     * Aktualisiert einen GeoTag anhand seiner ID. (Für PUT /api/geotags/:id)
     */
    updateGeoTag(id, updatedTag) {
        // Finde die Position (Index) des Tags im Array
        const index = this.#tags.findIndex(tag => tag.id === id.toString());

        if (index === -1) {
            return null; // Tag nicht gefunden
        }

        // Sicherstellen, dass die ID nicht versehentlich überschrieben wird
        updatedTag.id = id.toString();

        // Altes Objekt mit neuem überschreiben
        this.#tags[index] = updatedTag;
        return updatedTag;
    }

    /**
     * Entfernt einen GeoTag anhand seiner ID (nicht mehr nach Name!). (Für DELETE /api/geotags/:id)
     */
    removeGeoTag(id) {
        const tagToDelete = this.getGeoTagById(id);

        if (!tagToDelete) {
            return null; // Tag gab es gar nicht
        }

        // Wir behalten alle Tags, deren ID NICHT der gesuchten ID entspricht
        this.#tags = this.#tags.filter(tag => tag.id !== id.toString());
        return tagToDelete; // Gelöschtes Objekt für die Response zurückgeben
    }

    /**
     * Gibt alle GeoTags innerhalb eines bestimmten Radius zurück.
     */
    getNearbyGeoTags(latitude, longitude, radius) {
        return this.#tags.filter(tag => {
            const distance = this.#calculateDistance(latitude, longitude, tag.latitude, tag.longitude);
            return distance <= radius;
        });
    }

    searchNearbyGeoTags(keyword, latitude, longitude, radius) {
        // Zuerst alle Tags im Umkreis holen (Code-Wiederverwendung!)
        const nearbyTags = this.getNearbyGeoTags(latitude, longitude, radius);

        // Wenn kein Suchbegriff eingegeben wurde, geben wir einfach alle nahen Tags zurück
        if (!keyword || keyword.trim() === '') {
            return nearbyTags;
        }

        // Für case-insensitive Suche alles in Kleinbuchstaben umwandeln
        const searchStr = keyword.toLowerCase();

        // Nach Namen oder Hashtag filtern
        return nearbyTags.filter(tag => {
            const matchName = tag.name.toLowerCase().includes(searchStr);
            const matchHash = tag.hashtag.toLowerCase().includes(searchStr);

            return matchName || matchHash; // Wenn eines davon zutrifft, behalten
        });
    }

    /**
     * Sucht GeoTags ausschließlich nach einem Keyword (Name oder Hashtag) über den gesamten Speicher.
     * Wird aufgerufen, wenn die API keine Location-Parameter geliefert bekommt.
     */
    searchGeoTagsByKeyword(keyword) {
        // Wenn kein Keyword da ist, geben wir einfach ungesehen ALLE Tags zurück
        if (!keyword || keyword.trim() === '') {
            return this.#tags;
        }

        const searchStr = keyword.toLowerCase();
        const results = [];

        for (let i = 0; i < this.#tags.length; i++) {
            const tag = this.#tags[i];
            const matchName = tag.name.toLowerCase().includes(searchStr);
            const matchHash = tag.hashtag.toLowerCase().includes(searchStr);

            if (matchName || matchHash) {
                results.push(tag);
            }
        }

        return results;
    }


    #calculateDistance(lat1, lon1, lat2, lon2) {
        return calculateHaversineDistance(lat1, lon1, lat2, lon2);
    }

    /**
     * Private Hilfsmethode zur Distanzberechnung (Euklidische Distanz).
     * Für ein Uni-Labor reicht in der Regel der Satz des Pythagoras auf den Koordinaten.
     */
    #calculateEuklidianDistance(lat1, lon1, lat2, lon2) {
        const dLat = lat2 - lat1;
        const dLon = lon2 - lon1;
        return Math.sqrt(dLat * dLat + dLon * dLon);
    }

}

module.exports = InMemoryGeoTagStore;
