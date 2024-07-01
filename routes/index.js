var express = require('express');
var router = express.Router();
const get_home_page = require("../controllers/indexController")

/* GET home page. */
router.get('/', get_home_page);

module.exports = router;
