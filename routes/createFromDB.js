var express = require('express');
var router = express.Router();
const create_playlist_from_db = require("../controllers/createFromDB.js")

// GET request for list of all Artists.
router.get("/", create_playlist_from_db);

module.exports = router;