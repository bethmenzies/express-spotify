import Artist from '../../../src/services/db/models/artist';
import { findArtistsByWatchlist } from '../../../src/services/db/artists';
import * as mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

describe('findArtistsByWatchlist', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({});
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Artist.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
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
  it('returns artists in name order', async () => {
    await Artist.insertMany([
      { name: 'ZZZ', spotify_id: 'ZZZ', watchlist: false },
      { name: 'AAA', spotify_id: 'AAA', watchlist: false }
    ])
    const artists = await findArtistsByWatchlist(false)
    expect(artists[0].name).toBe('AAA')
    expect(artists[1].name).toBe('ZZZ')
  })
})