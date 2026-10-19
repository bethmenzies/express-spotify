var express = require('express');
var router = express.Router();

const { runForLatestTracks } = require("../controllers/runController")

// GET request for list of all Artists.
router.get("/", runForLatestTracks);

module.exports = router;