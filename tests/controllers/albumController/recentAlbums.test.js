const { recentAlbums, getArtistsAlbums, filterAlbumsByDate, setAlbumsWithRelatedArtists, sortAlbumsByDate, deduplicateAlbums } = require("../../../src/controllers/albumController");
const { get_albums_by_artist } = require("../../../src/services/albumService");

jest.mock('../../../src/services/albumService', () => {
  return {
    get_albums_by_artist: jest.fn()
  };
});

jest.mock('../../../src/db/artists', () => {
  return {
    findArtistsByWatchlist: jest.fn().mockResolvedValue([artist1, artist2])
  };
})

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

const firstWithIteration = { total: 75, items: [ { uri: 'album1', artists: [{ name: "Artist 1" }] } ] }
const secondWithIteration = { total: 75, items: [ { uri: 'album1', artists: [{ name: "Artist 1" }] }, { uri: 'album2', artists: [{ name: "Artist 1" }] } ] }
const thirdWithIteration = { total: 75, items: [ { uri: 'album3', artists: [{ name: "Artist 1" }] }, { uri: 'album4', artists: [{ name: "Artist 1" }] } ] }

const artist1 = { name: "Artist 1", spotify_id: "artist1", watchlist: false, related_artists: [{ name: "Related Artist 1", spotify_id: "related1" }, { name: "Related Artist 2", spotify_id: "related2" }] }
const artist2 = { name: "Artist 2", spotify_id: "artist2", watchlist: false }

describe('get albums', () => {
  beforeEach(() => {
    get_albums_by_artist.mockClear()
  });
  describe("recentAlbums", () => {
    it("should return an array of albums", async () => {
      get_albums_by_artist.mockResolvedValue({ success: true });
      const albumsResponse = await recentAlbums(false);
      expect(Array.isArray(albumsResponse.albums)).toBe(true);
    });
    it("should return an array of albums with the correct properties", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce(eighth)
      const albumsResponse = await recentAlbums(false);
      expect(albumsResponse.albums.length).toBe(8)
      const album = albumsResponse.albums[0];
      verifyAlbum(album)
      verifySetAlbum(album)
    });
    it("should return an array of albums filtered on album release_date", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album1' }, { release_date: '2024-01-01', artists: [{ name: "Artist 1" }], uri: 'album2' } ] })
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce(eighth)
      const albumsResponse = await recentAlbums(false)
      expect(albumsResponse.albums.length).toBe(7)
    })
    it("should return an array of albums sorted by release_date per artist", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-06', artists: [{ name: "Artist 1" }], uri: 'album1' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-06', artists: [{ name: "Artist 1" }], uri: 'album1' }, { release_date: '2026-01-01', artists: [{ name: "Artist 1" }], uri: 'album2' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-05', artists: [{ name: "Related Artist 1" }], uri: 'album3' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-05', artists: [{ name: "Related Artist 1" }], uri: 'album3' }, { release_date: '2026-01-02', artists: [{ name: "Related Artist 1" }], uri: 'album4' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-03', artists: [{ name: "Related Artist 2" }], uri: 'album5' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-03', artists: [{ name: "Related Artist 2" }], uri: 'album5' }, { release_date: '2026-01-04', artists: [{ name: "Related Artist 2" }], uri: 'album6' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-08', artists: [{ name: "Artist 2" }], uri: 'album7' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-08', artists: [{ name: "Artist 2" }], uri: 'album7' }, { release_date: '2026-01-07', artists: [{ name: "Artist 2" }], uri: 'album8' } ] })

      const albumsResponse = await recentAlbums(false)
      expect(albumsResponse.albums[0].uri).toBe('album2')
      expect(albumsResponse.albums[1].uri).toBe('album4')
      expect(albumsResponse.albums[2].uri).toBe('album5')
      expect(albumsResponse.albums[3].uri).toBe('album6')
      expect(albumsResponse.albums[4].uri).toBe('album3')
      expect(albumsResponse.albums[5].uri).toBe('album1')
      expect(albumsResponse.albums[6].uri).toBe('album8')
      expect(albumsResponse.albums[7].uri).toBe('album7')
    })
    it("should return an array of albums deduped by album uri by artist", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album3' }, { release_date: '2026-01-01', artists: [{ name: "Related Artist 1" }], uri: 'album1' } ] })
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce({ total: 2, items: [ { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album7' }, { release_date: '2026-01-01', artists: [{ name: "Artist 2" }], uri: 'album1' } ] })
      const albumsResponse = await recentAlbums(false)
      expect(albumsResponse.albums.length).toBe(7)
    })
    it("should return an error if first get_albums_by_artist fails", async () => {
      get_albums_by_artist.mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(0)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if second get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(0)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if third get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(2)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if fourth get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(2)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if fifth get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(4)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if sixth get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(4)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if seventh get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(6)
      expect(albums.error).toBeDefined();
    })
    it("should return an error if sixth get_albums_by_artist fails", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)
        .mockResolvedValueOnce(seventh)
        .mockResolvedValueOnce({ error: "Error fetching albums" });
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(6)
      expect(albums.error).toBeDefined();
    })
  })
  describe('getArtistsAlbums', () => {
    it('should return albums for a given artist', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second);

      const albumsResponse = await getArtistsAlbums(artist1);

      expect(albumsResponse).toHaveProperty('error')
      expect(albumsResponse.error).toBe("")
      expect(albumsResponse).toHaveProperty('albums');
      expect(Array.isArray(albumsResponse.albums)).toBe(true);
      expect(albumsResponse.albums.length).toBe(2)
      const album = albumsResponse.albums[0]
      verifyAlbum(album)
    });
    it('should return albums for a given artist with iteration', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(firstWithIteration)
        .mockResolvedValueOnce(secondWithIteration)
        .mockResolvedValueOnce(thirdWithIteration)

      const albumsResponse = await getArtistsAlbums(artist1);

      expect(albumsResponse).toHaveProperty('error')
      expect(albumsResponse.error).toBe("")
      expect(albumsResponse).toHaveProperty('albums');
      expect(Array.isArray(albumsResponse.albums)).toBe(true);
      expect(albumsResponse.albums.length).toBe(4)
      const album = albumsResponse.albums[0]
      verifyAlbum(album)
    });
    it('should handle error in first call gracefully', async () => {
      get_albums_by_artist.mockResolvedValueOnce({ error: 'API error' });

      const albumsResponse = await getArtistsAlbums(artist1);

      expect(albumsResponse).toHaveProperty('albums')
      expect(Array.isArray(albumsResponse.albums)).toBe(true)
      expect(albumsResponse.albums.length).toBe(0)
      expect(albumsResponse).toHaveProperty('error');
      expect(albumsResponse.error).toHaveProperty('error')
      expect(albumsResponse.error.error).toBe("API error")
    });
    it('should handle error in second call gracefully', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ error: 'API error' })

      const albumsResponse = await getArtistsAlbums(artist1)

      expect(albumsResponse).toHaveProperty('albums')
      expect(Array.isArray(albumsResponse.albums)).toBe(true)
      expect(albumsResponse.albums.length).toBe(0)
      expect(albumsResponse).toHaveProperty('error')
      expect(albumsResponse.error).toHaveProperty('error')
      expect(albumsResponse.error.error).toBe('API error')
    })
    it('should return albums and error if error occurs in later iteration', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(firstWithIteration)
        .mockResolvedValueOnce(secondWithIteration)
        .mockResolvedValueOnce({ error: 'API error' })

      const albumsResponse = await getArtistsAlbums(artist1)

      expect(albumsResponse).toHaveProperty('albums')
      expect(Array.isArray(albumsResponse.albums)).toBe(true)
      expect(albumsResponse.albums.length).toBe(2)
      expect(albumsResponse.albums[0].uri).toBe('album1')
      expect(albumsResponse.albums[1].uri).toBe('album2')
      expect(albumsResponse).toHaveProperty('error')
      expect(albumsResponse.error).toHaveProperty('error')
      expect(albumsResponse.error.error).toBe('API error')
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
    it('should filter Various Artists', () => {
      const albums = [
        { uri: 'album', artists: [{ name: 'Various Artists' }], release_date: '2026-01-01'}
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(0)
    })
    it('should filter when one artist is Various Artists', () => {
      const albums = [
        { uri: 'album', artists: [{ name: 'Artist1' }, { name: 'Artist2' }, { name: 'Various Artists' }], release_date: '2026-01-01' }
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(0)
    })
    it('should filter both date and various artists', () => {
      const albums = [
        { uri: 'album1', artists: [], release_date: '2024-01-01' },
        { uri: 'album2', artists: [{ name: 'various artists' }], release_date: '2026-01-01' },
        { uri: 'album3', artists: [], release_date: '2026-01-01' }
      ]
      const filteredAlbums = filterAlbumsByDate(albums)
      expect(filteredAlbums.length).toBe(1)
      expect(filteredAlbums[0].uri).toBe('album3')
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

const verifyAlbum = (album) => {
  expect(album).toHaveProperty("uri");
  expect(album.uri).toBe("album1")
  expect(album).toHaveProperty("artists");
  expect(album.artists.length).toBe(1)
  expect(album.artists[0]).toHaveProperty("name")
  expect(album.artists[0].name).toBe("Artist 1")
}

const verifySetAlbum = (album) => {
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