const artist_controller = require("../controllers/artistController")
const playlist_controller = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const recent_albums_by_artist = require('../controllers/albumController.js');
const tracks_by_album = require('../controllers/trackController.js');

exports.run = asyncHandler(async (req, res, next) => {
  await artist_controller.get_spotify_ids();
  let albums = await recent_albums_by_artist();
  if (albums.length === 0) {
    return res.send("Something failed when getting recent albums. Please try again.")
  }
  let tracks = await tracks_by_album(albums);
  if (tracks === null) {
    return res.send("Something failed when getting album tracks. Please try again.")
  }
  if (tracks.length === 0) {
    return res.send("No new tracks. See you soon!");
  }
  let playlistId;
  let playlistState;
  if (process.env.PLAYLIST_ID) {
    playlistId = process.env.PLAYLIST_ID;
    playlistState = "updated";
  } else {
    let playlist = await playlist_controller.create_playlist();
    playlistId = playlist.id
    playlistState = "created";
  }
  await playlist_controller.add_tracks(playlistId, tracks);
  res.send(`Playlist ${playlistState}!`);
});