var express = require('express');
var router = express.Router();
const { refresh, confirm } = require("../controllers/refreshController")

/* GET home page. */
router.get('/', refresh);

router.get("/confirm", confirm);

module.exports = router;