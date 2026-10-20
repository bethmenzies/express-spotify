const { recentAlbums, getArtistAlbums, getRelatedArtistAlbums } = require("../../../src/controllers/albumController");
const { get_albums_by_artist } = require("../../../src/services/albumService");
const { getTodaysDate, getOldDate } = require("../../../src/utils/dateUtils");

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

const oldDate = getOldDate()
const date = getTodaysDate()

const first = { total: 2, items: [ { name: 'Album 1', release_date: date, artists: [{ name: "Artist 1" }], uri: 'album1' } ] }
const second = { total: 2, items: [ { name: 'Album 1', release_date: date, artists: [{ name: "Artist 1" }], uri: 'album1' }, { name: 'Album 2', release_date: date, artists: [{ name: "Artist 1" }], uri: 'album2' } ] }
const third = { total: 2, items: [ { name: 'Album 3', release_date: date, artists: [{ name: "Artist 2" }], uri: 'album3' } ] }
const fourth = { total: 2, items: [ { name: 'Album 3', release_date: date, artists: [{ name: "Artist 2" }], uri: 'album3' }, { name: 'Album 4', release_date: date, artists: [{ name: "Artist 2" }], uri: 'album4' } ] }
const fifth = { total: 2, items: [ { name: 'Album 5', release_date: date, artists: [{ name: "Related Artist 1" }], uri: 'album5' } ] }
const sixth = { total: 2, items: [ { name: 'Album 5', release_date: date, artists: [{ name: "Related Artist 1" }], uri: 'album5' }, { name: 'Album 6', release_date: date, artists: [{ name: "Related Artist 1" }], uri: 'album6' } ] }

const relatedArtist1 = { name: "Related Artist 1", spotify_id: "related1" }
const artist1 = { name: "Artist 1", spotify_id: "artist1", watchlist: false }
const artist2 = { name: "Artist 2", spotify_id: "artist2", watchlist: false, related_artists: [{ name: "Related Artist 1", spotify_id: "related1" }] }

describe('get albums', () => {
  beforeEach(() => {
    get_albums_by_artist.mockClear();
  });
  describe('getArtistAlbums', () => {
    it('should return albums for a given artist', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second);

      const albums = await getArtistAlbums(artist1);
      console.log(albums)

      expect(albums).toHaveProperty('error')
      expect(albums.error).toBe("")
      expect(albums).toHaveProperty('items');
      expect(Array.isArray(albums.items)).toBe(true);
      expect(albums.items.length).toBe(2)
      const album = albums.items[0]
      verifyAlbum(album)
    });
    it('should return albums for a given artist with related artist', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth)

      const albums = await getRelatedArtistAlbums(artist2, relatedArtist1)
      console.log(albums)

      expect(albums).toHaveProperty('error')
      expect(albums.error).toBe('')
      expect(albums).toHaveProperty('items')
      expect(Array.isArray(albums.items)).toBe(true)
      expect(albums.items.length).toBe(2)
      const album = albums.items[0]
      verifyAlbumWithRelatedArtist(album)
    })
    it('should filter Various Artists', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ total: 2, items: [ { name: 'Album 1', release_date: date, artists: [{ name: "Artist 1" }], uri: 'album1' }, { name: 'Album 2', release_date: date, artists: [{ name: "Artist 1" }, { name: "Various Artists" }], uri: 'album2' } ] })

        const albums = await getArtistAlbums(artist1)

        expect(albums).toHaveProperty('items')
        expect(albums.items.length).toBe(1)
        expect(albums.items[0].name).toBe('Album 1')
    })
    it('should filter old albums', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce({ total: 2, items: [ { name: 'Album 1', release_date: date, artists: [{ name: "Artist 1" }], uri: 'album1' }, { name: 'Album 2', release_date: oldDate, artists: [{ name: "Artist 1" }], uri: 'album2' } ] })

      const albums = await getArtistAlbums(artist1)

      expect(albums).toHaveProperty('items')
      expect(albums.items.length).toBe(1)
      expect(albums.items[0].name).toBe('Album 1')
    })
    it('should handle errors gracefully', async () => {
      get_albums_by_artist.mockResolvedValueOnce({ error: 'API error' });

      const albums = await getArtistAlbums(artist1);

      expect(albums).toHaveProperty('items')
      expect(Array.isArray(albums.items)).toBe(true)
      expect(albums.items.length).toBe(0)
      expect(albums).toHaveProperty('error');
      expect(albums.error).toHaveProperty('error')
      expect(albums.error.error).toBe("API error")
    });
    it('should return empty array and no error if all albums filtered out', async () => {
      get_albums_by_artist
        .mockResolvedValueOnce({ total: 2, items: [ { name: 'Album 1', release_date: oldDate, artists: [{ name: "Artist 1" }], uri: 'album1' } ] })
        .mockResolvedValueOnce({ total: 2, items: [ { name: 'Album 1', release_date: oldDate, artists: [{ name: "Artist 1" }], uri: 'album1' }, { name: 'Album 2', release_date: oldDate, artists: [{ name: "Artist 1" }, { name: "Various Artists "}], uri: 'album2' } ] })

      const albums = await getArtistAlbums(artist1)

      expect(albums).toHaveProperty('items')
      expect(Array.isArray(albums.items)).toBe(true)
      expect(albums.items.length).toBe(0)
      expect(albums).toHaveProperty('error')
      expect(albums.error).toBe('')
    })
  })
  describe("recentAlbums", () => {
    it("should return an array of albums", async () => {
      get_albums_by_artist.mockResolvedValue({ success: true });
      const albums = await recentAlbums(false);
      expect(Array.isArray(albums.albums)).toBe(true);
    });
    it("should return an array of albums with the correct properties", async () => {
      get_albums_by_artist
        .mockResolvedValueOnce(first)
        .mockResolvedValueOnce(second)
        .mockResolvedValueOnce(third)
        .mockResolvedValueOnce(fourth)
        .mockResolvedValueOnce(fifth)
        .mockResolvedValueOnce(sixth);
      const albums = await recentAlbums(false);
      expect(albums.albums.length).toBe(6)
      const album = albums.albums[0];
      verifyAlbum(album)
      const relatedArtistAlbum = albums.albums[4]
      verifyAlbumWithRelatedArtist(relatedArtistAlbum)
    });
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
  })
})

const verifyAlbum = (album) => {
  expect(album).toHaveProperty("name");
  expect(album.name).toBe("Album 1")
  expect(album).toHaveProperty("release_date");
  expect(album.release_date).toBe(date)
  expect(album).toHaveProperty("artists");
  expect(album.artists.length).toBe(1)
  expect(album.artists[0]).toHaveProperty("name")
  expect(album.artists[0].name).toBe("Artist 1")
  expect(album).toHaveProperty("artist");
  expect(album.artist).toHaveProperty("name");
  expect(album.artist.name).toBe("Artist 1")
  expect(album.artist).toHaveProperty("spotify_id");
  expect(album.artist.spotify_id).toBe("artist1")
  expect(album.artist).toHaveProperty("watchlist");
  expect(album.artist.watchlist).toBe(false)
  expect(album).toHaveProperty("relatedArtist");
  expect(album.relatedArtist).toHaveProperty("name")
  expect(album.relatedArtist.name).toBe("")
  expect(album.relatedArtist).toHaveProperty("spotify_id")
  expect(album.relatedArtist.spotify_id).toBe("")
  expect(album).toHaveProperty("uri")
  expect(album.uri).toBe("album1")
}
const verifyAlbumWithRelatedArtist = (album) => {
  expect(album).toHaveProperty("name");
  expect(album.name).toBe("Album 5")
  expect(album).toHaveProperty("release_date");
  expect(album.release_date).toBe(date)
  expect(album).toHaveProperty("artists");
  expect(album.artists.length).toBe(1)
  expect(album.artists[0]).toHaveProperty("name")
  expect(album.artists[0].name).toBe("Related Artist 1")
  expect(album).toHaveProperty("artist");
  expect(album.artist).toHaveProperty("name");
  expect(album.artist.name).toBe("Artist 2")
  expect(album.artist).toHaveProperty("spotify_id");
  expect(album.artist.spotify_id).toBe("artist2")
  expect(album.artist).toHaveProperty("watchlist");
  expect(album.artist.watchlist).toBe(false)
  expect(album).toHaveProperty("relatedArtist");
  expect(album.relatedArtist).toHaveProperty("name")
  expect(album.relatedArtist.name).toBe("Related Artist 1")
  expect(album.relatedArtist).toHaveProperty("spotify_id")
  expect(album.relatedArtist.spotify_id).toBe("related1")
  expect(album).toHaveProperty("uri")
  expect(album.uri).toBe("album5")
}