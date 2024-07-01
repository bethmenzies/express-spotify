const asyncHandler = require("express-async-handler");

// Display Home page.
const get_home_page = asyncHandler(async (req, res, next) => {
  res.render('index', { title: 'Express' });
});

module.exports = get_home_page