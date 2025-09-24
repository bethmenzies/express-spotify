var express = require('express');
var router = express.Router();

const artist_controller = require("../controllers/artistController")

// GET request for list of all Artists.
router.get("/", artist_controller.artist_list);

router.get("/add", artist_controller.artist_add_get);
router.post("/add", artist_controller.artist_add_post);

router.get("/artist/:id/delete", artist_controller.artist_delete_get);
router.post("/artist/:id/delete", artist_controller.artist_delete_post);

router.get("/artist/:id/run", artist_controller.run_for_artist_get);
router.post("/artist/:id/run", artist_controller.run_for_artist_post);

router.get("/artist/:id/edit", artist_controller.artist_edit_get)
router.post("/artist/:id/edit", artist_controller.artist_edit_post)

module.exports = router;