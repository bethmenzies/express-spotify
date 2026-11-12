import { updateTracksInDB } from '../../src/services/trackService'
import Track from '../../src/services/db/models/track'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongoose from 'mongoose'

let mongoServer: MongoMemoryServer;

const track1Spotify = { 
  name: 'Track 1',
  id: 'track1',
  uri: 'track1',
  track_number: 1,
  to_include: true,
  watchlist: false,
  external_urls: { spotify: 'track1' },
  album: {
    name: 'Album 1',
    id: 'album1',
    release_date: '2022-01-01',
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    relatedArtist: {
      name: '',
      spotify_id: ''
    }
  }
}
const track1DB = {
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  playlist_position: 0,
  spotify_id: 'track1',
  to_include: true,
  uri: 'track1',
  watchlist: false
}
const track1DBNotInclude = {
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  playlist_position: -1,
  spotify_id: 'track1',
  to_include: false,
  uri: 'track1',
  watchlist: false
}
const track1DBNotWatchlist = {
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  playlist_position: 100,
  spotify_id: 'track1',
  to_include: true,
  uri: 'track1',
  watchlist: true
}
const track1DBNotArtist = {
  album: {
    artist: {
      name: 'Related Artist 1',
      spotify_id: 'relatedArtist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  playlist_position: 100,
  spotify_id: 'track1',
  to_include: true,
  uri: 'track1',
  watchlist: false
}

const track2Spotify = { 
  name: 'Track 2',
  id: 'track2',
  uri: 'track2',
  track_number: 2,
  to_include: true,
  watchlist: false,
  external_urls: { spotify: 'track2' },
  album: {
    name: 'Album 1',
    id: 'album1',
    release_date: '2022-01-01',
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    relatedArtist: {
      name: '',
      spotify_id: ''
    }
  }
}

describe('update tracks in DB', () => {
  describe('updateTracksInDB', () => {
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
    it('should return empty array when no tracks', async () => {
      const addedTracks = await updateTracksInDB([], false)
      expect(Array.isArray(addedTracks)).toBe(true);
      expect(addedTracks.length).toBe(0)
    })
    it('should add new track when no tracks in db', async () => {
      const addedTracks = await updateTracksInDB([track1Spotify], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(1)
    })
    it('should add new track when tracks in db', async () => {
      await Track.insertMany([track1DB])
      const addedTracks = await updateTracksInDB([track2Spotify], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
    })
    it('should not add new tracks when the track exists in db', async () => {
      await Track.insertMany([track1DB])
      const addedTracks = await updateTracksInDB([track1Spotify], false)
      expect(addedTracks.length).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(1)
    })
    it('should update playlist_position on existing track', async () => {
      await Track.insertMany([track1DB])
      const addedTracks = await updateTracksInDB([track2Spotify, track1Spotify], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(1)
      expect(tracks[1].playlist_position).toBe(0)
    })
    it('should not update playlist_position when not to_include', async () => {
      await Track.insertMany([track1DBNotInclude])
      const addedTracks = await updateTracksInDB([track2Spotify, track1Spotify], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(-1)
    })
    it('should add as new track if not in watchlist', async () => {
      await Track.insertMany([track1DBNotWatchlist])
      const addedTracks = await updateTracksInDB([track1Spotify], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)
      expect(addedTracks[0].watchlist).toBe(false)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(100)
    })
    it('should add as new track if not the same artist', async () => {
      await Track.insertMany([track1DBNotArtist])
      const addedTracks = await updateTracksInDB([track1Spotify], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(100)
    })
  })
})