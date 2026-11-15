import { addTracksOneByOneToPlaylist, addAllTracksToPlaylist, addTracksToArtistPlaylists } from '../../../src/controllers/playlistController'
import { PlaylistTrackError, PlaylistTracksError } from '../../../src/errors'
import * as spotifyPlaylist from '../../../src/services/spotify/playlist'

jest.mock('../../../src/utils/constants', () => {
  return {
    SPOTIFY_URI_LIMIT: 2,
    SPOTIFY_LIMIT: 50
  }
})

jest.mock('../../../src/services/spotify/playlist')

const mockCallAddTracksToPlaylist = spotifyPlaylist.call_add_tracks_to_playlist as jest.Mock
const mockGetPlaylists = spotifyPlaylist.get_playlists as jest.Mock

describe('addTracksOneByOneToPlaylist', () => {
  beforeEach(() => {
    mockCallAddTracksToPlaylist.mockClear()
  })
  it('should return error response', async () => {
    mockCallAddTracksToPlaylist.mockRejectedValueOnce(new Error)
    expect.assertions(4)
    try {
      await addTracksOneByOneToPlaylist('id', [{ name: 'Track 1', album: { artist: { name: 'Artist 1' } } }])
    } catch (error) {
      expect(error).toBeInstanceOf(PlaylistTrackError)
      const playlistTrackError = error as PlaylistTrackError
      expect(playlistTrackError).toHaveProperty('message', 'Playlist call errored adding track: Track 1 of artist: Artist 1')
      expect(playlistTrackError).toHaveProperty('error')
      expect(playlistTrackError).toBeInstanceOf(Error)
    }
  })
  it('should return error response after successful call', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    mockCallAddTracksToPlaylist.mockRejectedValueOnce(new Error)
    expect.assertions(4)
    try {
      await addTracksOneByOneToPlaylist('id', [{ name: 'Track 1', album: { artist: { name: 'Artist 1' } } }, { name: 'Track 2', album: { artist: { name: 'Artist 1' } } }])
    } catch (error) {
      expect(error).toBeInstanceOf(PlaylistTrackError)
      const playlistTrackError = error as PlaylistTrackError
      expect(playlistTrackError).toHaveProperty('message', 'Playlist call errored adding track: Track 2 of artist: Artist 1')
      expect(playlistTrackError).toHaveProperty('error')
      expect(playlistTrackError).toBeInstanceOf(Error)
    }
  })
  it('should not return error when no error returned', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addTracksOneByOneToPlaylist('id', [{ name: 'Track 1' }])).resolves
  })
  it('should return success when no tracks', async () => {
    expect(await addTracksOneByOneToPlaylist('id', [])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(0)
  })
  it('should make the request body when track does not have fields', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addTracksOneByOneToPlaylist('id', ['track'])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', [undefined], undefined)
  })
  it('should make the request body when track has uri', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addTracksOneByOneToPlaylist('id', [{ uri: 'track1' }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1'], undefined)
  })
  it('should make the request body when track has fields', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addTracksOneByOneToPlaylist('id', [{ uri: 'track1', playlist_position: 101 }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1'], 101)
  })
  it('should add tracks one by one', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValue('snapshotId')
    expect(await addTracksOneByOneToPlaylist('id', [{ uri: 'track1', playlist_position: 101 }, { uri: 'track2', playlist_position: 202 }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(2)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1'], 101)
    expect(mockCallAddTracksToPlaylist).toHaveBeenLastCalledWith('id', ['track2'], 202)
  })
})
describe('addAllTracksToPlaylist', () => {
  beforeEach(() => {
    mockCallAddTracksToPlaylist.mockClear()
  })
  it('should return error response', async () => {
    mockCallAddTracksToPlaylist.mockRejectedValueOnce(new Error)
    expect.assertions(4)
    try {
      await addAllTracksToPlaylist('id', [{ name: 'Track 1' }, { name: 'Track 2' }])
    } catch (error) {
      expect(error).toBeInstanceOf(PlaylistTracksError)
      const playlistTracksError = error as PlaylistTracksError
      expect(playlistTracksError).toHaveProperty('message', 'Playlist call errored adding tracks')
      expect(playlistTracksError).toHaveProperty('error')
      expect(playlistTracksError).toBeInstanceOf(Error)
    }
  })
  it('should return error response after successful call', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    mockCallAddTracksToPlaylist.mockRejectedValueOnce(new Error)
    expect.assertions(4)
    try {
      await addAllTracksToPlaylist('id', [{ name: 'Track 1' }, { name: 'Track 2' }, { name: 'Track 3' }])
    } catch (error) {
      expect(error).toBeInstanceOf(PlaylistTracksError)
      const playlistTracksError = error as PlaylistTracksError
      expect(playlistTracksError).toHaveProperty('message', 'Playlist call errored adding tracks')
      expect(playlistTracksError).toHaveProperty('error')
      expect(playlistTracksError).toBeInstanceOf(Error)
    }
  })
  it('should not return error when no error returned', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addAllTracksToPlaylist('id', ['track'])).resolves
  })
  it('should return success when no tracks', async () => {
    expect(await addAllTracksToPlaylist('id', [])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(0)
  })
  it('should make the request body when track does not have fields', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addAllTracksToPlaylist('id', ['track'])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', [undefined], undefined)
  })
  it('should make the request body when track has uri', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValueOnce('snapshotId')
    expect(await addAllTracksToPlaylist('id', [{ uri: 'track1' }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1'], undefined)
  })
  it('should add all tracks', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValue('snapshotId')
    expect(await addAllTracksToPlaylist('id', [{ uri: 'track1' }, { uri: 'track2' }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1', 'track2'], undefined)
  })
  it('should add all tracks with limit', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValue('snapshotId')
    expect(await addAllTracksToPlaylist('id', [{ uri: 'track1' }, { uri: 'track2' }, { uri: 'track3' }])).resolves
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(2)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track1', 'track2'], undefined)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledWith('id', ['track3'], undefined)
  })
})
describe('addTracksToArtistPlaylists', () => {
  beforeEach(() => {
    mockCallAddTracksToPlaylist.mockClear()
  })
  it('should add tracks', async () => {
    mockCallAddTracksToPlaylist.mockResolvedValue('snapshotId')
    mockGetPlaylists.mockResolvedValue({ total: 1, items: [{ name: 'artist' }] })
    await addTracksToArtistPlaylists([{ uri: 'track1', album: { artist: { name: 'artist' } } }, { uri: 'track2', album: { artist: { name: 'artist 2' } } }, { uri: 'track3', album: { artist: { name: 'artist' } } }])
    expect(mockGetPlaylists).toHaveBeenCalledTimes(2)
    expect(mockCallAddTracksToPlaylist).toHaveBeenCalledTimes(1)
  })
  // TODO add more tests
})