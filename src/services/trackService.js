const { remove_tracks } = require("../controllers/playlistController");
const { getOldDate } = require("../utils/dateUtils");
const { findTracksLteDate, deleteTracksLteDate } = require("../db/tracks");
const { call_spotify } = require("../controllers/spotifyController")

const removeTracksFromDB = async (watchlist) => {
  const date = getOldDate()
  const tracks = await findTracksLteDate(date, watchlist, "uri to_include album.release_date name url album.artist.name album.name")
  await deleteTracksLteDate(date, watchlist)
  const includedTracks = tracks.filter(track => track.to_include)
  return includedTracks
}

const removeTracksFromPlaylist = async (tracks, playlistId) => {
  if (tracks.length === 0 || !playlistId) {
    return { allResponses: true, error: "" }
  }
  return await remove_tracks(tracks, playlistId);
}

const get_tracks_by_album = async (albumId, limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

module.exports = { removeTracksFromDB, removeTracksFromPlaylist, get_tracks_by_album }