const artist_controller = require("../controllers/artistController")
const playlist_controller = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const recent_albums_by_artist = require('../controllers/albumController.js');
const { tracks_by_album, get_old_tracks } = require('../controllers/trackController.js');

const get_date_2_years_ago = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  date.setFullYear(date.getFullYear() - 2)
  return date.toISOString().split('T')[0]
}

exports.run = asyncHandler(async (req, res, next) => {
  const date = get_date_2_years_ago()
  if (process.env.PLAYLIST_ID) {
    let tracks = await get_old_tracks(date)
    if (tracks.length > 0) {
      playlist_controller.remove_old_tracks(tracks);
    }
  }
  await artist_controller.get_spotify_ids();
  let albums = await recent_albums_by_artist(date);
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