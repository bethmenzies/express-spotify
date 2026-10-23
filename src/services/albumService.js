const { call_spotify } = require("../controllers/spotifyController");

const get_albums_by_artist = async (artistId, limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/artists/${artistId}/albums?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

module.exports = { get_albums_by_artist }