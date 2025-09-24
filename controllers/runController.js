const { add_tracks, create_playlist, add_tracks_no_playlist_position, add_tracks_to_artist_playlists } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const { recent_albums_by_artist, albums_for_artist } = require('../controllers/albumController.js');
const { tracks_by_album, remove_old_tracks, artist_tracks_by_album } = require('../controllers/trackController.js');
const { get_spotify_ids } = require('../controllers/artistController.js')

const get_date_2_years_ago = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  date.setFullYear(date.getFullYear() - 2)
  return date.toISOString().split('T')[0]
}

const runForLatestTracks = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let playlistId 
  if (watchlist === 'true') {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID
  } else {
    playlistId = process.env.PLAYLIST_ID
  }
  let playlistState
  if (playlistId) {
    playlistState = "updated"
  } else {
    playlistState = "created"
  }
  const date = get_date_2_years_ago()
  let removedTracks
  if (playlistId) {
    removedTracks = await remove_old_tracks(date, watchlist, playlistId)
  }
  //await get_spotify_ids(watchlist);
  let albums = await recent_albums_by_artist(date, watchlist);
  if (albums.length === 0) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting recent albums. Please try again.",
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  let tracks = await tracks_by_album(albums, watchlist);
  if (tracks === null) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting album tracks. Please try again.",
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  if (tracks.length === 0) {
    res.render("run", {
      title: "Completed!",
      state: "nothing",
      error: null,
      removedTracks: removedTracks,
      tracks: tracks,
      watchlist: watchlist
    });
    return;
  }
  let thisPlaylistId;
  if (playlistId) {
    thisPlaylistId = playlistId;
  } else {
    let playlist = await create_playlist();
    thisPlaylistId = playlist.id
  }
  let playlist = await add_tracks(thisPlaylistId, tracks);
  if (!playlist) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.",
      removedTracks: removedTracks,
      tracks: tracks,
      watchlist: watchlist
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
      tracks: tracks,
      watchlist: watchlist
    });
    return;
  } else {
    res.render("run", {
      title: "Completed!",
      state: playlistState,
      error: null,
      removedTracks: removedTracks,
      tracks: tracks,
      watchlist: watchlist
    });
    return;
  }
});

const runForArtist = async (artist, req, res, next) => {
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

module.exports = { runForLatestTracks, runForArtist }