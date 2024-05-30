const asyncHandler = require("express-async-handler");

// Display Home page.
exports.home = asyncHandler(async (req, res, next) => {
  res.render('index', { title: 'Express' });
});