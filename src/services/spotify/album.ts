import { RequestParamError } from '../../errors.ts';
import { SPOTIFY_LIMIT } from '../../utils/constants.ts';
import { call_spotify } from './common.ts';

export const get_albums_by_artist = async (artistId: string, limit: number, offset: number): Promise<any> => {
  if (artistId === '') {
    throw new RequestParamError("Get Artist's Albums", "artistId", artistId)
  }
  if (limit < 1 || limit > SPOTIFY_LIMIT) {
    throw new RequestParamError("Get Artist's Albums", "limit", limit + '')
  }
  if (offset < 0) {
    throw new RequestParamError("Get Artist's Albums", "offset", offset + '')
  }
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/artists/${artistId}/albums?limit=${limit}&offset=${offset}`,
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