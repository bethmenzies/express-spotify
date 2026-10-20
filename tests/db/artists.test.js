const Artist = require('../../src/models/artist');
const { findArtistsByWatchlist } = require('../../src/db/artists');

describe('findArtistsByWatchlist', () => {
  beforeEach(async () => {
    await Artist.deleteMany({}).exec();
  })
  it('returns artists with the specified watchlist value', async () => {
    await Artist.insertMany([
      { name: 'Artist 1', spotify_id: 'artist1', watchlist: true },
      { name: 'Artist 2', spotify_id: 'artist2', watchlist: false },
      { name: 'Artist 3', spotify_id: 'artist3', watchlist: true }
    ]);

    const artists = await findArtistsByWatchlist(true);
    expect(artists.length).toBe(2);
    expect(artists[0].name).toBe('Artist 1');
    expect(artists[1].name).toBe('Artist 3');
  })
})