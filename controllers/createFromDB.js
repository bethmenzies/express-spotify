const playlist_controller = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");

exports.run = asyncHandler(async (req, res, next) => {
  let playlist = await playlist_controller.create_playlist();
  await playlist_controller.add_tracks(playlist.id);
  process.env.PLAYLIST_ID = playlist.id
  res.send("Playlist created from tracks in DB!");
});