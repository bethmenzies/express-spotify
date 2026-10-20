const Artist = require('../models/artist');

const findArtistsByWatchlist = async (watchlist) => {
  return await Artist.find({ watchlist: watchlist }, {}).sort({ name: 1 }).exec();
}

module.exports = { findArtistsByWatchlist }