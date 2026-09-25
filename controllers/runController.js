const { add_tracks, create_playlist, add_tracks_no_playlist_position, add_tracks_to_artist_playlists } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");
const { recent_albums_by_artist, albums_for_artists } = require('../controllers/albumController.js');
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
  if (albums.error.error) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting recent albums. Please try again.",
      errorStatus: albums.error.error.status,
      errorMessage: albums.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  let tracks = await tracks_by_album(albums.albums, watchlist);
  if (tracks.error.error) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting album tracks. Please try again.",
      errorStatus: tracks.error.error.status,
      errorMessage: tracks.error.error.message,
      removedTracks: removedTracks,
      tracks: tracks.tracks,
      watchlist: watchlist
    });
    return;
  }
  if (tracks.tracks.length === 0) {
    res.render("run", {
      title: "Completed!",
      state: "nothing",
      error: null,
      removedTracks: removedTracks,
      tracks: tracks.tracks,
      watchlist: watchlist
    });
    return;
  }
  let thisPlaylistId;
  if (playlistId) {
    thisPlaylistId = playlistId;
  } else {
    let playlist = await create_playlist();
    if (playlist.error) {
      res.render("run", {
        title: "Error!",
        state: playlistState,
        error: "Something went wrong when creating the new playlist. Everything will be in the DB though - so try using the create from DB option.",
        errorStatus: playlist.error.error.status,
        errorMessage: playlist.error.error.message,
        removedTracks: removedTracks,
        tracks: tracks.tracks,
        watchlist: watchlist
      });
      return;
    }
    thisPlaylistId = playlist.id
  }
  let playlist = await add_tracks(thisPlaylistId, tracks.tracks);
  if (!playlist.allSuccess) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.",
      errorStatus: playlist.error.error.status,
      errorMessage: playlist.error.error.message,
      removedTracks: removedTracks,
      tracks: tracks.tracks,
      watchlist: watchlist
    });
    return;
  } 
  let artistPlaylists = await add_tracks_to_artist_playlists(tracks.tracks)
  if (!artistPlaylists.allSuccess) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      errorStatus: artistPlaylists.error.error.status,
      errorMessage: artistPlaylists.error.error.message,
      error: "Something went wrong when adding tracks to artists playlist. You might want to do this manually.",
      removedTracks: removedTracks,
      tracks: tracks.tracks,
      watchlist: watchlist
    });
    return;
  } else {
    res.render("run", {
      title: "Completed!",
      state: playlistState,
      error: null,
      removedTracks: removedTracks,
      tracks: tracks.tracks,
      watchlist: watchlist
    });
    return;
  }
});

const runForArtist = async (artist, req, res, next) => {
  return new Promise(async (resolve) => {
    let artistAndSpotifyIds = [{name: artist.name, spotify_id: artist.spotify_id}]
    for (let i = 0; i < artist.related_artists.length; i++) {
      artistAndSpotifyIds.push({name: artist.related_artists[i].name, spotify_id: artist.related_artists[i].spotify_id})
    }
    let albums = await albums_for_artists(artistAndSpotifyIds)
    if (albums.error.error) {
      return resolve("Something failed when getting recent albums. Please try again.")
    }
    let artistNames = [artist.name]
    for (let i = 0; i < artist.related_artists.length; i++) {
      artistNames.push(artist.related_artists[i].name)
    }
    let tracks = await artist_tracks_by_album(albums.albums, artistNames);
    if (tracks.error.error) {
      return resolve("Something failed when getting album tracks. Please try again.")
    }
    let playlistBody = await create_playlist(artist.name)
    if (playlist.error) {
      resolve("Something went wrong when creating the playlist. Try again.")
    }
    let playlistId = playlistBody.id
    let playlist = await add_tracks_no_playlist_position(playlistId, tracks.tracks);
    if (!playlist.allSuccess) {
      resolve("Something went wrong when adding tracks to playlist. Try again.")
    } else {
      resolve(`${artist.name} playlist created!`);
    }
  })
}

module.exports = { runForLatestTracks, runForArtist }