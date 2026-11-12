import { RequestParamError } from '../../errors.ts'
import { SPOTIFY_LIMIT } from '../../utils/constants.ts'
import { call_spotify } from './common.ts'

export const get_tracks_by_album = async (albumId: string, limit: number, offset: number) => {
  if (albumId === '') {
    throw new RequestParamError("Get Album Tracks", "albumId", albumId)
  }
  if (limit < 1 || limit > SPOTIFY_LIMIT) {
    throw new RequestParamError("Get Album Tracks", "limit", limit + '')
  }
  if (offset < 0) {
    throw new RequestParamError("Get Album Tracks", "offset", offset + '')
  }
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
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