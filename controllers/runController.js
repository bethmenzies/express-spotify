const artist_controller = require("../controllers/artistController")
const { add_tracks, create_playlist, add_tracks_no_playlist_position, add_tracks_to_artist_playlists } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const { recent_albums_by_artist, albums_for_artist } = require('../controllers/albumController.js');
const { tracks_by_album, remove_old_tracks, artist_tracks_by_album } = require('../controllers/trackController.js');
const Artist = require('../models/artist');

const get_date_2_years_ago = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  date.setFullYear(date.getFullYear() - 2)
  return date.toISOString().split('T')[0]
}

exports.run = asyncHandler(async (req, res, next) => {
  let playlistState
  if (process.env.PLAYLIST_ID) {
    playlistState = "updated"
  } else {
    playlistState = "created"
  }
  const date = get_date_2_years_ago()
  let removedTracks
  if (process.env.PLAYLIST_ID) {
    removedTracks = await remove_old_tracks(date)
  }
  await artist_controller.get_spotify_ids();
  let albums = await recent_albums_by_artist(date);
  if (albums.length === 0) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting recent albums. Please try again.",
      removedTracks: removedTracks,
      tracks: []
    });
    return;
  }
  let tracks = await tracks_by_album(albums);
  if (tracks === null) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting album tracks. Please try again.",
      removedTracks: removedTracks,
      tracks: []
    });
    return;
  }
  if (tracks.length === 0) {
    res.render("run", {
      title: "Completed!",
      state: "nothing",
      error: null,
      removedTracks: removedTracks,
      tracks: tracks
    });
    return;
  }
  let playlistId;
  if (process.env.PLAYLIST_ID) {
    playlistId = process.env.PLAYLIST_ID;
  } else {
    let playlist = await create_playlist();
    playlistId = playlist.id
  }
  let playlist = await add_tracks(playlistId, tracks);
  if (!playlist) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.",
      removedTracks: removedTracks,
      tracks: tracks
    });
    return;
  } 
  let artistPlaylists = await add_tracks_to_artist_playlists(tracks)
  if (!artistPlaylists) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to artists playlist. You might want to do this manually.",
      removedTracks: removedTracks,
      tracks: tracks
    });
    return;
  } else {
    res.render("run", {
      title: "Completed!",
      state: playlistState,
      error: null,
      removedTracks: removedTracks,
      tracks: tracks
    });
    return;
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