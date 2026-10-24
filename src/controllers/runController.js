const { add_tracks, create_playlist, add_tracks_no_playlist_position, add_tracks_to_artist_playlists } = require("./playlistController.js")
const asyncHandler = require("express-async-handler");
const { recentAlbums, albums_for_artists } = require('./albumController.js');
const { recentTracks, artist_tracks_by_album } = require('./trackController.js');
const { removeTracksFromDB, removeTracksFromPlaylist, updateTracksInDB } = require('../services/trackService.js');

const runForLatestTracks = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let removedTracks = await removeTracksFromDB(watchlist)

  let playlistId, playlistState

  if (watchlist === true || watchlist === "true") {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID 
    playlistState = "updated"
  }
  if (watchlist === false || watchlist === "false") {
    playlistId = process.env.PLAYLIST_ID
    playlistState = "updated"
  }

  let allResponses = await removeTracksFromPlaylist(removedTracks, playlistId)
  if (!allResponses) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when removing tracks from the playlist. You might want to do this manually.",
      errorStatus: allResponses.error.error.status,
      errorMessage: allResponses.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  
  if (playlistId === undefined || playlistId === null) {
    let playlistResponse = await create_playlist();
    if (playlistResponse.error.error) {
      res.render("run", {
        title: "Error!",
        state: "created",
        error: "Something went wrong when creating a new playlist. Try again - or wait some time and try later.",
        errorStatus: playlistResponse.error.error.status,
        errorMessage: playlistResponse.error.error.message,
        removedTracks: removedTracks,
        tracks: [],
        watchlist: watchlist
      });
      return;
    }
    playlistId = playlistResponse.id
    playlistState = "created"
  }

  let albumsResponse = await recentAlbums(watchlist);
  if (albumsResponse.error.error) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting recent albums. Please try again.",
      errorStatus: albumsResponse.error.error.status,
      errorMessage: albumsResponse.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  let tracksResponse = await recentTracks(albumsResponse.albums, watchlist);
  if (tracksResponse.error.error) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting album tracks. Please try again.",
      errorStatus: tracksResponse.error.error.status,
      errorMessage: tracksResponse.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    });
    return;
  }
  let addedTracks = await updateTracksInDB(tracksResponse.tracks, watchlist)
  if (addedTracks.length === 0) {
    res.render("run", {
      title: "Completed!",
      state: null,
      error: null,
      errorStatus: null,
      errorMessage: null,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    });
    return;
  }
  
  let playlist = await add_tracks(playlistId, addedTracks);
  if (!playlist.allSuccess) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.",
      errorStatus: playlist.error.error.status,
      errorMessage: playlist.error.error.message,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    });
    return;
  } 
  let artistPlaylists = await add_tracks_to_artist_playlists(addedTracks)
  if (!artistPlaylists.allSuccess) {
    res.render("run", {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to artists playlist. You might want to do this manually.",
      errorStatus: artistPlaylists.error.error.status,
      errorMessage: artistPlaylists.error.error.message,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    });
    return;
  } else {
    res.render("run", {
      title: "Completed!",
      state: playlistState,
      error: null,
      errorStatus: null,
      errorMessage: null,
      removedTracks: removedTracks,
      tracks: addedTracks,
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
    if (playlistBody.error) {
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