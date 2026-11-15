import { removeTracksFromDB, removeTracksFromPlaylist } from '../../src/services/trackService'
import { getOldDate, getTodaysDate } from '../../src/utils/dateUtils'
import * as spotifyPlaylist from '../../src/services/spotify/playlist'
import Track from '../../src/services/db/models/track'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongoose from 'mongoose'
import { PlaylistTracksError, RequestParamError } from '../../src/errors'

let mongoServer: MongoMemoryServer;

jest.mock('../../src/services/spotify/playlist', () => {
  const actualSpotifyPlaylist = jest.requireActual('../../src/services/spotify/playlist')
  return {
    ...actualSpotifyPlaylist,
    remove_items: jest.fn()
  }
})

const mockRemoveItems = spotifyPlaylist.remove_items as jest.Mock

describe('remove old tracks', () => {
  const exampleTrackArray = [{ name: 'Track 1', uri: 'track1' }, { name: 'Track 2', uri: 'track2' }];
  describe('removeTracksFromDB', () => {
    beforeAll(async () => {
      mongoServer = await MongoMemoryServer.create();
      const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
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

    const testTrack1 = { 
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: false
        },
        name: 'Album',
        release_date: oldDate,
        spotify_id: 'album'
      }, 
      name: 'Track 1',
      spotify_id: 'track1',
      to_include: true, 
      uri: 'track1', 
      watchlist: false 
    }
    const testTrack2 = { 
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: false
        },
        name: 'Album',
        release_date: oldDate,
        spotify_id: 'album'
      }, 
      name: 'Track 2',
      spotify_id: 'track2',
      to_include: false, 
      uri: 'track2', 
      watchlist: false 
    }
    const testTrack3 = { 
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: true
        },
        name: 'Album',
        release_date: oldDate,
        spotify_id: 'album'
      }, 
      name: 'Track 3',
      spotify_id: 'track3',
      to_include: true, 
      uri: 'track3', 
      watchlist: true 
    }
    const testTrack4 = { 
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: true
        },
        name: 'Album',
        release_date: oldDate,
        spotify_id: 'album'
      }, 
      name: 'Track 4',
      spotify_id: 'track4',
      to_include: false, 
      uri: 'track4', 
      watchlist: true 
    }
    const testTrack5a = {  
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: false
        },
        name: 'Album',
        release_date: date,
        spotify_id: 'album'
      }, 
      name: 'Track 5a',
      spotify_id: 'track5a',
      to_include: true, 
      uri: 'track5a', 
      watchlist: false 
    }
    const testTrack5b = {  
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: false
        },
        name: 'Album',
        release_date: date,
        spotify_id: 'album'
      }, 
      name: 'Track 5b',
      spotify_id: 'track5b',
      to_include: false, 
      uri: 'track5b', 
      watchlist: false 
    }
    const testTrack5c = {  
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: true
        },
        name: 'Album',
        release_date: date,
        spotify_id: 'album'
      }, 
      name: 'Track 5c',
      spotify_id: 'track5c',
      to_include: true, 
      uri: 'track5c', 
      watchlist: true 
    }
    const testTrack5d = {  
      album: { 
        artist: {
          name: 'Artist',
          spotify_id: 'artist',
          watchlist: true
        },
        name: 'Album',
        release_date: date,
        spotify_id: 'album'
      }, 
      name: 'Track 5d',
      spotify_id: 'track5d',
      to_include: false, 
      uri: 'track5d', 
      watchlist: true 
    }

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
    beforeEach(() => {
      mockRemoveItems.mockClear()
    })
    it('should return error when there are no tracks', async () => {
      expect.assertions(5)
      try {
        await removeTracksFromPlaylist([], 'playlistId');
      } catch (error) {
        expect(error).toBeInstanceOf(PlaylistTracksError)
        const playlistTracksError = error as PlaylistTracksError
        expect(playlistTracksError.message).toBe('Playlist call errored removing tracks')
        expect(playlistTracksError).toHaveProperty('error')
        expect(playlistTracksError.error).toBeInstanceOf(RequestParamError)
        const requestParamError = playlistTracksError.error as RequestParamError
        expect(requestParamError.message).toBe("Remove Playlist Items call cannot be made due to 'items' with value: is empty")
      }
    })
    it('should return error when there are no tracks with uris', async () => {
      expect.assertions(5)
      try {
        await removeTracksFromPlaylist([{ name: 'Track 1' }, { name: 'Track 2' }], 'playlistId');
      } catch (error) {
        expect(error).toBeInstanceOf(PlaylistTracksError)
        const playlistTracksError = error as PlaylistTracksError
        expect(playlistTracksError.message).toBe('Playlist call errored removing tracks')
        expect(playlistTracksError).toHaveProperty('error')
        expect(playlistTracksError.error).toBeInstanceOf(RequestParamError)
        const requestParamError = playlistTracksError.error as RequestParamError
        expect(requestParamError.message).toBe("Remove Playlist Items call cannot be made due to 'items' with value: is empty")
      }
    })
    it('should return an error if remove_items fails', async () => {
      mockRemoveItems.mockRejectedValueOnce(new Error);
      expect.assertions(6)
      try {
        await removeTracksFromPlaylist(exampleTrackArray, 'playlistId');
      } catch (error) {
        expect(error).toBeInstanceOf(PlaylistTracksError)
        const playlistTracksError = error as PlaylistTracksError
        expect(playlistTracksError.message).toBe('Playlist call errored removing tracks')
        expect(playlistTracksError).toHaveProperty('error')
        expect(playlistTracksError.error).toBeInstanceOf(Error)
        expect(mockRemoveItems).toHaveBeenCalledWith('playlistId', [{ uri: 'track1' }, { uri: 'track2' }])
        expect(mockRemoveItems).toHaveBeenCalledTimes(1)
      }
    })
    it('should not return an error if remove_items succeeds', async () => {
      mockRemoveItems.mockResolvedValueOnce('snapshotId');
      await removeTracksFromPlaylist(exampleTrackArray, 'playlistId');
      expect(mockRemoveItems).toHaveBeenCalledWith('playlistId', [{ uri: 'track1' }, { uri: 'track2' }])
      expect(mockRemoveItems).toHaveBeenCalledTimes(1)
    })
  })
});