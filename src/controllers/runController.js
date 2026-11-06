const { addAllTracksToPlaylist } = require("./playlistController.js")
const asyncHandler = require("express-async-handler");
const { artistsAlbums } = require('./albumController.js');
const { artistTracksByAlbum } = require('./trackController.js');
const { runForLatestTracks } = require("../services/runService.js")
const { create_playlist } = require("../services/spotify/playlist.js")

const run = asyncHandler(async (req, res, next) => {
  const watchlist = req.query.watchlist
  let toRender = await runForLatestTracks(watchlist)
  res.render("run", toRender)
  return
});

const runForArtist = async (artist) => {
  if (artist === null) {
    return {
      title: "Error!",
      artistName: "N/A",
      error: "No artist found",
      errorStatus: null,
      errorMessage: null,
    }
  }
  let artists = [{ name: artist.name, spotify_id: artist.spotify_id }]
  for (const relatedArtist of artist.related_artists) {
    artists.push({ name: relatedArtist.name, spotify_id: relatedArtist.spotify_id })
  }
  let albumsResponse = await artistsAlbums(artists)
  if (albumsResponse.error.error) {
    return {
      title: "Error!",
      artistName: artist.name,
      error: "Something failed when getting recent albums. Please try again.",
      errorStatus: albumsResponse.error.error.status,
      errorMessage: albumsResponse.error.error.message
    }
  }
  let artistNames = [artist.name]
  for (const relatedArtist of artist.related_artists) {
    artistNames.push(relatedArtist.name)
  }
  let tracksResponse = await artistTracksByAlbum(albumsResponse.albums, artistNames);
  if (tracksResponse.error.error) {
    return {
      title: "Error!",
      artistName: artist.name,
      error: "Something failed when getting album tracks. Please try again.",
      errorStatus: tracksResponse.error.error.status,
      errorMessage: tracksResponse.error.error.message
    }
  }
  let playlistResponse = await create_playlist(artist.name)
  if (playlistResponse.error) {
    return {
      title: "Error!",
      artistName: artist.name,
      error: "Something went wrong when creating the playlist. Try again.",
      errorStatus: playlistResponse.error.status,
      errorMessage: playlistResponse.error.message
    }
  }
  let playlistId = playlistResponse.id
  let playlist = await addAllTracksToPlaylist(playlistId, tracksResponse.tracks);
  if (playlist.error) {
    return {
      title: "Error!",
      artistName: artist.name,
      error: "Something went wrong when adding tracks to playlist. Try again.",
      errorStatus: playlist.error.status,
      errorMessage: playlist.error.message
    }
  } else {
    return {
      title: "Created!",
      artistName: artist.name,
      error: null,
      errorStatus: null,
      errorMessage: null
    }
  }
}

module.exports = { run, runForArtist }