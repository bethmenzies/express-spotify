import { addAllTracksToPlaylist } from "./playlistController.ts"
import asyncHandler from "express-async-handler"
import { getArtistsAlbums } from './albumController.ts'
import { artistTracksByAlbum } from './trackController.ts'
import { runForLatestTracks } from "../services/runService.ts"
import { create_playlist } from "../services/spotify/playlist.ts"
import { AlbumsTracksError, ArtistsAlbumsError, CreatePlaylistError, PlaylistTracksError } from "../errors.ts"

export const run = asyncHandler(async (req, res, next) => {
  const watchlist = req.query.watchlist
  let watchlistBool: boolean
  watchlist === "true" ? watchlistBool = true : watchlistBool = false
  let toRender = await runForLatestTracks(watchlistBool)
  res.render("run", toRender)
  return
});

export const runForArtist = async (artist: any) => {
  if (artist === null) {
    return {
      title: "Error!",
      artistName: "N/A",
      error: "No artist found",
      errorStatus: null,
      errorMessage: null,
    }
  }
  let artists = [{ name: artist.name, spotify_id: artist.spotify_id }]
  for (const relatedArtist of artist.related_artists) {
    artists.push({ name: relatedArtist.name, spotify_id: relatedArtist.spotify_id })
  }

  let artistsAlbums: any[] = []
  try {
    artistsAlbums = await getArtistsAlbums(artists)
  } catch (error) {
    console.error(error)
    if (error instanceof ArtistsAlbumsError) {
      return {
        title: "Error!",
        artistName: artist.name,
        message: error.message,
        error: error.error
      }
    }
  }

  if (artistsAlbums.length === 0) {
    return {
      title: "Error",
      artistName: artist.name,
      message: "No albums"
    }
  }

  let artistNames = [artist.name]
  for (const relatedArtist of artist.related_artists) {
    artistNames.push(relatedArtist.name)
  }

  let artistsTracks: any[] = []
  try {
    artistsTracks = await artistTracksByAlbum(artistsAlbums, artistNames);
  } catch (error) {
    console.error(error)
    if (error instanceof AlbumsTracksError) {
      return {
        title: "Error!",
        artistName: artist.name,
        message: error.message,
        error: error.error
      }
    }
  }

  if (artistsTracks.length === 0) {
    return {
      title: "Error!",
      artistName: artist.name,
      message: "No tracks"
    }
  }

  let playlistResponse
  try {
    playlistResponse = await create_playlist(artist.name)
  } catch (error) {
    if (error instanceof CreatePlaylistError) {
      return {
        title: "Error!",
        artistName: artist.name,
        message: error.message,
        error: error.error
      }
    }
  }
  if (playlistResponse === undefined) {
    return {
      title: "Error!",
      artistName: artist.name,
      message: "No playlist, cannot continue"
    }
  }

  let playlistId = playlistResponse.id
  try {
    await addAllTracksToPlaylist(playlistId, artistsTracks);
  } catch (error) {
    console.error(error)
    if (error instanceof PlaylistTracksError) {
      return {
        title: "Error!",
        artistName: artist.name,
        error: "Something went wrong when adding tracks to playlist. Try again.",
        errorStatus: error.error.body.error.status,
        errorMessage: error.error.body.error.message
      }
    }
  }

  return {
    title: "Created!",
    artistName: artist.name,
    error: null,
    errorStatus: null,
    errorMessage: null
  }
}