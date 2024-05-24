const Artist = require("../models/artist");
const asyncHandler = require("express-async-handler");

// Display list of all artists.
exports.artist_list = asyncHandler(async (req, res, next) => {
    const [
      numArtists
    ] = await Promise.all([
      Artist.countDocuments({}).exec(),
    ]);

    const allArtists = await Artist.find({}, "name")
      .sort({ name: 1 })
      .exec();
  
    res.render("artists", { 
        title: "Artists",
        artist_count: numArtists,
        artist_list: allArtists 
    });
  });