const artist_controller = require("../controllers/artistController")
const album_controller = require("../controllers/albumController")
const playlist_controller = require("../controllers/playlistController")
const track_controller = require("../controllers/trackController")
const asyncHandler = require("express-async-handler");

exports.run = asyncHandler(async (req, res, next) => {
  await artist_controller.get_spotify_ids();
  await album_controller.recent_albums_by_artist();
  await track_controller.tracks_by_album();
  let playlist = await playlist_controller.create_playlist();
  await playlist_controller.add_tracks(playlist.id);
  res.send("run");
});