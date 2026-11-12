import { addAllTracksToPlaylist } from "./playlistController.ts"
import { findAllTracksToInclude } from '../services/db/tracks.ts'
import asyncHandler from "express-async-handler"
import { create_playlist } from '../services/spotify/playlist.ts'
import { CreatePlaylistError, PlaylistTracksError } from "../errors.ts";

export const create_playlist_from_db = asyncHandler(async (req, res, next) => {
  const watchlist = req.query.watchlist
  let watchlistBool: boolean
  watchlist === "true" ? watchlistBool = true : watchlistBool = false
  let playlist
  try {
    playlist = await create_playlist(undefined);
  } catch (error) {
    console.error(error)
    if (error instanceof CreatePlaylistError) {
      res.render("error", {
        title: "Error!",
        message: error.message,
        error: error.error
      });
    }
  }

  const tracks = await findAllTracksToInclude(watchlistBool, 'playlist_position uri to_include album.release_date album.artist.name')
  try {
    await addAllTracksToPlaylist(playlist.id, tracks);
  } catch (error) {
    console.error(error)
    if (error instanceof PlaylistTracksError) {
      res.render("error", {
        title: "Error!",
        error: "Something went wrong when adding tracks to the playlist. Try again - or wait some time and try later.",
        errorStatus: error.error.body.error.status,
        errorMessage: error.error.body.error.message,
      });
    }
  }
  process.env.PLAYLIST_ID = playlist.id
  res.send("Playlist created from tracks in DB!");
});