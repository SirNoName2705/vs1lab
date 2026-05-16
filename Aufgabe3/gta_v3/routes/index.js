// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

/**
 * The module "geotag" exports a class GeoTagStore. 
 * It represents geotags.
 *
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore. 
 * It provides an in-memory store for geotag objects.
 *
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

const GeoTagExamples = require('../models/geotag-examples');


// =========================================================================
// EIGENER CODE: Store initialisieren und mit Beispielen füllen
// =========================================================================
const store = new GeoTagStore();
const examples = GeoTagExamples.tagList;

// Deine geliebte, saubere for-Schleife
for (let i = 0; i < examples.length; i++) {
  let name = examples[i][0];
  let lat = examples[i][1];
  let lon = examples[i][2];
  let hashtag = examples[i][3];
  store.addGeoTag(new GeoTag(lat, lon, name, hashtag));
}
// =========================================================================

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
  res.render('index', { taglist: [] })
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

// TODO: ... your code here ...
router.post('/tagging', (req, res) => {
  // 1. Daten aus dem Formular auslesen (Achtung: Formulardaten sind immer Strings, daher parseFloat)
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const name = req.body.name;
  const hashtag = req.body.hashtag;

  // 2. Neues Objekt erstellen und im Store speichern
  const newTag = new GeoTag(name, lat, lon, hashtag);
  store.addGeoTag(newTag);

  // 3. Umkreissuche um den neuen Tag (Wir nehmen mal einen großen Radius wie 1000, damit man was sieht)
  const nearbyTags = store.getNearbyGeoTags(lat, lon, C);

  // 4. EJS-Template mit der aktualisierten Liste rendern
  res.render('index', { taglist: nearbyTags });
});
/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

// TODO: ... your code here ...
router.post('/discovery', (req, res) => {
  // 1. Daten aus dem Discovery-Formular auslesen (inklusive der versteckten Koordinaten!)
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const searchterm = req.body.searchterm || ''; // Fallback auf leeren String, falls nichts eingegeben wurde

  // 2. Im Store mit Suchbegriff und Koordinaten suchen
  const searchResults = store.searchNearbyGeoTags(searchterm, lat, lon, 1000);

  // 3. EJS-Template mit den Suchergebnissen rendern
  res.render('index', { taglist: searchResults });
});
module.exports = router;
