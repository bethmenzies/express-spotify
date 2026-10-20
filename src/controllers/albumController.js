const { get_albums_by_artist } = require("../services/albumService");
const { findArtistsByWatchlist } = require("../db/artists");
const { getOldDate } = require("../utils/dateUtils");

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

const recentAlbums = async (watchlist) => {
  return new Promise(async (resolve) => {
    var albums = []
    var error = ""

    const artists = await findArtistsByWatchlist(watchlist);

    for (const artist of artists) {
      var items = []
      if (error.error) {
        break
      }
      const artistAlbums = await getArtistAlbums(artist)
      if (artistAlbums.error) {
        error = artistAlbums.error
        break
      }
      items.push(...artistAlbums.items)

      if (artist.hasOwnProperty('related_artists')) {
        for (const relatedArtist of artist.related_artists) {
          if (error.error) {
            break
          }
          const relatedArtistAlbums = await getRelatedArtistAlbums(artist, relatedArtist)
          if (relatedArtistAlbums.error) {
            error = relatedArtistAlbums.error
            break
          }
          items.push(...relatedArtistAlbums.items)
        }
      }

      items.sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
      
      let map = new Map()
      items.forEach(o => map.set(o.uri, o));
      let deduped = [...map.values()];
  
      albums.push(...deduped)
    }
    resolve({albums: albums, error: error});
  });
}

const getArtistAlbums = async (artist) => {
  return await getArtistsAlbums(artist, artist.name, artist.spotify_id, artist.watchlist, '', '')
}

const getRelatedArtistAlbums = async (artist, relatedArtist) => {
  return await getArtistsAlbums(relatedArtist, artist.name, artist.spotify_id, artist.watchlist, relatedArtist.name, relatedArtist.spotify_id)
}

const getArtistsAlbums = async (artistToSearch, artistName, artistSpotifyId, artistWatchlist, relatedArtistName, relatedArtistSpotifyId) => {
  return new Promise(async (resolve) => {
    const date = getOldDate()
    var items = []
    let body = await get_albums_by_artist(artistToSearch.spotify_id, 1, 0)
    if (body.error) {
      resolve({ items: items, error: body })
    }
    let total = body.total
    let iterations = Math.floor(total/50)
    for (let j = 0; j <= iterations; j++) {
      let body = await get_albums_by_artist(artistToSearch.spotify_id, 50, j*50)
      if (body.error) {
        resolve({ items: items, error: body })
        break
      }
      let filtered = body.items
        .filter(album => !album.artists.map(artist => artist.name.toLowerCase()).includes("Various Artists".toLowerCase()))
        .filter(album => { return album.release_date > date })
        .map(album => { album.artist = { name: artistName, spotify_id: artistSpotifyId, watchlist: artistWatchlist }; album.relatedArtist = { name: relatedArtistName, spotify_id: relatedArtistSpotifyId }; return album; })
      items.push(...filtered)
    }
    resolve({ items: items, error: "" })
  })
}

module.exports = { recentAlbums, albums_for_artists, getArtistAlbums, getRelatedArtistAlbums }