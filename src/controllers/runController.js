const { addAllTracksToPlaylist } = require("./playlistController.js")
const asyncHandler = require("express-async-handler");
const { albums_for_artists } = require('./albumController.js');
const { artist_tracks_by_album } = require('./trackController.js');
const { runForLatestTracks } = require("../services/runService.js")
const { create_playlist } = require("../services/spotify/playlist.js")

const run = asyncHandler(async (req, res, next) => {
  const watchlist = req.query.watchlist
  let toRender = await runForLatestTracks(watchlist)
  res.render("run", toRender)
  return
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
    let playlist = await addAllTracksToPlaylist(playlistId, tracks.tracks);
    if (!playlist.allSuccess) {
      resolve("Something went wrong when adding tracks to playlist. Try again.")
    } else {
      resolve(`${artist.name} playlist created!`);
    }
  })
}

module.exports = { run, runForArtist }