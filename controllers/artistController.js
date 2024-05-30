const Artist = require("../models/artist");
const asyncHandler = require("express-async-handler");
const spotify_controller = require("./spotifyController");

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

const get_spotify_id_for_artist = async (artistName) => {
  let path = `/v1/search?q=artist:${artistName}&type=artist`;
  let escapedPath = encodeURI(path);
  
  const options = {
    hostname: 'api.spotify.com',
    path: escapedPath,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  };

  return await spotify_controller.call_spotify(options);
}

exports.get_spotify_ids = async () => {
  const allArtists = await Artist.find({}, "name spotify_id").sort({ name: 1 }).exec();

  for (let i = 0; i < allArtists.length; i++) {
    let artist = allArtists[i]
    if (artist.spotify_id === null || artist.spotify_id == "") {
      let body = await get_spotify_id_for_artist(artist.name);
      let spotifyId = body.artists.items[0].id;
      const new_artist = new Artist({
        name: artist.name,
        spotify_id: spotifyId,
        _id: artist.id
      });
      await Artist.findByIdAndUpdate(artist.id, new_artist, {});
    }
  }
}