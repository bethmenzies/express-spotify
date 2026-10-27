const { updateTracksInDB } = require('../../src/services/trackService')
const Track = require('../../src/services/db/models/track')
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

const track1 = { uri: 'track1', name: 'Track 1', external_urls: { spotify: 'track1' }, album: { name: 'Album 1', artist: { name: 'Artist 1' }, relatedArtist: { name: '' } }, watchlist: false, to_include: true }
const track2 = { uri: 'track2', name: 'Track 2', external_urls: { spotify: 'track2' }, album: { name: 'Album 1', artist: { name: 'Artist 1' }, relatedArtist: { name: '' } }, watchlist: false, to_include: true }

describe('update tracks in DB', () => {
  describe('updateTracksInDB', () => {
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
    it('should return empty array when no tracks', async () => {
      const addedTracks = await updateTracksInDB([], false)
      expect(Array.isArray(addedTracks)).toBe(true);
      expect(addedTracks.length).toBe(0)
    })
    it('should add new track when no tracks in db', async () => {
      const addedTracks = await updateTracksInDB([track1], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(1)
    })
    it('should add new track when tracks in db', async () => {
      await Track.insertMany([
        track1
      ])
      const addedTracks = await updateTracksInDB([track2], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
    })
    it('should not add new tracks when the track exists in db', async () => {
      await Track.insertMany([
        track1
      ])
      const addedTracks = await updateTracksInDB([track1], false)
      expect(addedTracks.length).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(1)
    })
    it('should update playlist_position on existing track', async () => {
      await Track.insertMany([
        track1
      ])
      const addedTracks = await updateTracksInDB([track2, track1], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(1)
      expect(tracks[1].playlist_position).toBe(0)
    })
    it('should not update playlist_position when not to_include', async () => {
      await Track.insertMany([
        { uri: 'track1', name: 'Track 1', external_urls: { spotify: 'track1' }, album: { name: 'Album 1', artist: { name: 'Artist 1' }, relatedArtist: { name: '' } }, watchlist: false, to_include: false, playlist_position: -1 }
      ])
      const addedTracks = await updateTracksInDB([track2, track1], false)
      expect(addedTracks.length).toBe(1)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(-1)
    })
    it('should add as new track if not in watchlist', async () => {
      await Track.insertMany([
        { uri: 'track1', name: 'Track 1', external_urls: { spotify: 'track1' }, album: { name: 'Album 1', artist: { name: 'Artist 1' }, relatedArtist: { name: '' } }, watchlist: true, to_include: true, playlist_position: 100 }
      ])
      const addedTracks = await updateTracksInDB([track1], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)
      expect(addedTracks[0].watchlist).toBe(false)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(100)
    })
    it('should add as new track if not the same artist', async () => {
      await Track.insertMany([
        { uri: 'track1', name: 'Track 1', external_urls: { spotify: 'track1' }, album: { name: 'Album 1', artist: { name: 'Related Artist 1' }, relatedArtist: { name: '' } }, watchlist: false, to_include: true, playlist_position: 100 }
      ])
      const addedTracks = await updateTracksInDB([track1], false)
      expect(addedTracks.length).toBe(1)
      expect(addedTracks[0].playlist_position).toBe(0)

      const tracks = await Track.find({})
      expect(tracks.length).toBe(2)
      expect(tracks[0].playlist_position).toBe(100)
    })
  })
})