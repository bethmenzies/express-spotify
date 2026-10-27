const { add_tracks_from_db } = require("./playlistController")
const asyncHandler = require("express-async-handler");
const { create_playlist } = require('../services/spotifyService')

const create_playlist_from_db = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let playlist = await create_playlist();
  if (playlist.error) {
    res.render("error", {
      title: "Error!",
      error: "Something went wrong when creating the playlist. Try again - or wait some time and try later.",
      errorStatus: playlist.error.error.status,
      errorMessage: playlist.error.error.message,
    });
  }
  let result = await add_tracks_from_db(playlist.id, watchlist);
  process.env.PLAYLIST_ID = playlist.id
  if (!result.allSuccess) {
    res.render("error", {
      title: "Error!",
      error: "Something went wrong when creating the playlist. Try again - or wait some time and try later.",
      errorStatus: playlist.error.error.status,
      errorMessage: playlist.error.error.message,
    });
  } else {
    res.send("Playlist created from tracks in DB!");
  }
});

module.exports = create_playlist_from_db