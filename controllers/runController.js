const artist_controller = require("../controllers/artistController")
const playlist_controller = require("../controllers/playlistController")
const track_controller = require("../controllers/trackController")
const asyncHandler = require("express-async-handler");
const recent_albums_by_artist = require('../controllers/albumController.js');
const tracks_by_album = require('../controllers/trackController.js');

exports.run = asyncHandler(async (req, res, next) => {
  await artist_controller.get_spotify_ids();
  let albums = await recent_albums_by_artist();
  if (albums.length === 0) {
    res.send("Something failed when getting recent albums. Please try again.")
  } else {
    let tracks = await tracks_by_album(albums);
    if (!tracks) {
      res.send("Something failed when getting album tracks. Please try again.")
    } else {
      let playlist = await playlist_controller.create_playlist();
      await playlist_controller.add_tracks(playlist.id);
      res.send("run");
    }
  }
});