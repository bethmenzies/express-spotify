var express = require('express');
var router = express.Router();

const track_controller = require("../controllers/trackController")

// GET request for list of all Artists.
router.get("/", track_controller.track_list);

router.get("/track/:id/delete", track_controller.track_delete_get);
router.post("/track/:id/delete", track_controller.track_delete_post);

router.get("/track/:id/add", track_controller.track_add_get)
router.post("/track/:id/add", track_controller.track_add_post)

module.exports = router;