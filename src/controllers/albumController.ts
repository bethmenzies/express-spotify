import { get_albums_by_artist } from "../services/spotify/album.ts"
import { findArtistsByWatchlist } from "../services/db/artists.ts"
import { getOldDate } from "../utils/dateUtils.ts"
import { SPOTIFY_LIMIT, VARIOUS_ARTISTS } from "../utils/constants.ts"
import { ArtistsAlbumsError } from "../errors.ts"

export const getRecentAlbums = async (watchlist: boolean): Promise<any[]> => {
  var recentAlbums = []

  const artists = await findArtistsByWatchlist(watchlist);

  try {
    for (const artist of artists) {
      var albums = []
      const albumsResponse = await getArtistAlbums(artist)
      const filteredAlbumsByDate = filterAlbumsByDate(albumsResponse)
      const filteredAlbums = filterAlbums(filteredAlbumsByDate)
      const artistAlbums = setAlbumsWithRelatedArtists(filteredAlbums, artist.name, artist.spotify_id, artist.watchlist, '', '')
      albums.push(...artistAlbums)
      if (artist.related_artists && artist.related_artists.length > 0) {
        for (const relatedArtist of artist.related_artists) {
          const albumsResponse = await getArtistAlbums(relatedArtist)
          const filteredAlbumsByDate = filterAlbumsByDate(albumsResponse)
          const filteredAlbums = filterAlbums(filteredAlbumsByDate)
          const relatedArtistAlbums = setAlbumsWithRelatedArtists(filteredAlbums, artist.name, artist.spotify_id, artist.watchlist, relatedArtist.name, relatedArtist.spotify_id)
          albums.push(...relatedArtistAlbums)
        }
      }
      const sortedAlbums = sortAlbumsByDate(albums)
      const dedupedAlbums = deduplicateAlbums(sortedAlbums)
      recentAlbums.push(...dedupedAlbums)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
  return recentAlbums
}

export const getArtistsAlbums = async (artists: any[]) => {
  let albums = []
  try {
    for (const artist of artists) {
      const artistsAlbums = await getArtistAlbums(artist)
      const filteredAlbums = filterAlbums(artistsAlbums)
      albums.push(...filteredAlbums)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
  const sortedAlbums = sortAlbumsByDate(albums)
  const dedupedAlbums = deduplicateAlbums(sortedAlbums)
  return dedupedAlbums
}

export const getArtistAlbums = async (artist: any): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    var albums: any[] = []
    let body
    try {
      body = await get_albums_by_artist(artist.spotify_id, 1, 0)
    } catch (error) {
      console.error(error)
      return reject(new ArtistsAlbumsError(artist, error))
    }
    let total = body.total
    let iterations = Math.floor(total/SPOTIFY_LIMIT)
    for (let j = 0; j <= iterations; j++) {
      let body
      try {
        body = await get_albums_by_artist(artist.spotify_id, SPOTIFY_LIMIT, j*SPOTIFY_LIMIT)
      } catch (error) {
        console.error(error)
        return reject(new ArtistsAlbumsError(artist, error))
      }
      albums.push(...body.items)
    }
    resolve(albums)
  })
}

export const filterAlbumsByDate = (albums: any[]): any[] => {
  const date = getOldDate()
  return albums.filter((album) => { return album.release_date > date })
}

export const filterAlbums = (albums: any[]): any[] => {
  return albums.filter((album) => !album.artists.map((artist: any): string => artist.name.toLowerCase()).includes(VARIOUS_ARTISTS))
}

export const setAlbumsWithRelatedArtists = (albums: any[], artistName: string, artistSpotifyId: string, artistWatchlist: boolean, relatedArtistName: string, relatedArtistSpotifyId: string) => {
  return albums.map(album => { album.artist = { name: artistName, spotify_id: artistSpotifyId, watchlist: artistWatchlist }; album.relatedArtist = { name: relatedArtistName, spotify_id: relatedArtistSpotifyId }; return album; })
}

export const sortAlbumsByDate = (albums: any[]): any[] => {
  return albums.sort((a,b) => (a.release_date > b.release_date) ? 1 : ((b.release_date > a.release_date) ? -1 : 0))
}

export const deduplicateAlbums = (albums: any[]): any[] => {
  let map = new Map()
  albums.forEach(o => map.set(o.uri, o));
  return [...map.values()];
}