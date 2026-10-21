const Track = require('../../src/models/track');
const { findTracksLteDate, deleteTracksLteDate } = require('../../src/db/tracks');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('findTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('returns old tracks', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2022-12-31', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('track1')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
  })
  it('returns old tracks including same day', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(2)
    expect(tracks[0].uri).toBe('track1')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
    expect(tracks[1].uri).toBe('track2')
    expect(tracks[1].album.release_date).toBe('2023-01-01')
  })
  it('returns no old tracks', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('returns old tracks only for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('track1')
  })
  it('should return an empty array when there are no tracks', async () => {
    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: true }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
})
describe('deleteTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('deletes tracks by date', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2022-12-31', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('track2')
    expect(remainingTracks[1].uri).toBe('track3')
  })
  it('deletes tracks by date including same day', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('track3')
  })
  it('deletes no tracks by date', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('track1')
    expect(remainingTracks[1].uri).toBe('track2')
  })
  it('deletes tracks only for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('track2')
  })
  it('should not delete any tracks when there are no tracks', async () => {
    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: true }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should delete all tracks when all tracks are old', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
})