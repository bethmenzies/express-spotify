const Artist = require("../models/artist");
const Track = require("../models/playlistTrack");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { call_spotify } = require("./spotifyController");
const { remove_tracks } = require("./playlistController");
const { runForArtist } = require("./runController")

exports.run_for_artist_get = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();

  if (artist === null) {
    res.redirect("/artists")
  }

  res.render("artist_run", {
    title: "Run for Artist",
    artist: artist
  })
})

exports.run_for_artist_post = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();
  let completedString = await runForArtist(artist)
  return res.send(completedString)

})

exports.artist_delete_get = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();

  if (artist === null) {
    res.redirect("/artists");
  }

  res.render("artist_delete", {
    title: "Delete Artist",
    artist: artist
  });
});

exports.artist_delete_post = asyncHandler(async (req, res, next) => {
  let artist = await Artist.findById(req.body.artistid).exec();
  let tracks = await Track.find({ 'album.artist.name': artist.name }).exec();

  if (process.env.PLAYLIST_ID) {
    let isDeleted = await remove_tracks(tracks)
    if (isDeleted) {
      await Artist.findByIdAndDelete(req.body.artistid).exec();
      await Track.deleteMany({ 'album.artist.name': artist.name }).exec();
      res.redirect("/artists");
    } else {
      res.send("Something failed when deleting artist tracks from playlist. Please try to delete the artist again.")
    }
  } else {
    await Artist.findByIdAndDelete(req.body.artistid).exec();
    await Track.deleteMany({ 'album.artist.name': artist.name }).exec();
    res.redirect("/artists");
  }
});

exports.artist_add_get = (req, res, next) => {
  res.render("artist_form", { title: "Add Artist" });
};

exports.artist_add_post = [
  body("name", "Artist name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 }),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    let body = await get_spotify_id_for_artist(req.body.name);
    if (body.artists.items.length === 0) {
      res.send(`No results for ${req.body.name} in Spotify`);
    }
    let spotifyId = body.artists.items.find(itemArtist => req.body.name.toLowerCase() === itemArtist.name.toLowerCase()).id;
    const new_artist = new Artist({
      name: req.body.name,
      spotify_id: spotifyId
    });

    if (!errors.isEmpty()) {
      res.render("artist_form", {
        title: "Create Artist",
        artist: new_artist,
        errors: errors.array(),
      });
      return;
    } else {
      const artistExists = await Artist.findOne({ name: req.body.name })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (artistExists) {
        res.redirect("/artists");
      } else {
        await new_artist.save();
        res.redirect("/artists");
      }
    }
  })
];

exports.artist_list = asyncHandler(async (req, res, next) => {
  const numArtists = await Artist.countDocuments({}).exec();

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
  let path = `/v1/search?q=${artistName}&type=artist`;
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

  return await call_spotify(options);
}

exports.get_spotify_ids = async () => {
  const allArtists = await Artist.find({}, "name spotify_id").sort({ name: 1 }).exec();

  for (let i = 0; i < allArtists.length; i++) {
    let artist = allArtists[i]
    if (artist.spotify_id === null || artist.spotify_id == "" || artist.spotify_id === undefined) {
      let body = await get_spotify_id_for_artist(artist.name);
      if (body.artists.items.length === 0) {
        console.log(`No results for ${artist.name}`);
        continue;
      }
      let spotifyId = body.artists.items.find(itemArtist => artist.name.toLowerCase() === itemArtist.name.toLowerCase()).id;
      const new_artist = new Artist({
        name: artist.name,
        spotify_id: spotifyId,
        _id: artist.id
      });
      await Artist.findByIdAndUpdate(artist.id, new_artist, {}).exec();
    }
  }
}