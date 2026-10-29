const { addTracksOneByOneToPlaylist, addTracksToArtistPlaylists } = require("../controllers/playlistController.js")
const { recentAlbums } = require('../controllers/albumController.js');
const { recentTracks } = require('../controllers/trackController.js');
const { removeTracksFromDB, removeTracksFromPlaylist, updateTracksInDB } = require('./trackService.js');
const { create_playlist } = require("../services/spotify/playlist.js")

const runForLatestTracks = async (watchlist) => {  
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
    return {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when removing tracks from the playlist. You might want to do this manually.",
      errorStatus: allResponses.error.error.status,
      errorMessage: allResponses.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    }
  }
  
  if (playlistId === undefined || playlistId === null) {
    let playlistResponse = await create_playlist();
    if (playlistResponse.error) {
      return {
        title: "Error!",
        state: "created",
        error: "Something went wrong when creating a new playlist. Try again - or wait some time and try later.",
        errorStatus: playlistResponse.error.status,
        errorMessage: playlistResponse.error.message,
        removedTracks: removedTracks,
        tracks: [],
        watchlist: watchlist
      }
    }
    playlistId = playlistResponse.id
    playlistState = "created"
  }

  let albumsResponse = await recentAlbums(watchlist);
  if (albumsResponse.error.error) {
    return {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting recent albums. Please try again.",
      errorStatus: albumsResponse.error.error.status,
      errorMessage: albumsResponse.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    }
  }
  let tracksResponse = await recentTracks(albumsResponse.albums, watchlist);
  if (tracksResponse.error.error) {
    return {
      title: "Error!",
      state: playlistState,
      error: "Something failed when getting album tracks. Please try again.",
      errorStatus: tracksResponse.error.error.status,
      errorMessage: tracksResponse.error.error.message,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    }
  }
  let addedTracks = await updateTracksInDB(tracksResponse.tracks, watchlist)
  if (addedTracks.length === 0) {
    return {
      title: "Completed!",
      state: null,
      error: null,
      errorStatus: null,
      errorMessage: null,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    }
  }
  
  let addToPlaylist = await addTracksOneByOneToPlaylist(playlistId, addedTracks);
  if (addToPlaylist.error) {
    return {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to playlist. Everything will be in the DB though - so try using the create from DB option.",
      errorStatus: addToPlaylist.error.status,
      errorMessage: addToPlaylist.error.message,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    }
  } 
  let addToArtistPlaylists = await addTracksToArtistPlaylists(addedTracks)
  if (addToArtistPlaylists.error) {
    return {
      title: "Error!",
      state: playlistState,
      error: "Something went wrong when adding tracks to artists playlist. You might want to do this manually.",
      errorStatus: addToArtistPlaylists.error.status,
      errorMessage: addToArtistPlaylists.error.message,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    }
  } else {
    return {
      title: "Completed!",
      state: playlistState,
      error: null,
      errorStatus: null,
      errorMessage: null,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    }
  }
}

module.exports = { runForLatestTracks }