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

    /**
     * Fügt einen GeoTag zum Store hinzu.
     */
    addGeoTag(geoTag) {
        this.#tags.push(geoTag);
    }

    /**
     * Entfernt alle GeoTags, die den übergebenen Namen haben.
     */
    removeGeoTag(name) {
        // filter() erstellt ein neues Array mit allen Elementen, die NICHT den Namen haben.
        this.#tags = this.#tags.filter(tag => tag.name !== name);
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

    //todo dearrow
    /**
     * Sucht GeoTags im Umkreis, die ein Keyword enthalten (Name oder Hashtag).
     */
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
