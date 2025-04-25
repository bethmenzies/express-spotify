const asyncHandler = require("express-async-handler");
const Track = require("../models/playlistTrack");

const refresh = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  res.render('refresh', { 
    title: 'Refresh Cache',
    watchlist: watchlist
  });
});

const confirm = asyncHandler(async (req, res, next) => {
  await Track.updateMany({"to_include": false}, {"$set":{"to_include": true}}).exec();
  res.redirect("/");
});

module.exports = { refresh, confirm }