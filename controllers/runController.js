const artist_controller = require("../controllers/artistController")
const album_controller = require("../controllers/albumController")
const track_controller = require("../controllers/trackController")
const asyncHandler = require("express-async-handler");

exports.run = asyncHandler(async (req, res, next) => {
  await artist_controller.get_spotify_ids();
  await album_controller.recent_albums_by_artist();
  await track_controller.tracks_by_album();
  res.send("run");
});