import { getRecentAlbums, getArtistAlbums, filterAlbumsByDate, filterAlbums, setAlbumsWithRelatedArtists, sortAlbumsByDate, deduplicateAlbums } from "../../../src/controllers/albumController"
import * as spotifyAlbum from "../../../src/services/spotify/album"
import * as dbArtist from "../../../src/services/db/artists"
import { ArtistsAlbumsError } from "../../../src/errors"

jest.mock('../../../src/services/spotify/album')

const mockGetAlbumsByArtist = spotifyAlbum.get_albums_by_artist as jest.Mock

jest.mock('../../../src/services/db/artists')

const mockFindArtistsByWatchlist = dbArtist.findArtistsByWatchlist as jest.Mock

jest.mock('../../../src/utils/dateUtils', () => {
  return {
    getOldDate: jest.fn().mockReturnValue('2024-01-01'),
    getTodaysDate: jest.fn().mockReturnValue('2026-01-01')
  }
})

const first = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album1' } ] }
const second = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album1' }, { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album2' } ] }
const third = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album3' } ] }
const fourth = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album3' }, { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album4' } ] }
const fifth = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 2" }], uri: 'album5' } ] }
const sixth = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 2" }], uri: 'album5' }, { release_date: '2026-01-01', artists: [{ name: "Related Artist 2" }], uri: 'album6' } ] }
const seventh = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album7' } ] }
const eighth = { total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album7' }, { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album8' } ] }

const firstWithIteration = { total: 75, items: [ { uri: 'album1', artists: [{ name: "Artist 1" }], release_date: '2026-01-01' } ] }
const secondWithIteration = { total: 75, items: [ { uri: 'album1', artists: [{ name: "Artist 1" }], release_date: '2026-01-01' }, { uri: 'album2', artists: [{ name: "Artist 1" }], release_date: '2026-01-01' } ] }
const thirdWithIteration = { total: 75, items: [ { uri: 'album3', artists: [{ name: "Artist 1" }] }, { uri: 'album4', artists: [{ name: "Artist 1" }] } ] }

const artist1 = { name: "Artist 1", spotify_id: "artist1", watchlist: false, related_artists: [{ name: "Related Artist 1", spotify_id: "related1" }, { name: "Related Artist 2", spotify_id: "related2" }] }
const artist2 = { name: "Artist 2", spotify_id: "artist2", watchlist: false }

describe('get albums', () => {
  beforeAll(() => {
    mockFindArtistsByWatchlist.mockResolvedValue([artist1, artist2])
  })
  beforeEach(() => {
    mockGetAlbumsByArtist.mockClear()
  })
  describe("getRecentAlbums", () => {
    it("should return an array of albums", async () => {
      mockGetAlbumsByArtist.mockResolvedValue({ success: true });
      const recentAlbums = await getRecentAlbums(false);
      expect(Array.isArray(recentAlbums)).toBe(true);
    });
    it("should return an array of albums with the correct properties", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce(eighth)
      const recentAlbums = await getRecentAlbums(false);
      expect(recentAlbums.length).toBe(8)
      const album = recentAlbums[0];
      verifyAlbum(album)
      verifySetAlbum(album)
    });
    it("should return an array of albums filtered on album release_date", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album1' }, { release_date: '2024-01-01', artists: [{ name: "Artist 1" }], uri: 'album2' } ] })
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce(eighth)
      const recentAlbums = await getRecentAlbums(false)
      expect(recentAlbums.length).toBe(7)
    })
    it("should return an array of albums sorted by release_date per artist", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-06', artists: [{ name: "Artist 1" }], uri: 'album1' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-06', artists: [{ name: "Artist 1" }], uri: 'album1' }, { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album2' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-05', artists: [{ name: "Related Artist 1" }], uri: 'album3' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-05', artists: [{ name: "Related Artist 1" }], uri: 'album3' }, { release_date: '2026-01-02', artists: [{ name: "Related Artist 1" }], uri: 'album4' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-03', artists: [{ name: "Related Artist 2" }], uri: 'album5' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-03', artists: [{ name: "Related Artist 2" }], uri: 'album5' }, { release_date: '2026-01-04', artists: [{ name: "Related Artist 2" }], uri: 'album6' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-08', artists: [{ name: "Artist 2" }], uri: 'album7' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-08', artists: [{ name: "Artist 2" }], uri: 'album7' }, { release_date: '2026-01-07', artists: [{ name: "Artist 2" }], uri: 'album8' } ] })

      const recentAlbums = await getRecentAlbums(false)
      expect(recentAlbums[0].uri).toBe('album2')
      expect(recentAlbums[1].uri).toBe('album4')
      expect(recentAlbums[2].uri).toBe('album5')
      expect(recentAlbums[3].uri).toBe('album6')
      expect(recentAlbums[4].uri).toBe('album3')
      expect(recentAlbums[5].uri).toBe('album1')
      expect(recentAlbums[6].uri).toBe('album8')
      expect(recentAlbums[7].uri).toBe('album7')
    })
    it("should return an array of albums deduped by album uri by artist", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album3' }, { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album1' } ] })
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album7' }, { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album1' } ] })
      const recentAlbums = await getRecentAlbums(false)
      expect(recentAlbums.length).toBe(7)
    })
    it("should return an error if first get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist.mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if second get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if third get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Related Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if fourth get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Related Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if fifth get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Related Artist 2');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if sixth get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Related Artist 2');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if seventh get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 2')
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it("should return an error if eighth get_albums_by_artist fails", async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 2');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it('should return album and error if error occurs in later iteration', async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(firstWithIteration)
        .mockResolvedValueOnce(secondWithIteration)
        .mockRejectedValueOnce(new Error)
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1')
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
  })
  describe('getArtistAlbums', () => {
    it('should return albums for a given artist', async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second);

      const artistsAlbums = await getArtistAlbums(artist1);

      expect(Array.isArray(artistsAlbums)).toBe(true);
      expect(artistsAlbums.length).toBe(2)
      const album = artistsAlbums[0]
      verifyAlbum(album)
    });
    it('should return albums for a given artist with iteration', async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(firstWithIteration)
        .mockResolvedValueOnce(secondWithIteration)
        .mockResolvedValueOnce(thirdWithIteration)

      const artistsAlbums = await getArtistAlbums(artist1);

      expect(Array.isArray(artistsAlbums)).toBe(true);
      expect(artistsAlbums.length).toBe(4)
      const album = artistsAlbums[0]
      verifyAlbum(album)
    });
    it('should handle error in first call gracefully', async () => {
      mockGetAlbumsByArtist.mockRejectedValueOnce(new Error);
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    });
    it('should handle error in second call gracefully', async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(first)
        .mockRejectedValueOnce(new Error)      
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
    it('should return albums and error if error occurs in later iteration', async () => {
      mockGetAlbumsByArtist
        .mockResolvedValueOnce(firstWithIteration)
        .mockResolvedValueOnce(secondWithIteration)
        .mockRejectedValueOnce(new Error)
      expect.assertions(4);
      try {
        await getRecentAlbums(false)
      } catch (error) {
          expect(error).toBeInstanceOf(ArtistsAlbumsError);
          const artistsAlbumsError = error as ArtistsAlbumsError
          expect(artistsAlbumsError).toHaveProperty('message', 'Albums by artist call errored at artist: Artist 1');
          expect(artistsAlbumsError).toHaveProperty('error')
          expect(artistsAlbumsError.error).toBeInstanceOf(Error)
      }
    })
  })
  describe('filterAlbumsByDate', () => {
    it('should filter albums by date', () => {
      const albums = [
        { uri: 'album1', artists: [], release_date: '2024-01-01' },
        { uri: 'album2', artists: [], release_date: '2026-01-01' }
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(1)
      expect(filteredAlbums[0].uri).toBe('album2')
    })
    it('should not filter when no old dates', () => {
      const albums = [
        { uri: 'album1', artists: [], release_date: '2026-01-01' },
        { uri: 'album2', artists: [], release_date: '2026-01-01' }
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(2)
      expect(filteredAlbums[0].uri).toBe('album1')
      expect(filteredAlbums[1].uri).toBe('album2')
    })
    it('should filter all when all old dates', () => {
      const albums = [
        { uri: 'album1', artists: [], release_date: '2024-01-01' },
        { uri: 'album2', artists: [], release_date: '2024-01-01' }
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(0)
    })
  })
  describe('filterAlbums', () => {
    it('should filter Various Artists', () => {
      const albums = [
        { uri: 'album', artists: [{ name: 'Various Artists' }], release_date: '2026-01-01'}
      ]
      const filteredAlbums = filterAlbums(albums)
      expect(filteredAlbums.length).toBe(0)
    })
    it('should filter when one artist is Various Artists', () => {
      const albums = [
        { uri: 'album', artists: [{ name: 'Artist1' }, { name: 'Artist2' }, { name: 'Various Artists' }], release_date: '2026-01-01' }
      ]
      const filteredAlbums = filterAlbums(albums)
      expect(filteredAlbums.length).toBe(0)
    })
  })
  describe('setAlbumsWithRelatedArtists', () => {
    it('should set fields on each album', () => {
      const albums = [
        { uri: 'album1' },
        { uri: 'album2' }
      ] 
      const setAlbums = setAlbumsWithRelatedArtists(albums, 'Artist 1', 'artist1', false, '', '')
      verifySetAlbum(setAlbums[0])
      verifySetAlbum(setAlbums[1])
    })
  })
  describe('sortAlbumsByDate', () => {
    it('sorts albums by release_date', () => {
      const albums = [
        { uri: 'Album1', release_date: '2026-01-01' },
        { uri: 'Album2', release_date: '2025-01-01' }
      ]
      const sortedAlbums = sortAlbumsByDate(albums)
      expect(sortedAlbums[0].uri).toBe('Album2')
      expect(sortedAlbums[1].uri).toBe('Album1')
    })
    it('sorts albums by release_date oldest to newest', () => {
      const albums = [
        { uri: 'Album1', release_date: '2025-01-01' },
        { uri: 'Album2', release_date: '2026-01-01' }
      ]
      const sortedAlbums = sortAlbumsByDate(albums)
      expect(sortedAlbums[0].uri).toBe('Album1')
      expect(sortedAlbums[1].uri).toBe('Album2')
    })
    it('keeps albums the same order with the same release_date', () => {
      const albums = [
        { uri: 'album1', release_date: '2026-01-01' },
        { uri: 'album2', release_date: '2026-01-01' }
      ]
      const sortedAlbums = sortAlbumsByDate(albums)
      expect(sortedAlbums[0].uri).toBe('album1')
      expect(sortedAlbums[1].uri).toBe('album2')
    })
  })
  describe('deduplicateAlbums', () => {
    it('dedupes albums by uri', () => {
      const albums = [
        { uri: 'album', release_date: '2026-01-01' },
        { uri: 'album', release_date: '2026-01-01' }
      ]
      const dedupedAlbums = deduplicateAlbums(albums)
      expect(dedupedAlbums.length).toBe(1)
      expect(dedupedAlbums[0].uri).toBe('album')
    })
  })
})

const verifyAlbum = (album: any) => {
  expect(album).toHaveProperty("uri");
  expect(album.uri).toBe("album1")
  expect(album).toHaveProperty("artists");
  expect(album.artists.length).toBe(1)
  expect(album.artists[0]).toHaveProperty("name")
  expect(album.artists[0].name).toBe("Artist 1")
}

const verifySetAlbum = (album: any) => {
  expect(album).toHaveProperty('artist')
  expect(album.artist).toHaveProperty('name')
  expect(album.artist.name).toBe('Artist 1')
  expect(album.artist).toHaveProperty('spotify_id')
  expect(album.artist.spotify_id).toBe('artist1')
  expect(album.artist).toHaveProperty('watchlist')
  expect(album.artist.watchlist).toBe(false)
  expect(album).toHaveProperty('relatedArtist')
  expect(album.relatedArtist).toHaveProperty('name')
  expect(album.relatedArtist.name).toBe('')
  expect(album.relatedArtist).toHaveProperty('spotify_id')
  expect(album.relatedArtist.spotify_id).toBe('')
}