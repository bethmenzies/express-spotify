import { addTracksOneByOneToPlaylist, addTracksToArtistPlaylists } from '../controllers/playlistController.ts'
import { getRecentAlbums } from '../controllers/albumController.ts'
import { getRecentTracks } from '../controllers/trackController.ts'
import { removeTracksFromDB, removeTracksFromPlaylist, updateTracksInDB } from './trackService.ts'
import { create_playlist } from "./spotify/playlist.ts"
import { AlbumsTracksError, ArtistPlaylistTracksError, ArtistsAlbumsError, CreatePlaylistError, GetPlaylistsError, PlaylistTrackError, PlaylistTracksError } from '../errors.ts'

export const runForLatestTracks = async (watchlist: boolean) => {  
  let playlistId, playlistState

  if (watchlist === true) {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID 
    playlistState = "updated"
  }
  if (watchlist === false) {
    playlistId = process.env.PLAYLIST_ID
    playlistState = "updated"
  }
  if (playlistId === undefined || playlistId === null) {
    let playlistResponse
    try {
      playlistResponse = await create_playlist(undefined);
    } catch (error) {
      if (error instanceof CreatePlaylistError) {
        return {
          title: "Error!",
          state: "created",
          message: error.message,
          error: error.error,
          removedTracks: [],
          tracks: [],
          watchlist: watchlist
        }
      }
    }
    if (playlistResponse === undefined) {
      return {
        title: "Error!",
        state: "created",
        message: "No playlist, cannot continue",
        removedTracks: [],
        tracks: [],
        watchlist: watchlist
      }
    }
    playlistId = playlistResponse.id
    playlistState = "created"
  }

  let removedTracks = await removeTracksFromDB(watchlist)

  if (removedTracks.length > 0) {
    try {
      await removeTracksFromPlaylist(removedTracks, playlistId)
    } catch (error) { 
      if (error instanceof PlaylistTracksError) {
        return {
          title: "Error!",
          state: playlistState,
          message: error.message,
          error: error.error,
          resolution: "You may want to remove tracks from the playlist manually",
          removedTracks: removedTracks,
          tracks: [],
          watchlist: watchlist
        }
      }
    }
  }

  let recentAlbums: any[] = []
  try {
    recentAlbums = await getRecentAlbums(watchlist);
  } catch (error) {
    console.error(error)
    if (error instanceof ArtistsAlbumsError) {
      return {
        title: "Error!",
        state: playlistState,
        message: error.message,
        error: error.error,
        resolution: null,
        removedTracks: removedTracks,
        tracks: [],
        watchlist: watchlist
      }
    }
  }

  if (recentAlbums.length === 0) {
    return {
      title: "Error!",
      state: playlistState,
      message: "No recent albums",
      error: null,
      resolution: null,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    }
  }

  let recentTracks: any[] = []
  try {
    recentTracks = await getRecentTracks(recentAlbums)
  } catch (error) {
    console.error(error)
    if (error instanceof AlbumsTracksError) {
      return {
        title: "Error!",
        state: playlistState,
        message: error.message,
        error: error.error,
        resolution: null,
        removedTracks: removedTracks,
        tracks: [],
        watchlist: watchlist
      }
    }
  }

  if (recentTracks.length === 0) {
    return {
      title: "Error!",
      state: playlistState,
      message: "No recent tracks",
      error: null,
      resolution: null,
      removedTracks: removedTracks,
      tracks: [],
      watchlist: watchlist
    }
  }

  let addedTracks = await updateTracksInDB(recentTracks, watchlist)
  if (addedTracks.length === 0) {
    return {
      title: "Completed!",
      state: "nothing",
      message: null,
      error: null,
      resolution: null,
      removedTracks: removedTracks,
      tracks: addedTracks,
      watchlist: watchlist
    }
  }
  
  try {
    await addTracksOneByOneToPlaylist(playlistId, addedTracks)
  } catch (error) {
    console.error(error)
    if (error instanceof PlaylistTrackError) {
      return {
        title: "Error!",
        state: playlistState,
        message: error.message,
        error: error.error,
        resolution: "Everything will be in the DB, try using the create from DB option.",
        removedTracks: removedTracks,
        tracks: addedTracks,
        watchlist: watchlist
      }
    }
  }

  try {
    await addTracksToArtistPlaylists(addedTracks)
  } catch (error) {
    console.error(error)
    if (error instanceof ArtistPlaylistTracksError) {
      return {
        title: "Error!",
        state: playlistState,
        message: error.message,
        error: error.error,
        resolution: "You might want to add new tracks to artist playlists manually.",
        removedTracks: removedTracks,
        tracks: addedTracks,
        watchlist: watchlist
      }
    } else if (error instanceof GetPlaylistsError) {
      return {
        title: "Error!",
        state: playlistState,
        message: error.message,
        error: error.error,
        resolution: "You might want to add new tracks to artist playlists manually.",
        removedTracks: removedTracks,
        tracks: addedTracks,
        watchlist: watchlist
      }
    }
  }

  return {
    title: "Completed!",
    state: playlistState,
    message: null,
    error: null,
    removedTracks: removedTracks,
    tracks: addedTracks,
    watchlist: watchlist
  }
}