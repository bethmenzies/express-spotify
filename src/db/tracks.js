const Track = require('../models/track');

const findTracksLteDate = async (date, watchlist, fields) => {
  return await Track.find({ 'album.release_date': { $lte: date }, watchlist: watchlist }, fields).exec();
}

const deleteTracksLteDate = async (date, watchlist) => {
  return await Track.deleteMany({ 'album.release_date': { $lte: date }, watchlist: watchlist }).exec();
}

module.exports = { findTracksLteDate, deleteTracksLteDate }