const { call_spotify } = require('./common')

const get_tracks_by_album = async (albumId, limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

module.exports = { get_tracks_by_album }