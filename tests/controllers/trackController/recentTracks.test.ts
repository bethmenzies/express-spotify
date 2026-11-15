import { getRecentTracks, getAlbumTracks, isTrackArtist, filterTracks, setAlbumOnTracks } from '../../../src/controllers/trackController'
import { AlbumsTracksError } from '../../../src/errors'
import * as spotifyTrack from '../../../src/services/spotify/track'

jest.mock('../../../src/services/spotify/track')

const mockGetTracksByAlbum = spotifyTrack.get_tracks_by_album as jest.Mock

const album = { name: 'Album 1', uri: 'album1', artist: { name: 'Artist 1', spotify_id: 'artist1', watchlist: false }, relatedArtist: { name: '', spotify_id: '' } }
const albumWithRelatedArtist = { name: 'Album 2', uri: 'album2', artist: { name: 'Artist 1', spotify_id: 'artist1', watchlist: false}, relatedArtist: { name: 'Artist 2', spotify_id: 'artist2' } }

describe('get tracks', () => {
  beforeEach(() => {
    mockGetTracksByAlbum.mockClear()
  });
  describe('getRecentTracks', () => {
    it('should return error', async () => {
      mockGetTracksByAlbum.mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getRecentTracks([album])
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
    })
    it('should handle error on second call gracefully', async () => {
      mockGetTracksByAlbum.mockResolvedValueOnce({ total: 1 })
      mockGetTracksByAlbum.mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getRecentTracks([album])
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
    })
    it('should return track and error when iteration required but error returned', async () => {
      mockGetTracksByAlbum
        .mockResolvedValueOnce({ total: 75, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }] })
        .mockResolvedValueOnce({ total: 75, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }] })
        .mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getRecentTracks([album])
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
    })
    it('should return tracks when no error', async () => {
      mockGetTracksByAlbum
        .mockResolvedValueOnce({ total: 2, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }] })
        .mockResolvedValueOnce({ total: 2, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }, { uri: 'track2', artists: [{ name: 'Artist 1' }] }] })
      
        const recentTracks = await getRecentTracks([album])

        expect(Array.isArray(recentTracks)).toBe(true)
        expect(recentTracks.length).toBe(2)
        verifySetTrack(recentTracks[0])
    })
    it('should filter track without album artist', async () => {
      mockGetTracksByAlbum
        .mockResolvedValueOnce({ total: 2, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }] })
        .mockResolvedValueOnce({ total: 2, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }, { uri: 'track2', artists: [{ name: 'Artist 2' }] }] })
      
        const recentTracks = await getRecentTracks([album])

        expect(Array.isArray(recentTracks)).toBe(true)
        expect(recentTracks.length).toBe(1)
        verifySetTrack(recentTracks[0])
    })
    it('should not filter tracks with matching related artist', async () => {
      mockGetTracksByAlbum
        .mockResolvedValueOnce({ total: 4, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }] })
        .mockResolvedValueOnce({ total: 4, items: [{ uri: 'track1', artists: [{ name: 'Artist 1' }] }, { uri: 'track2', artists: [{ name: 'Artist 2' }] }, { uri: 'track3', artists: [{ name: 'Artist 1'}, { name: 'Artist 2' }] }, { uri: 'track4', artists: [{ name: 'Artist 3' }] }] })
      
        const recentTracks = await getRecentTracks([albumWithRelatedArtist])

        expect(Array.isArray(recentTracks)).toBe(true)
        expect(recentTracks.length).toBe(3)
        verifySetTrackWithRelatedArtist(recentTracks[0])
    })
  })
  describe('getAlbumTracks', () => {
    it('should handle error gracefully', async () => {
      mockGetTracksByAlbum.mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getAlbumTracks(album)
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
    })
    it('should handle error on second call gracefully', async () => {
      mockGetTracksByAlbum.mockResolvedValueOnce({ total: 1 })
      mockGetTracksByAlbum.mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getAlbumTracks(album)
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
    })
    it('should return both tracks and error when iteration required but error returned', async () => {
      mockGetTracksByAlbum
        .mockResolvedValueOnce({ total: 75, items: [ { uri: 'track1', artists: [{ name: 'Artist 1' }] } ] })
        .mockResolvedValueOnce({ total: 75, items: [ { uri: 'track1', artists: [{ name: 'Artist 1' }] } ] })
        .mockRejectedValueOnce(new Error)
      expect.assertions(4)
      try {
        await getAlbumTracks(album)
      } catch (error) {
        expect(error).toBeInstanceOf(AlbumsTracksError)
        const albumsTracksError = error as AlbumsTracksError
        expect(albumsTracksError).toHaveProperty('message', 'Tracks by album call errored at album: Album 1 of artist: Artist 1')
        expect(albumsTracksError).toHaveProperty('error')
        expect(albumsTracksError.error).toBeInstanceOf(Error)
      }
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
    it('should not filter out tracks that match the given artist', async () => {
      const tracks = [
        { uri: 'track1', artists: [{ name: 'Artist 1'}] }
      ]
      const filtered = filterTracks(tracks, album)
      expect(filtered.length).toBe(1)
    })
    it('should filter out tracks that do not match the given artist', async () => {
      const tracks = [
        { uri: 'track1', artists: [{ name: 'Artist 2' }] }
      ]
      const filtered = filterTracks(tracks, album)
      expect(filtered.length).toBe(0)
    })
  })
  describe('setAlbumOnTracks', () => {
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
})

const verifySetTrack = (track: any) => {
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

const verifySetTrackWithRelatedArtist = (track: any) => {
  expect(track).toHaveProperty('album')
  expect(track.album).toHaveProperty('uri')
  expect(track.album.uri).toBe('album2')
  expect(track.album).toHaveProperty('artist')
  expect(track.album.artist).toHaveProperty('name')
  expect(track.album.artist.name).toBe('Artist 1')
  expect(track.album.artist).toHaveProperty('spotify_id')
  expect(track.album.artist.spotify_id).toBe('artist1')
  expect(track.album.artist).toHaveProperty('watchlist')
  expect(track.album.artist.watchlist).toBe(false)
  expect(track.album).toHaveProperty('relatedArtist')
  expect(track.album.relatedArtist).toHaveProperty('name')
  expect(track.album.relatedArtist.name).toBe('Artist 2')
  expect(track.album.relatedArtist).toHaveProperty('spotify_id')
  expect(track.album.relatedArtist.spotify_id).toBe('artist2')
}