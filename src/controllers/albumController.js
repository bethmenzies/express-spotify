const { get_albums_by_artist } = require("../services/spotify/album");
const { findArtistsByWatchlist } = require("../services/db/artists");
const { getOldDate } = require("../utils/dateUtils");
const { VARIOUS_ARTISTS } = require("../utils/constants")

const recentAlbums = async (watchlist) => {
  var recentAlbums = []
  var error = ""

  const artists = await findArtistsByWatchlist(watchlist);

  for (const artist of artists) {
    var albums = []
    if (error.error) {
      break
    }
    const albumsResponse = await getArtistsAlbums(artist)
    error = albumsResponse.error
    const filteredAlbumsByDate = filterAlbumsByDate(albumsResponse.albums)
    const filteredAlbums = filterAlbums(filteredAlbumsByDate)
    const artistAlbums = setAlbumsWithRelatedArtists(filteredAlbums, artist.name, artist.spotify_id, artist.watchlist, '', '')
    albums.push(...artistAlbums)

    if (artist.related_artists && artist.related_artists.length > 0) {
      for (const relatedArtist of artist.related_artists) {
        if (error.error) {
          break
        }
        const albumsResponse = await getArtistsAlbums(relatedArtist)
        if (albumsResponse.error.error) {
          error = albumsResponse.error
          break
        }
        const filteredAlbumsByDate = filterAlbumsByDate(albumsResponse.albums)
        const filteredAlbums = filterAlbums(filteredAlbumsByDate)
        const relatedArtistAlbums = setAlbumsWithRelatedArtists(filteredAlbums, artist.name, artist.spotify_id, artist.watchlist, relatedArtist.name, relatedArtist.spotify_id)
        albums.push(...relatedArtistAlbums)
      }
    }
    const sortedAlbums = sortAlbumsByDate(albums)
    const dedupedAlbums = deduplicateAlbums(sortedAlbums)
    recentAlbums.push(...dedupedAlbums)
  }
  return { albums: recentAlbums, error: error }
}

const artistsAlbums = async (artists) => {
  let albums = []
  var error = ""
  for (const artist of artists) {
    if (error.error) {
      break
    }
    const albumsResponse = await getArtistsAlbums(artist)
    error = albumsResponse.error
    const filteredAlbums = filterAlbums(albumsResponse.albums)
    albums.push(...filteredAlbums)
  }
  const sortedAlbums = sortAlbumsByDate(albums)
  const dedupedAlbums = deduplicateAlbums(sortedAlbums)
  return { albums: dedupedAlbums, error: error }
}

const getArtistsAlbums = async (artist) => {
  return new Promise(async (resolve) => {
    var albums = []
    let body = await get_albums_by_artist(artist.spotify_id, 1, 0)
    if (body.error) {
      resolve({ albums: albums, error: body })
    }
    let total = body.total
    let iterations = Math.floor(total/50)
    for (let j = 0; j <= iterations; j++) {
      let body = await get_albums_by_artist(artist.spotify_id, 50, j*50)
      if (body.error) {
        resolve({ albums: albums, error: body })
        break
      }
      albums.push(...body.items)
    }
    resolve({ albums: albums, error: "" })
  })
}

const filterAlbumsByDate = (albums) => {
  const date = getOldDate()
  return albums.filter((album) => { return album.release_date > date })
}

const filterAlbums = (albums) => {
  return albums.filter((album) => !album.artists.map(artist => artist.name.toLowerCase()).includes(VARIOUS_ARTISTS))
}

const setAlbumsWithRelatedArtists = (albums, artistName, artistSpotifyId, artistWatchlist, relatedArtistName, relatedArtistSpotifyId) => {
  return albums.map(album => { album.artist = { name: artistName, spotify_id: artistSpotifyId, watchlist: artistWatchlist }; album.relatedArtist = { name: relatedArtistName, spotify_id: relatedArtistSpotifyId }; return album; })
}

const sortAlbumsByDate = (albums) => {
  return albums.sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
}

const deduplicateAlbums = (albums) => {
  let map = new Map()
  albums.forEach(o => map.set(o.uri, o));
  return [...map.values()];
}

module.exports = { recentAlbums, artistsAlbums, getArtistsAlbums, filterAlbumsByDate, filterAlbums, setAlbumsWithRelatedArtists, sortAlbumsByDate, deduplicateAlbums }