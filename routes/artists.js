var express = require('express');
var router = express.Router();

const artist_controller = require("../controllers/artistController")

// GET request for list of all Artists.
router.get("/", artist_controller.artist_list);

module.exports = router;