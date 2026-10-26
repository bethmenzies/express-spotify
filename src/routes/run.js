var express = require('express');
var router = express.Router();

const { run } = require("../controllers/runController")

// GET request for list of all Artists.
router.get("/", run);

module.exports = router;