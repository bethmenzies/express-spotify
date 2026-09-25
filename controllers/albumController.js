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

const albums_for_artists = async (artistAndSpotifyIds) => {
  return new Promise(async (resolve) => {
    let albums = []
    var error = ""
    for (let i = 0; i < artistAndSpotifyIds.length; i++) {
      if (error.error) {
        break
      }
      let body = await get_albums_by_artist(artistAndSpotifyIds[i].spotify_id, 1, 0)
      if (body.error) {
        error = body
        break
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_albums_by_artist(artistAndSpotifyIds[i].spotify_id, 50, j*50)
        if (body.error) {
          error = body
          break
        }
        albums.push(...body.items)
      }
    }
    albums = albums
    .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
    .sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
  
    resolve({albums: albums, error: error})
  })
}

const recent_albums_by_artist = async (date, watchlist) => {
  const allArtistsWithSpotifyIds = await Artist.find({ watchlist: watchlist }, "name spotify_id watchlist related_artists")
  .sort({ name: 1 })
  .exec();

  return new Promise(async (resolve) => {
    var albums = []
    var error = ""
    for (let i = 0; i < allArtistsWithSpotifyIds.length; i++) {
      if (error.error) {
        break
      }
      var items = []
      let artist = allArtistsWithSpotifyIds[i]
      let body = await get_albums_by_artist(artist.spotify_id, 1, 0)
      if (body.error) {
        error = body
        break
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_albums_by_artist(artist.spotify_id, 50, j*50)
        if (body.error) {
          error = body
          break
        }
        items.push(...body.items)
      }

      let recentAlbums = items
      .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
      .filter(album => {
        return album.release_date >= date
      })

      for (let j = 0; j < recentAlbums.length; j++) {
        recentAlbums[j].artist = {
          name: artist.name,
          spotify_id: artist.spotify_id,
          watchlist: artist.watchlist
        }
        recentAlbums[j].relatedArtist = {
          name: '',
          spotify_id: ''
        }
      }

      for (let k = 0; k < allArtistsWithSpotifyIds[i].related_artists.length; k++) {
        if (error.error) {
          break
        }
        var relatedItems = []
        let relatedArtist = allArtistsWithSpotifyIds[i].related_artists[k]
        let relatedBody = await get_albums_by_artist(relatedArtist.spotify_id, 1, 0)
        if (relatedBody.error) {
          error = relatedBody
          break
        }
        let total = relatedBody.total
        let iterations = Math.floor(total/50)
        for (let j = 0; j <= iterations; j++) {
          let relatedBody = await get_albums_by_artist(relatedArtist.spotify_id, 50, j*50)
          if (relatedBody.error) {
            error = relatedBody
            break
          }
          relatedItems.push(...relatedBody.items)
        }

        let relatedRecentAlbums = relatedItems
        .filter(album => !album.artists.map(relatedArtist => relatedArtist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
        .filter(album => {
          return album.release_date >= date
        })

        for (let l = 0; l < relatedRecentAlbums.length; l++) {
          relatedRecentAlbums[l].artist = {
            name: artist.name,
            spotify_id: artist.spotify_id,
            watchlist: artist.watchlist
          }
          relatedRecentAlbums[l].relatedArtist = {
            name: relatedArtist.name,
            spotify_id: relatedArtist.spotify_id
          }
        }
        recentAlbums.push(...relatedRecentAlbums)
      }

      recentAlbums.sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
  
      albums.push(...recentAlbums)
    }
    resolve({albums: albums, error: error});
  });
}

module.exports = { recent_albums_by_artist, albums_for_artists }