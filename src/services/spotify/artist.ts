import { call_spotify } from './common.ts';

export const get_spotify_id_for_artist = async (artistName: string) => {
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

  return await call_spotify(options, undefined);
}