import { set_up_tracks_for_removal, remove_items } from "./spotify/playlist.ts";
import { getOldDate } from "../utils/dateUtils.ts";
import { findTracksLteDate, deleteTracksLteDate, findTrackByUri, updateTrackPlaylistPosition, saveNewTrack } from "./db/tracks.ts";
import { PlaylistTracksError, RequestParamError } from "../errors.ts";
import { chunkArray } from "../utils/arrayUtils.ts";
import { SPOTIFY_URI_LIMIT } from "../utils/constants.ts";

export const removeTracksFromDB = async (watchlist: boolean) => {
  const date = getOldDate()
  const tracks = await findTracksLteDate(date, watchlist, "uri to_include album.release_date name url album.artist.name album.name")
  await deleteTracksLteDate(date, watchlist)
  const includedTracks = tracks.filter(track => track.to_include)
  return includedTracks
}

export const removeTracksFromPlaylist = async (tracks: any[], playlistId: string): Promise<any> => {
  try {
    const uris = set_up_tracks_for_removal(tracks);
    for (let i = 0; i < uris.length; i++) {
      await remove_items(playlistId, uris[i]);
    }
  } catch (error) {
    console.error(error)
    throw new PlaylistTracksError("removing", error)
  }
}

export const updateTracksInDB = async (tracks: any[], watchlist: boolean) => {
  let playlistPosition = 0
  let addedTracks: any[] = []
  for (const track of tracks) {
    const existingTracks = await findTrackByUri(track.uri, track.album.artist.name, watchlist)

    if (existingTracks.length > 0) {
      const existingTrack = existingTracks[0]
      if (existingTrack.to_include) {
        await updateTrackPlaylistPosition(existingTrack._id, playlistPosition)
        playlistPosition++
      }
    } else {
      const newTrack = await saveNewTrack(track, watchlist)
      const newTrackWithPlaylistPosition = await updateTrackPlaylistPosition(newTrack._id, playlistPosition)
      playlistPosition++
      addedTracks.push(newTrackWithPlaylistPosition)
    }
  }
  return addedTracks
}