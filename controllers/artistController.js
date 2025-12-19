const Artist = require("../models/artist");
const Track = require("../models/playlistTrack");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { call_spotify } = require("./spotifyController");
const { remove_tracks, add_tracks_no_playlist_position, add_included_tracks } = require("./playlistController");
const { runForArtist } = require("./runController")

const run_for_artist_get = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();

  if (artist === null) {
    res.redirect("/artists")
  }

  res.render("artist_run", {
    title: "Run for Artist",
    artist: artist
  })
})

const run_for_artist_post = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();
  let completedString = await runForArtist(artist)
  return res.send(completedString)

})

const artist_delete_get = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  const artist = await Artist.findById(req.params.id).exec();

  if (artist === null) {
    res.redirect("/artists?watchlist=" + watchlist);
  }

  res.render("artist_delete", {
    title: "Delete Artist",
    artist: artist,
    watchlist: watchlist
  });
});

const artist_swap_playlist_get = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  const artist = await Artist.findById(req.params.id).exec();

  if (artist === null) {
    res.redirect("/artists?watchlist=" + watchlist);
  }

  res.render("artist_swap_playlist", {
    title: "Artist - Swap Playlist",
    artist: artist,
    watchlist: watchlist
  });
})

const artist_swap_playlist_post = asyncHandler(async (req, res, next) => {
  let current_watchlist = req.query.watchlist === 'true'
  let swapped_watchlist = !current_watchlist
  let artist = await Artist.findById(req.body.artistid).exec();
  let tracks = await Track.find({ 'album.artist.name': artist.name }).exec();
  let current_playlistId
  let swapped_playlistId
  if (current_watchlist) {
    current_playlistId = process.env.WATCHLIST_PLAYLIST_ID
    swapped_playlistId = process.env.PLAYLIST_ID
  } else {
    current_playlistId = process.env.PLAYLIST_ID
    swapped_playlistId = process.env.WATCHLIST_PLAYLIST_ID
  }

  if (current_playlistId && swapped_playlistId) {
    let isDeleted = await remove_tracks(tracks, current_playlistId);
    if (!isDeleted) {
      res.send("Something failed when deleting artist tracks from playlist. Please try to swap the artist again.")
    }
    let isAdded = await add_included_tracks(swapped_playlistId, tracks)
    if (!isAdded) {
      res.send("Something failed when adding artist tracks to playlist. Please try to swap the artist again.")
    }
    if (isDeleted && isAdded) {
      await Artist.findByIdAndUpdate(req.body.artistid, {watchlist: swapped_watchlist}).exec();
      await Track.updateMany({ 'album.artist.name': artist.name },{ $set:{ watchlist: swapped_watchlist } }).exec();
      res.redirect("/artists?watchlist=" + current_watchlist);
    }
  } else {
    await Artist.findByIdAndUpdate(req.body.artistid, {watchlist: swapped_watchlist}).exec();
    await Track.updateMany({ 'album.artist.name': artist.name },{ $set:{ watchlist: swapped_watchlist } }).exec();
    res.redirect("/artists?watchlist=" + current_watchlist);
  }
})

const artist_delete_post = asyncHandler(async (req, res, next) => {
  // TODO: delete only for the deleting artist
  let watchlist = req.query.watchlist
  let artist = await Artist.findById(req.body.artistid).exec();
  let tracks = await Track.find({ 'album.artist.name': artist.name }).exec();
  let playlistId
  if (watchlist === 'true') {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID
  } else {
    playlistId = process.env.PLAYLIST_ID
  }

  if (playlistId) {
    let isDeleted = await remove_tracks(tracks, playlistId)
    if (isDeleted) {
      await Artist.findByIdAndDelete(req.body.artistid).exec();
      await Track.deleteMany({ 'album.artist.name': artist.name }).exec();
      res.redirect("/artists?watchlist=" + watchlist);
    } else {
      res.send("Something failed when deleting artist tracks from playlist. Please try to delete the artist again.")
    }
  } else {
    await Artist.findByIdAndDelete(req.body.artistid).exec();
    await Track.deleteMany({ 'album.artist.name': artist.name }).exec();
    res.redirect("/artists?watchlist=" + watchlist);
  }
});

const artist_add_get = (req, res, next) => {
  let watchlist = req.query.watchlist
  res.render("artist_form", { 
    title: "Add Artist",
    watchlist: watchlist
   });
};

const artist_add_post = [
  body("name", "Artist name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 }),

  asyncHandler(async (req, res, next) => {
    let watchlist = req.query.watchlist
    const errors = validationResult(req);

    let body = await get_spotify_id_for_artist(req.body.name);
    if (body.artists.items.length === 0) {
      res.send(`No results for ${req.body.name} in Spotify`);
    }
    let spotifyId = body.artists.items.find(itemArtist => req.body.name.toLowerCase() === itemArtist.name.toLowerCase()).id;
    const new_artist = new Artist({
      name: req.body.name,
      spotify_id: spotifyId,
      watchlist: watchlist
    });

    if (!errors.isEmpty()) {
      res.render("artist_form", {
        title: "Create Artist",
        artist: new_artist,
        errors: errors.array(),
        watchlist: watchlist
      });
      return;
    } else {
      const artistExists = await Artist.findOne({ name: req.body.name, watchlist: watchlist })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (artistExists) {
        res.redirect("/artists?watchlist=" + watchlist);
      } else {
        await new_artist.save();
        res.redirect("/artists?watchlist=" + watchlist);
      }
    }
  })
];

const artist_list = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  const numArtists = await Artist.countDocuments({ watchlist: watchlist }).exec();

  const allArtists = await Artist.find({ watchlist: watchlist }, "name")
    .sort({ name: 1 })
    .exec();

  res.render("artists", { 
      title: "Artists",
      artist_count: numArtists,
      artist_list: allArtists,
      watchlist: watchlist 
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

const get_spotify_ids = async (watchlist) => {
  const allArtists = await Artist.find({ watchlist: watchlist }, "name spotify_id").sort({ name: 1 }).exec();

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
        watchlist: watchlist,
        _id: artist.id
      });
      await Artist.findByIdAndUpdate(artist.id, new_artist, {}).exec();
    }
  }
}

module.exports = { run_for_artist_get, run_for_artist_post, artist_delete_get, artist_delete_post, artist_add_get, artist_add_post, artist_list, get_spotify_id_for_artist, get_spotify_ids, artist_swap_playlist_get, artist_swap_playlist_post }