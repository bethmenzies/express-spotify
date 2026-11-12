import { call_spotify } from './common.ts'
import { chunkArray } from '../../utils/arrayUtils.ts'
import { CreatePlaylistError, RequestParamError } from '../../errors.ts'
import { SPOTIFY_LIMIT, SPOTIFY_URI_LIMIT } from '../../utils/constants.ts'
import { now } from '../../utils/dateUtils.ts'

export const create_playlist = async (playlistName: string | undefined) => {
  let playlist
  if (playlistName !== undefined) {
    playlist = playlistName
  } else {
    playlist = "Latest Releases"
  }
  playlist = `${playlist} - ${now()}`

  const body = JSON.stringify({
    'name': playlist
  });

  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/me/playlists`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  try {
    return await call_spotify(options, body);
  } catch (error) {
    throw new CreatePlaylistError(playlist, error)
  }
}

export const get_playlists = async (limit: number, offset: number) => {
  if (limit < 1 || limit > SPOTIFY_LIMIT) {
    throw new RequestParamError("Get Current User's Playlists", 'limit', limit + '')
  }
  if (offset < 0) {
    throw new RequestParamError("Get Current User's Playlists", 'offset', offset + '')
  }
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/me/playlists?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  try {
    return await call_spotify(options, undefined);
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const call_add_tracks_to_playlist = async (playlistId: string, uris: string[], playlistPosition: number | undefined): Promise<any> => {
  if (playlistId === '') {
    throw new RequestParamError('Add Items to Playlist', 'playlistId', playlistId)
  }
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/playlists/${playlistId}/items`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }

  const body = JSON.stringify({
    "uris": uris,
    "position": playlistPosition
  })

  try {
    return await call_spotify(options, body);
  } catch (error) {
    console.error(error)
    throw error
  }
}

export const set_up_tracks_for_removal = (tracks: any[]) => {
  if (tracks.length === 0) {
    throw new RequestParamError('Remove Playlist Items', 'items', 'is empty')
  }
  
  const uriObjects = tracks
    .filter(track => track.uri !== undefined)
    .map(track => ({ uri: track.uri }))

  if (uriObjects.length === 0) {
    throw new RequestParamError('Remove Playlist Items', 'items', 'is empty')
  }

  const uris = chunkArray(uriObjects, SPOTIFY_URI_LIMIT)
  if (uris.length === 0) {
    throw new RequestParamError('Remove Playlist Items', 'items', 'is empty')
  }

  return uris
}

export const remove_items = async (playlistId: string, items: any[]): Promise<any> => {
  if (playlistId === '') {
    throw new RequestParamError('Remove Playlist Items', 'playlistId', playlistId)
  }
  if (items.length === 0) {
    throw new RequestParamError('Remove Playlist Items', 'items', 'is empty')
  }
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/playlists/${playlistId}/items`,
    method: 'DELETE',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
        "Transfer-Encoding": "chunked"
    },
    json: true
  }
  const body = JSON.stringify({
    "items": items
  })

  try {
    return await call_spotify(options, body);
  } catch (error) {
    console.error(error)
    throw error
  }
}