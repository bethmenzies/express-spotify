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

const get_artists_albums = async (artists) => {
  var albums = []
  const result = await Promise.all(
    artists.map(async (artist) => {
      let body = await get_albums_by_artist(artist.spotify_id, 1, 0)
      if (body === null) {
        return [];
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_albums_by_artist(artist.spotify_id, 50, j*50)
        body.items.map(album => album.artist = {
          name: artist.name,
          spotify_id: artist.spotify_id
        })
        albums.push(...body.items)
      }
    })
  )
  return albums
}

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
}

const recent_albums_by_artist = async (date) => {
  const allArtistsWithSpotifyIds = await Artist.find({}, "name spotify_id")
  .sort({ name: 1 })
  .exec();

  let chunkedArray = chunkArray(allArtistsWithSpotifyIds, 1)
  var albums = []
  chunkedArray.forEach(async (chunk) => {
    let albumBatch = await get_artists_albums(chunk)
    albums.push(...albumBatch)
  })

  return new Promise(async (resolve) => {
    let recentAlbums = albums
      .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
      .filter(album => { return album.release_date > date })
      .sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
      .sort((a,b) => (a.artist.name > b.artist.name) ? 1 : ((b.artist.name > a.artist.name) ? -1 : 0))

    resolve(recentAlbums);
  });
}

module.exports = { recent_albums_by_artist, albums_for_artist }