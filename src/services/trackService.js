const { remove_tracks } = require("./spotify/playlist");
const { getOldDate } = require("../utils/dateUtils");
const { findTracksLteDate, deleteTracksLteDate, findTrackByUri, updateTrackPlaylistPosition, saveNewTrack } = require("./db/tracks");

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

const updateTracksInDB = async (tracks, watchlist) => {
  playlistPosition = 0
  addedTracks = []
  for (const track of tracks) {
    const existingTracks = await findTrackByUri(track.uri, track.album.artist.name, watchlist)

    if (existingTracks.length > 0) {
      const existingTrack = existingTracks[0]
      if (existingTrack.to_include) {
        await updateTrackPlaylistPosition(existingTrack._id, playlistPosition)
        playlistPosition++
      }
    } else {
      const newTrack = await saveNewTrack(track, watchlist)
      const newTrackWithPlaylistPosition = await updateTrackPlaylistPosition(newTrack._id, playlistPosition)
      playlistPosition++
      addedTracks.push(newTrackWithPlaylistPosition)
    }
  }
  return addedTracks
}

module.exports = { removeTracksFromDB, removeTracksFromPlaylist, updateTracksInDB }