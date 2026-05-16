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



router.post('/tagging', (req, res) => {
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const name = req.body.name;
  const hashtag = req.body.hashtag;

  // FIX 1: Richtige Reihenfolge für den Konstruktor
  const newTag = new GeoTag(lat, lon, name, hashtag);
  store.addGeoTag(newTag);

  // FIX 2: Zahl (Radius) übergeben, keinen Text!
  const nearbyTags = store.getNearbyGeoTags(lat, lon, 1000);

  // FIX 3: lat und lon an das EJS-Template weiterreichen
  res.render('index', { taglist: nearbyTags, lat: lat, lon: lon });
});

router.post('/discovery', (req, res) => {
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const searchterm = req.body.searchterm || '';

  const searchResults = store.searchNearbyGeoTags(searchterm, lat, lon, 1000);

  // FIX 3 (auch hier!): lat und lon an das EJS-Template weiterreichen
  res.render('index', { taglist: searchResults, lat: lat, lon: lon });
});

module.exports = router;