const artist_controller = require("../controllers/artistController")
const { remove_tracks, add_tracks, create_playlist, find_playlist, add_tracks_no_playlist_position } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const { recent_albums_by_artist, albums_for_artist } = require('../controllers/albumController.js');
const { tracks_by_album, get_old_tracks, artist_tracks_by_album } = require('../controllers/trackController.js');
const Artist = require('../models/artist');

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
      remove_tracks(tracks);
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
    let playlist = await create_playlist();
    playlistId = playlist.id
    playlistState = "created";
  }
  let playlist = await add_tracks(playlistId, tracks);
  if (!playlist) {
    res.send("Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.")
  } else {
    res.render("run", {
      title: "Run",
      state: playlistState,
      tracks: tracks
    });
  }
});

exports.runForArtist = async (artist, req, res, next) => {
  return new Promise(async (resolve) => {
    let albums = await albums_for_artist(artist.spotify_id)
    if (albums.length === 0) {
      return resolve("Something failed when getting recent albums. Please try again.")
    }
    let tracks = await artist_tracks_by_album(albums, artist.name);
    if (tracks === null) {
      return resolve("Something failed when getting album tracks. Please try again.")
    }
    let playlistBody = await create_playlist(artist.name)
    let playlistId = playlistBody.id
    let playlist = await add_tracks_no_playlist_position(playlistId, tracks);
    if (!playlist) {
      resolve("Something went wrong when adding tracks to playlist. Try again.")
    } else {
      resolve(`${artist.name} playlist created!`);
    }
  })
}