import { SPOTIFY_LIMIT, SPOTIFY_URI_LIMIT } from '../utils/constants.ts'
import { chunkArray } from '../utils/arrayUtils.ts'
import { call_add_tracks_to_playlist, get_playlists } from '../services/spotify/playlist.ts'
import { ArtistPlaylistTracksError, GetPlaylistsError, PlaylistTrackError, PlaylistTracksError } from '../errors.ts'

export const getAllPlaylists = async (): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    let playlists: any[] = []
    let body
    try {
      body = await get_playlists(1, 0)
    } catch (error) {
      console.error(error)
      return reject(new GetPlaylistsError(error))
    }
    let total = body.total
    let iterations = Math.floor(total/SPOTIFY_LIMIT)
    for (let i = 0; i <= iterations; i++) {
      let body
      try {
        body = await get_playlists(SPOTIFY_LIMIT, i*SPOTIFY_LIMIT)
      } catch (error) {
        console.error(error)
        return reject(new GetPlaylistsError(error))
      }
      playlists.push(...body.items)
    }
    resolve(playlists)
  })
}

export const findPlaylist = (playlistName: string, playlists: any[]) => {
  return playlists.find((playlist) => playlist.name.toLowerCase() === playlistName.toLowerCase())
}

export const addTracksOneByOneToPlaylist = async (playlistId: string, tracks: any[]) => {
  for (const track of tracks) {
    try {
      let result = await call_add_tracks_to_playlist(playlistId, [track.uri], track.playlist_position)
      if (result.error) {
        return result
      }
    } catch (error) {
      console.error(error)
      throw new PlaylistTrackError(track, error)
    }
  }
}

export const addAllTracksToPlaylist = async (playlistId: string, tracks: any[]) => {
  const trackUris = tracks.map(track => track.uri)
  const urisWithLimit = chunkArray(trackUris, SPOTIFY_URI_LIMIT)

  try {
    for (const uris of urisWithLimit) {
      let result = await call_add_tracks_to_playlist(playlistId, uris, undefined)
      if (result.error) {
        return result
      }
    }
  } catch (error) {
    console.error(error)
    throw new PlaylistTracksError("adding", error)
  }
}

export const addTracksToArtistPlaylists = async (tracks: any[]) => {
  let tracksGroupedByArtist = tracks.reduce((acc, current) => {
    acc[current.album.artist.name] = acc[current.album.artist.name] ?? [];
    acc[current.album.artist.name].push(current);
    return acc;
  }, {})

  let playlists
  try {
    playlists = await getAllPlaylists()
  } catch (error) {
    console.error(error)
    throw error
  }

  for (const artist in tracksGroupedByArtist) {
    let playlist = await findPlaylist(artist, playlists)
    if (playlist === undefined) {
      continue
    }
    try {
      await addAllTracksToPlaylist(playlist.id, tracksGroupedByArtist[artist])
    } catch (error) {
      console.error(error)
      if (error instanceof PlaylistTracksError) {
        throw new ArtistPlaylistTracksError(artist, error.error)
      } else {
        throw error
      }
    }
  }
}