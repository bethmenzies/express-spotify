var express = require('express');
var router = express.Router();

const refresh_controller = require("../controllers/refreshController")

/* GET home page. */
router.get('/', refresh_controller.refresh);

router.get("/confirm", refresh_controller.confirm);

module.exports = router;