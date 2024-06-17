const Artist = require("../models/artist");
const spotify_controller = require("./spotifyController");

const get_albums_by_artist = async (artistId) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/artists/${artistId}/albums`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options);
}

const recent_albums_by_artist = async (date) => {
  const allArtistsWithSpotifyIds = await Artist.find({}, "name spotify_id")
  .sort({ name: 1 })
  .exec();

  return new Promise(async (resolve) => {
    var albums = []
    for (let i = 0; i < allArtistsWithSpotifyIds.length; i++) {
      let artist = allArtistsWithSpotifyIds[i]
      let body = await get_albums_by_artist(artist.spotify_id)
      if (body === null) {
        return resolve([]);
      }
      let recentAlbums = body.items.filter(album => {
        return album.release_date > date
      }).sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
  
      for (let j = 0; j < recentAlbums.length; j++) {
        recentAlbums[j].artist = {
          name: artist.name,
          spotify_id: artist.spotify_id
        }
      }
      albums = albums.concat(recentAlbums)
    }
    resolve(albums);
  });
}

module.exports = recent_albums_by_artist