const { removeTracksFromDB, removeTracksFromPlaylist } = require('../../src/services/trackService');
const { getOldDate, getTodaysDate } = require('../../src/utils/dateUtils');
const Track = require('../../src/models/track');
const { remove_tracks } = require('../../src/controllers/playlistController');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

jest.mock('../../src/controllers/playlistController', () => {
  return {
    remove_tracks: jest.fn()
  };
});

describe('remove old tracks', () => {
  describe('removeTracksFromDB', () => {
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
    /**
     * assume watchlist is false for all tests unless specified otherwise
     * 
     * | case | release_date | to_include | watchlist | expected returned | expected deleted |
     * |------|--------------|------------|-----------|-------------------|------------------|
     * | 1    | old          | true       | false     | true              | true             |
     * | 2    | old          | false      | false     | false             | true             |
     * | 3    | old          | true       | true      | false             | false            |
     * | 4    | old          | false      | true      | false             | false            |
     * | 5    | not old      | any        | any       | false             | false            |
     */

    const oldDate = getOldDate();
    const date = getTodaysDate();
    const testTrack1 = { uri: 'track1', album: { release_date: oldDate }, to_include: true, watchlist: false }
    const testTrack2 = { uri: 'track2', album: { release_date: oldDate }, to_include: false, watchlist: false }
    const testTrack3 = { uri: 'track3', album: { release_date: oldDate }, to_include: true, watchlist: true }
    const testTrack4 = { uri: 'track4', album: { release_date: oldDate }, to_include: false, watchlist: true }
    const testTrack5a = { uri: 'track5a', album: { release_date: date }, to_include: true, watchlist: false }
    const testTrack5b = { uri: 'track5b', album: { release_date: date }, to_include: false, watchlist: false }
    const testTrack5c = { uri: 'track5c', album: { release_date: date }, to_include: true, watchlist: true }
    const testTrack5d = { uri: 'track5d', album: { release_date: date }, to_include: false, watchlist: true }

    it('should return no tracks when no tracks removed', async () => {
      await Track.insertMany([testTrack5a, testTrack5b, testTrack5c, testTrack5d])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(0)
      const remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(4)
    })
    it('should return removed old tracks', async () => {
      await Track.insertMany([testTrack1, testTrack5a, testTrack5b])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(1)
      expect(removedTracks[0].uri).toBe('track1')
      const remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(2)
      expect(remainingTracks[0].uri).toBe('track5a')
      expect(remainingTracks[1].uri).toBe('track5b')
    })
    it('should return removed old tracks with to_include=true, but delete regardless of to_include', async () => {
      await Track.insertMany([testTrack1, testTrack2, testTrack5a])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(1)
      expect(removedTracks[0].uri).toBe('track1')
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(1)
      expect(remainingTracks[0].uri).toBe('track5a')
    })
    it('should return removed old tracks only in the watchlist specified', async () => {
      await Track.insertMany([testTrack1, testTrack3, testTrack5a])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(1)
      expect(removedTracks[0].uri).toBe('track1')
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(2)
      expect(remainingTracks[0].uri).toBe('track3')
      expect(remainingTracks[1].uri).toBe('track5a')
    })
    it('should return removed old tracks with to_include=true and in the watchlist specified, and delete regardless of to_include but in the watchlist specified', async () => {
      await Track.insertMany([testTrack1, testTrack2, testTrack3, testTrack4, testTrack5a])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(1)
      expect(removedTracks[0].uri).toBe('track1')
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(3)
      expect(remainingTracks[0].uri).toBe('track3')
      expect(remainingTracks[1].uri).toBe('track4')
      expect(remainingTracks[2].uri).toBe('track5a')
    })
    it('should return no tracks when there are no tracks', async () => {
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(0)
    })
    it('should return no tracks when to_include=false, but delete regardless of to_include', async () => {
      await Track.insertMany([testTrack2, testTrack5b])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(0)
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(1)
      expect(remainingTracks[0].uri).toBe('track5b')
    })
    it('should return no tracks when to_include=false and in the watchlist specified, and delete regardless of to_include but in the watchlist specified', async () => {
      await Track.insertMany([testTrack4, testTrack5d])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(0)
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(2)
      expect(remainingTracks[0].uri).toBe('track4')
      expect(remainingTracks[1].uri).toBe('track5d')
    })
    it('should return old tracks when to_include=true, and delete all tracks if all tracks are old', async () => {
      await Track.insertMany([testTrack1, testTrack2])
      let removedTracks = await removeTracksFromDB(false);
      expect(removedTracks.length).toBe(1)
      expect(removedTracks[0].uri).toBe('track1')
      let remainingTracks = await Track.find({}).exec();
      expect(remainingTracks.length).toBe(0)
    })
  })
  describe('removeTracksFromPlaylist', () => {
    const exampleTrackArray = [{ uri: 'track1' }, { uri: 'track2' }];
    beforeEach(() => {
      remove_tracks.mockClear()
    })
    it('should return an empty array when there are no tracks', async () => {
      let response = await removeTracksFromPlaylist([], 'playlistId');
      expect(response.allResponses).toBe(true)
      expect(response.error).toBe("")
      expect(remove_tracks).toHaveBeenCalledTimes(0)
    })
    it('should return an empty array when there is no playlistId', async () => {
      let response = await removeTracksFromPlaylist(exampleTrackArray, '');
      expect(response.allResponses).toBe(true)
      expect(response.error).toBe("")
      expect(remove_tracks).toHaveBeenCalledTimes(0)
    })
    it('should return an empty array when playlistId is undefined', async () => {
      let response = await removeTracksFromPlaylist(exampleTrackArray, undefined);
      expect(response.allResponses).toBe(true)
      expect(response.error).toBe("")
      expect(remove_tracks).toHaveBeenCalledTimes(0)
    })
    it('should return an empty array when playlistId is null', async () => {
      let response = await removeTracksFromPlaylist(exampleTrackArray, null);
      expect(response.allResponses).toBe(true)
      expect(response.error).toBe("")
      expect(remove_tracks).toHaveBeenCalledTimes(0)
    })
    it('should return an error if remove_tracks fails', async () => {
      remove_tracks.mockResolvedValueOnce({ allResponses: false, error: "Failed to remove tracks" });

      let response = await removeTracksFromPlaylist(exampleTrackArray, 'playlistId');
      expect(response.allResponses).toBe(false)
      expect(response.error).toBe("Failed to remove tracks")
      expect(remove_tracks).toHaveBeenCalledWith(exampleTrackArray, 'playlistId')
      expect(remove_tracks).toHaveBeenCalledTimes(1)
    })
    it('should not return an error if remove_tracks succeeds', async () => {
      remove_tracks.mockResolvedValueOnce({ allResponses: true, error: "" });

      let response = await removeTracksFromPlaylist(exampleTrackArray, 'playlistId');
      expect(response.allResponses).toBe(true)
      expect(response.error).toBe("")
      expect(remove_tracks).toHaveBeenCalledWith(exampleTrackArray, 'playlistId')
      expect(remove_tracks).toHaveBeenCalledTimes(1)
    })
  })
});