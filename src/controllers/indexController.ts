import asyncHandler from "express-async-handler"

// Display Home page.
export const get_home_page = asyncHandler(async (req, res, next) => {
  res.render('index', { title: 'Express' });
});