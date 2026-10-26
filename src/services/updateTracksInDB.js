const { findTrackByUri, updateTrackPlaylistPosition, saveNewTrack } = require("../db/tracks");

// TODO: figure out how to mock properly so this can sit in the track service...
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

module.exports = { updateTracksInDB }