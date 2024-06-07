var express = require('express');
var router = express.Router();

const run_controller = require("../controllers/createFromDB.js")

// GET request for list of all Artists.
router.get("/", run_controller.run);

module.exports = router;