const { remove_tracks } = require("../controllers/playlistController");
const { getOldDate } = require("../utils/dateUtils");
const Track = require("../models/playlistTrack");

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

const findTracksLteDate = async (date, watchlist, fields) => {
  return await Track.find({ 'album.release_date': { $lte: date }, watchlist: watchlist }, fields).exec();
}

const deleteTracksLteDate = async (date, watchlist) => {
  return await Track.deleteMany({ 'album.release_date': { $lte: date }, watchlist: watchlist }).exec();
}

module.exports = { removeTracksFromDB, removeTracksFromPlaylist, findTracksLteDate, deleteTracksLteDate }