const { recentTracks, getAlbumTracks, isTrackArtist, filterTracks, setAlbumOnTracks } = require('../../../src/controllers/trackController');
const { get_tracks_by_album } = require('../../../src/services/trackService');
const Track = require('../../../src/models/track')
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

jest.mock('../../../src/services/trackService', () => {
  return {
    get_tracks_by_album: jest.fn()
  };
});

const album = { uri: 'album1', artist: { name: 'Artist 1', spotify_id: 'artist1', watchlist: false }, relatedArtist: { name: '', spotify_id: '' } }

describe('get tracks', () => {
  beforeEach(() => {
    get_tracks_by_album.mockClear()
  });
  describe('recentTracks', () => {
    it('should return error', async () => {
      get_tracks_by_album.mockResolvedValueOnce({ error: 'API error' })
      const tracksResponse = await recentTracks([album], false)

      expect(tracksResponse).toHaveProperty('tracks')
      expect(Array.isArray(tracksResponse.tracks)).toBe(true)
      expect(tracksResponse.tracks.length).toBe(0)
      expect(tracksResponse).toHaveProperty('error');
      expect(tracksResponse.error).toHaveProperty('error')
      expect(tracksResponse.error.error).toBe("API error")
    })
    // TODO: add more tests for this method
  })
  describe('getAlbumTracks', () => {
    it('should handle error gracefully', async () => {
      get_tracks_by_album.mockResolvedValueOnce({ error: 'API error' })
      const tracksResponse = await getAlbumTracks(album)

      expect(tracksResponse).toHaveProperty('tracks')
      expect(Array.isArray(tracksResponse.tracks)).toBe(true)
      expect(tracksResponse.tracks.length).toBe(0)
      expect(tracksResponse).toHaveProperty('error');
      expect(tracksResponse.error).toHaveProperty('error')
      expect(tracksResponse.error.error).toBe("API error")
    })
    it('should handle error on second call gracefully', async () => {
      get_tracks_by_album
        .mockResolvedValueOnce({ total: 1 })
        .mockResolvedValueOnce({ error: 'API error' })
      const tracksResponse = await getAlbumTracks(album)

      expect(tracksResponse).toHaveProperty('tracks')
      expect(Array.isArray(tracksResponse.tracks)).toBe(true)
      expect(tracksResponse.tracks.length).toBe(0)
      expect(tracksResponse).toHaveProperty('error');
      expect(tracksResponse.error).toHaveProperty('error')
      expect(tracksResponse.error.error).toBe("API error")
    })
    it('should return both tracks and error when iteration required but error returned', async () => {
      get_tracks_by_album
        .mockResolvedValueOnce({ total: 75, items: [ { uri: 'track1', artists: [{ name: 'Artist 1' }] } ] })
        .mockResolvedValueOnce({ total: 75, items: [ { uri: 'track1', artists: [{ name: 'Artist 1' }] } ] })
        .mockResolvedValueOnce({ error: 'API error' })
      const tracksResponse = await getAlbumTracks(album)

      expect(tracksResponse).toHaveProperty('tracks')
      expect(Array.isArray(tracksResponse.tracks)).toBe(true)
      expect(tracksResponse.tracks.length).toBe(1)
      expect(tracksResponse).toHaveProperty('error');
      expect(tracksResponse.error).toHaveProperty('error')
      expect(tracksResponse.error.error).toBe("API error")
    })
  })
  describe('isTrackArtist', () => {
    it('returns true when only track artist is album artist', () => {
      const track = { artists: [{ name: 'Artist 1' }] }
      const album = { artist: { name: 'Artist 1' } }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns true when track artists does contain album artist', () => {
      const track = { artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }] }
      const album = { artist: { name: 'Artist 2' } }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns true when only track artist is album related artist', () => {
      const track = { artists: [{ name: 'Related Artist 1' }] }
      const album = { artist: { name: 'Artist 1'}, relatedArtist: { name: 'Related Artist 1'} }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns true when track artists does contain album related artist', () => {
      const track = { artists: [{ name: 'Related Artist 1' }, { name: 'Related Artist 2' }] }
      const album = { artist: { name: 'Artist 1' }, relatedArtist: { name: 'Related Artist 2' } }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns false when only track artist does not match album artist', () => {
      const track = { artists: [{ name: 'Artist 1' }] }
      const album = { artist: { name: 'Artist 2' }, relatedArtist: { name: '' } }

      expect(isTrackArtist(track, album)).toBe(false)
    })
    it('returns false when only track artist does not match album artist or related artist', () => {
      const track = { artists: [{ name: 'Artist 1' }] }
      const album = { artist: { name: 'Artist 2' }, relatedArtist: { name: 'Artist 3' } }

      expect(isTrackArtist(track, album)).toBe(false)
    })
    it('returns false when track artists does not contain album artist', () => {
      const track = { artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }] }
      const album = { artist: { name: 'Artist 3'}, relatedArtist: { name: '' } }

      expect(isTrackArtist(track, album)).toBe(false)
    })
    it('returns false when track artists does not contain album artist or related artist', () => {
      const track = { artists: [{ name: 'Artist 1' }, { name: 'Artist 2' }] }
      const album = { artist: { name: 'Artist 3'}, relatedArtist: { name: 'Artist 4' } }

      expect(isTrackArtist(track, album)).toBe(false)
    })
    it('returns true - case insensitive album artist', () => {
      const track = { artists: [{ name: 'aRtIsT 1' }] }
      const album = { artist: { name: 'ArTiSt 1' } }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns true - case insensitive album related artist', () => {
      const track = { artists: [{ name: 'rElAtEd ArTiSt 1' }] }
      const album = { artist: { name: 'Artist 1' }, relatedArtist: { name: 'ReLaTeD aRtIsT 1' } }

      expect(isTrackArtist(track, album)).toBe(true)
    })
    it('returns false when album related artist is empty and no artist match', () => {
      const track = { artists: [{ name: 'Artist 1' }] }
      const album = { artist: { name: 'Artist 2' }, relatedArtist: { name: ''} }

      expect(isTrackArtist(track, album)).toBe(false)
    })
  })
  describe('filterTracks', () => {
    it('should filter out tracks that do not match the given artist', async () => {
      const tracks = [
        { uri: 'track1', artists: [{ name: 'Artist 2' }] }
      ]
      const filtered = filterTracks(tracks, album)
      expect(filtered.length).toBe(0)
    })
  })
  describe('TracksAlbumOnTracks', () => {
    it('should set fields on each track', () => {
      const tracks = [
        { uri: 'track1' },
        { uri: 'track2' }
      ] 
      const setTracks = setAlbumOnTracks(tracks, album)
      verifySetTrack(setTracks[0])
      verifySetTrack(setTracks[1])
    })
  })
  // describe("updateExistingTrack", () => {
  //   beforeAll(async () => {
  //     mongoServer = await MongoMemoryServer.create({
  //       binary: {
  //         version: '7.0.15'
  //       }
  //     });
  //     const uri = mongoServer.getUri();
  //     await mongoose.connect(uri);
  //   });
  //   beforeEach(async () => {
  //     await Track.deleteMany({}).exec();
  //   })
  //   afterAll(async () => {
  //     await mongoose.disconnect();
  //     await mongoServer.stop();
  //   });
  //   it('should update existing track', async () => {
  //     await Track.insertMany([
  //       { uri: 'track1', playlist_position: 0, to_include: true },
  //       { uri: 'track2', playlist_position: 1, to_include: true }
  //     ])

  //     const tracks = await Track.find({ uri: 'track1' })
  //     const id = tracks[0]._id

  //     const track = { _id: id, uri: 'track1', playlist_position: 0, to_include: true }

  //     const playlistPositionAfterUpdate = await updateExistingTrack(track, 100)

  //     expect(playlistPositionAfterUpdate).toBe(101)

  //     const tracksAfterUpdate = await Track.find({})
  //     tracksAfterUpdate[0].playlist_position = 100
  //     tracksAfterUpdate[1].playlist_position = 1
  //   })
  //   it('should not update existing track if to_include is false', async () => {
  //     await Track.insertMany([
  //       { uri: 'track1', playlist_position: -1, to_include: false },
  //     ])

  //     const tracks = await Track.find({ uri: 'track1'})
  //     const id = tracks[0]._id

  //     const track = { _id: id, uri: 'track1', playlist_position: -1, to_include: false }

  //     const playlistPositionAfterUpdate = await updateExistingTrack(track, 100)

  //     expect(playlistPositionAfterUpdate).toBe(100)

  //     const tracksAfterUpdate = await Track.find({})
  //     tracksAfterUpdate[0].playlist_position = -1
  //   })
  // })
  // describe('updateTrack', () => {
  //   it('should update existing track', () => {

  //   })
  // })
})

const verifySetTrack = (track) => {
  expect(track).toHaveProperty('album')
  expect(track.album).toHaveProperty('uri')
  expect(track.album.uri).toBe('album1')
  expect(track.album).toHaveProperty('artist')
  expect(track.album.artist).toHaveProperty('name')
  expect(track.album.artist.name).toBe('Artist 1')
  expect(track.album.artist).toHaveProperty('spotify_id')
  expect(track.album.artist.spotify_id).toBe('artist1')
  expect(track.album.artist).toHaveProperty('watchlist')
  expect(track.album.artist.watchlist).toBe(false)
  expect(track.album).toHaveProperty('relatedArtist')
  expect(track.album.relatedArtist).toHaveProperty('name')
  expect(track.album.relatedArtist.name).toBe('')
  expect(track.album.relatedArtist).toHaveProperty('spotify_id')
  expect(track.album.relatedArtist.spotify_id).toBe('')
}