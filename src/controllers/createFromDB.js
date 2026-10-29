const { addAllTracksToPlaylist } = require("./playlistController")
const { findAllTracksToInclude } = require('../services/db/tracks')
const asyncHandler = require("express-async-handler");
const { create_playlist } = require('../services/spotify/playlist')

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
  const tracks = await findAllTracksToInclude(watchlist, 'playlist_position uri to_include album.release_date album.artist.name')
  let result = await addAllTracksToPlaylist(playlist.id, tracks);
  process.env.PLAYLIST_ID = playlist.id
  if (result.error) {
    res.render("error", {
      title: "Error!",
      error: "Something went wrong when adding tracks to the playlist. Try again - or wait some time and try later.",
      errorStatus: result.error.status,
      errorMessage: result.error.message,
    });
  } else {
    res.send("Playlist created from tracks in DB!");
  }
});

module.exports = create_playlist_from_db