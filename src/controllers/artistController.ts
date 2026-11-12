import Artist from "../services/db/models/artist.ts"
import Track from "../services/db/models/track.ts"
import asyncHandler from "express-async-handler"
import { body, validationResult } from "express-validator"
import { addAllTracksToPlaylist } from"./playlistController.ts"
import { runForArtist } from "./runController.ts"
import { get_spotify_id_for_artist } from '../services/spotify/artist.ts'
import { removeTracksFromPlaylist } from "../services/trackService.ts"
import { doesArtistExist } from "../services/db/artists.ts"
import { PlaylistTracksError } from "../errors.ts"

export const run_for_artist = asyncHandler(async (req, res, next) => {
  const artist = await Artist.findById(req.params.id).exec();
  const toRender = await runForArtist(artist)
  res.render("artist_run", toRender)
  return
})

export const artist_delete_get = asyncHandler(async (req, res, next) => {
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

export const artist_swap_playlist_get = asyncHandler(async (req, res, next) => {
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

export const artist_swap_playlist_post = asyncHandler(async (req, res, next) => {
  let current_watchlist = req.query.watchlist === 'true'
  let swapped_watchlist = !current_watchlist
  let artist = await Artist.findById(req.body.artistid).exec();
  let allTracksToInclude = await Track.find({ 'album.artist.name': artist!.name, to_include: true }).exec();
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
    try {
      await removeTracksFromPlaylist(allTracksToInclude, current_playlistId);
    } catch (error) {
      if (error instanceof PlaylistTracksError) {
        res.render("error", {
          title: "Error!",
          message: error.message,
          error: error.error,
          resolution: `Please try to swap ${artist!.name} again.`
        });
      }
    }

    // TODO: add to right place in playlist
    try {
      await addAllTracksToPlaylist(swapped_playlistId, allTracksToInclude)
    } catch (error) {
      console.error(error)
      if (error instanceof PlaylistTracksError) {
        res.render("error", {
          title: "Error!",
          message: error.message,
          error: error.error,
          resolution: `Please try to swap ${artist!.name} again.`

        })
      }
    }

    await Artist.findByIdAndUpdate(req.body.artistid, {watchlist: swapped_watchlist}).exec();
    await Track.updateMany({ 'album.artist.name': artist!.name },{ $set:{ watchlist: swapped_watchlist } }).exec();
    res.redirect("/artists?watchlist=" + current_watchlist);
  }
})

export const artist_delete_post = asyncHandler(async (req, res, next) => {
  // TODO: delete only for the deleting artist
  let watchlist = req.query.watchlist
  let artist = await Artist.findById(req.body.artistid).exec();
  let tracks = await Track.find({ 'album.artist.name': artist!.name }).exec();
  let playlistId
  if (watchlist === 'true') {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID
  } else {
    playlistId = process.env.PLAYLIST_ID
  }

  if (playlistId) {
    try {
      await removeTracksFromPlaylist(tracks, playlistId)
      await Artist.findByIdAndDelete(req.body.artistid).exec();
      await Track.deleteMany({ 'album.artist.name': artist!.name }).exec();
      res.redirect("/artists?watchlist=" + watchlist);
    } catch (error) {
      if (error instanceof PlaylistTracksError) {
        res.render("error", {
          title: "Error!",
          message: error.message,
          error: error.error,
          resolution: `Please try to delete ${artist!.name} again.`
        });
      }
      return
    }
  } else {
    await Artist.findByIdAndDelete(req.body.artistid).exec();
    await Track.deleteMany({ 'album.artist.name': artist!.name }).exec();
    res.redirect("/artists?watchlist=" + watchlist);
  }
});

export const artist_edit_get = (_req: any, res: any, _next: any) => {
  res.render("related_artist_form", {
    title: "Add Related Artists",
  })
}

export const artist_edit_post = [
  body("names", "Artist name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 }),

  asyncHandler(async(req, res, next) => {
    let watchlist = req.query.watchlist
    const errors = validationResult(req)
 
    let relatedArtistsObjectArray = []
    let relatedArtists = req.body.names;
    let relatedArtistsArray = relatedArtists.split(', ');
    for (let i = 0; i < relatedArtistsArray.length; i++) {
      let relatedArtistName = relatedArtistsArray[i]
      let relatedArtistSpotifyIdBody = await get_spotify_id_for_artist(relatedArtistName)
      if (relatedArtistSpotifyIdBody.artists.items.length === 0) {
        res.render("error", {
          title: "Error!",
          error: `No results for ${relatedArtistName} in Spotify`,
          errorStatus: relatedArtistSpotifyIdBody.error.error.status,
          errorMessage: relatedArtistSpotifyIdBody.error.error.message,
        });
      }
      let relatedArtistSpotifyId = relatedArtistSpotifyIdBody.artists.items.find((itemArtist: any) => relatedArtistName.toLowerCase() === itemArtist.name.toLowerCase()).id;
      
      relatedArtistsObjectArray.push({name: relatedArtistName, spotify_id: relatedArtistSpotifyId})
    }

    await Artist.findByIdAndUpdate(req.params.id, { related_artists: relatedArtistsObjectArray }).exec();
    res.redirect("/artists?watchlist=" + watchlist);
  })
]

export const artist_add_get = (req: any, res: any, next: any) => {
  let watchlist = req.query.watchlist
  res.render("artist_form", { 
    title: "Add Artist",
    watchlist: watchlist
   });
};

export const artist_add_post = [
  body("name", "Artist name must contain at least 3 characters")
    .trim()
    .isLength({ min: 3 }),

  asyncHandler(async (req, res, next) => {
    let watchlist = req.query.watchlist
    let watchlistBool: boolean
    watchlist === "true" ? watchlistBool = true : watchlistBool = false

    const errors = validationResult(req);

    let artistSpotifyIdBody = await get_spotify_id_for_artist(req.body.name);
    if (artistSpotifyIdBody.error || artistSpotifyIdBody.artists.items.length === 0) {
      res.render("error", {
        title: "Error!",
        error: `No results for ${req.body.name} in Spotify`,
        errorStatus: artistSpotifyIdBody.error.status,
        errorMessage: artistSpotifyIdBody.error.message,
      });
    }
    let artistSpotifyId = artistSpotifyIdBody.artists.items.find((itemArtist: any) => req.body.name.toLowerCase() === itemArtist.name.toLowerCase()).id;
    
    let relatedArtistsObjectArray = []
    let relatedArtists = req.body.related;
    if (relatedArtists != '') {
      let relatedArtistsArray = relatedArtists.split(', ');
      for (let i = 0; i < relatedArtistsArray.length; i++) {
        let relatedArtistName = relatedArtistsArray[i]
        let relatedArtistSpotifyIdBody = await get_spotify_id_for_artist(relatedArtistName)
        if (relatedArtistSpotifyIdBody.artists.items.length === 0) {
          res.render("error", {
            title: "Error!",
            error: `No results for ${relatedArtistName} in Spotify`,
            errorStatus: relatedArtistSpotifyIdBody.error.status,
            errorMessage: artistSpotifyIdBody.error.message,
          });
        }
        let relatedArtistSpotifyId = relatedArtistSpotifyIdBody.artists.items.find((itemArtist: any) => relatedArtistName.toLowerCase() === itemArtist.name.toLowerCase()).id;
        
        relatedArtistsObjectArray.push({name: relatedArtistName, spotify_id: relatedArtistSpotifyId})
      }
    }
    
    const new_artist = new Artist({
      name: req.body.name,
      spotify_id: artistSpotifyId,
      related_artists: relatedArtistsObjectArray,
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
      const artistExists = await doesArtistExist(req.body.name, watchlistBool)
      if (artistExists) {
        res.redirect("/artists?watchlist=" + watchlist);
      } else {
        await new_artist.save();
        res.redirect("/artists?watchlist=" + watchlist);
      }
    }
  })
];

export const artist_list = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let watchlistBool: boolean
  watchlist === "true" ? watchlistBool = true : watchlistBool = false
  const numArtists = await Artist.countDocuments({ watchlist: watchlistBool }).exec();

  const allArtists = await Artist.find({ watchlist: watchlistBool })
    .sort({ name: 1 })
    .exec();

  res.render("artists", { 
      title: "Artists",
      artist_count: numArtists,
      artist_list: allArtists,
      watchlist: watchlist 
  });
});

export const get_spotify_ids = async (watchlist: boolean) => {
  const allArtists = await Artist.find({ watchlist: watchlist }, "name spotify_id").sort({ name: 1 }).exec();

  for (let i = 0; i < allArtists.length; i++) {
    let artist = allArtists[i]
    if (artist.spotify_id === null || artist.spotify_id == "" || artist.spotify_id === undefined) {
      let body = await get_spotify_id_for_artist(artist.name);
      if (body.artists.items.length === 0) {
        console.log(`No results for ${artist.name}`);
        continue;
      }
      let spotifyId = body.artists.items.find((itemArtist: any) => artist.name.toLowerCase() === itemArtist.name.toLowerCase()).id;
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