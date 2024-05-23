const Artist = require("../models/artist");
const asyncHandler = require("express-async-handler");

// Display list of all Artists.
exports.artist_list = asyncHandler(async (req, res, next) => {
    const [
        numArtists
      ] = await Promise.all([
        Artist.countDocuments({}).exec(),
      ]);

      res.render('artists', {
        title: "Artists",
        artist_count: numArtists
      });
});