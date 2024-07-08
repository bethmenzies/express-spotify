const Artist = require("../models/artist");
const { call_spotify } = require("./spotifyController");

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

const albums_for_artist = async (artistId) => {
  return new Promise(async (resolve) => {
    let albums = [] 
    let body = await get_albums_by_artist(artistId, 1, 0)
    if (body === null) {
      return resolve([]);
    }
    let total = body.total
    let iterations = Math.floor(total/50)
    for (let j = 0; j <= iterations; j++) {
      let body = await get_albums_by_artist(artistId, 50, j*50)
      albums.push(...body.items)
    }

    albums = albums
    .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
    .sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))

    resolve(albums)
  })
}

const recent_albums_by_artist = async (date) => {
  const allArtistsWithSpotifyIds = await Artist.find({}, "name spotify_id")
  .sort({ name: 1 })
  .exec();

  return new Promise(async (resolve) => {
    var albums = []
    for (let i = 0; i < allArtistsWithSpotifyIds.length; i++) {
      var items = []
      let artist = allArtistsWithSpotifyIds[i]
      let body = await get_albums_by_artist(artist.spotify_id, 1, 0)
      if (body === null) {
        return resolve([]);
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_albums_by_artist(artist.spotify_id, 50, j*50)
        items.push(...body.items)
      }

      let recentAlbums = items
      .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
      .filter(album => {
        return album.release_date > date
      })
      .sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
  
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

module.exports = { recent_albums_by_artist, albums_for_artist }