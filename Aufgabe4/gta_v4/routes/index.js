// File origin: VS1LAB A3, A4

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
const searchRadius = 1; //1 Kilometer, passend zur Haversine-Berechnung!
/**
 * The module "geotag" exports a class GeoTagStore.
 * It represents geotags.
 */
// eslint-disable-next-line no-unused-vars
const GeoTag = require('../models/geotag');

/**
 * The module "geotag-store" exports a class GeoTagStore.
 * It provides an in-memory store for geotag objects.
 */
// eslint-disable-next-line no-unused-vars
const GeoTagStore = require('../models/geotag-store');

const GeoTagExamples = require('../models/geotag-examples');

// =========================================================================
// EIGENER CODE: Store initialisieren und mit Beispielen füllen (wie in A3)
// =========================================================================
const store = new GeoTagStore();
const examples = GeoTagExamples.tagList;

for (let i = 0; i < examples.length; i++) {
  let name = examples[i][0];
  let lat = examples[i][1];
  let lon = examples[i][2];
  let hashtag = examples[i][3];
  store.addGeoTag(new GeoTag(lat, lon, name, hashtag)); // ID wird vom Store generiert
}
// =========================================================================

// App routes (A3)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */
router.get('/', (req, res) => {
  res.render('index', { taglist: [] });
});


// API routes (A4)

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * As a response, an array with Geo Tag objects is rendered as JSON.
 */
router.get('/api/geotags', (req, res) => {
  const searchterm = req.query.searchterm || '';

  // Fall 1: Location-Parameter sind vorhanden -> Volle Filterung (Umkreis + Keyword)
  if (req.query.latitude && req.query.longitude) {
    const lat = parseFloat(req.query.latitude);
    const lon = parseFloat(req.query.longitude);

    // Optional: Falls der Client einen eigenen Radius mitschickt, nehmen wir den, sonst Default 1000
    const radius = parseFloat(req.query.radius) || searchRadius;

    console.log(`API GET: Filter nach Umkreis (${lat}, ${lon}) und Keyword: "${searchterm}"`);
    const localResults = store.searchNearbyGeoTags(searchterm, lat, lon, radius);
    return res.status(200).json(localResults);
  }

  // Fall 2: Keine Location vorhanden -> Filtere NUR nach Keyword über alle Instanzen
  console.log(`API GET: Filter nur nach Keyword über alle Tags: "${searchterm}"`);
  const globalResults = store.searchGeoTagsByKeyword(searchterm);
  res.status(200).json(globalResults);
});

/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * The URL of the new resource is returned in the header as a response.
 */
router.post('/api/geotags', (req, res) => {
  const lat = parseFloat(req.body.latitude);
  const lon = parseFloat(req.body.longitude);
  const name = req.body.name;
  const hashtag = req.body.hashtag;

  const newTag = new GeoTag(lat, lon, name, hashtag);
  const savedTag = store.addGeoTag(newTag);

  res.setHeader('Location', `/api/geotags/${savedTag.id}`);
  res.status(201).json(savedTag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * The requested tag is rendered as JSON in the response.
 */
router.get('/api/geotags/:id', (req, res) => {
  const id = req.params.id;
  const tag = store.getGeoTagById(id);

  if (!tag) {
    return res.status(404).json({ error: "GeoTag not found" });
  }
  res.status(200).json(tag);
});


/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * Changes the tag with the corresponding ID to the sent value.
 */
router.put('/api/geotags/:id', (req, res) => {
  const id = req.params.id;

  const updatedTagData = new GeoTag(
      parseFloat(req.body.latitude),
      parseFloat(req.body.longitude),
      req.body.name,
      req.body.hashtag,
      id // Die ID muss erhalten bleiben!
  );

  const result = store.updateGeoTag(id, updatedTagData);

  if (!result) {
    return res.status(404).json({ error: "GeoTag not found" });
  }
  res.status(200).json(result);
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * Deletes the tag with the corresponding ID.
 */
router.delete('/api/geotags/:id', (req, res) => {
  const id = req.params.id;

  const deletedTag = store.removeGeoTag(id);
  if (!deletedTag) {
    return res.status(404).json({ error: "GeoTag not found" });
  }
  res.status(200).json({ message: "GeoTag deleted", tag: deletedTag });
});

module.exports = router;