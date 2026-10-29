const { addTracksOneByOneToPlaylist, addAllTracksToPlaylist, addTracksToArtistPlaylists } = require('../../../src/controllers/playlistController')
const { get_playlists, call_add_tracks_to_playlist } = require('../../../src/services/spotify/playlist');

jest.mock('../../../src/utils/constants', () => {
  return {
    SPOTIFY_URI_LIMIT: 2
  }
})

jest.mock('../../../src/services/spotify/playlist', () => {
  return {
    call_add_tracks_to_playlist: jest.fn(),
    get_playlists: jest.fn()
  };
});

describe('addTracksOneByOneToPlaylist', () => {
  beforeEach(() => {
    call_add_tracks_to_playlist.mockClear()
  })
  it('should return error response', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addTracksOneByOneToPlaylist('id', ['track'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should return error response after successful call', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addTracksOneByOneToPlaylist('id', ['track1', 'track2'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should not return error when no error returned', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    const response = await addTracksOneByOneToPlaylist('id', ['track'])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
  })
  it('should return success when no tracks', async () => {
    const response = await addTracksOneByOneToPlaylist('id', [])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(0)
  })
  it('should make the request body when track does not have fields', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksOneByOneToPlaylist('id', ['track'])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', [undefined], undefined)
  })
  it('should make the request body when track has uri', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksOneByOneToPlaylist('id', [{ uri: 'track1' }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1'], undefined)
  })
  it('should make the request body when track has fields', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksOneByOneToPlaylist('id', [{ uri: 'track1', playlist_position: 101 }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1'], 101)
  })
  it('should add tracks one by one', async () => {
    call_add_tracks_to_playlist.mockResolvedValue({ success: true })
    await addTracksOneByOneToPlaylist('id', [{ uri: 'track1', playlist_position: 101 }, { uri: 'track2', playlist_position: 202 }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(2)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1'], 101)
    expect(call_add_tracks_to_playlist).toHaveBeenLastCalledWith('id', ['track2'], 202)
  })
})
describe('addAllTracksToPlaylist', () => {
  beforeEach(() => {
    call_add_tracks_to_playlist.mockClear()
  })
  it('should return error response', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addAllTracksToPlaylist('id', ['track'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should return error response after successful call', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addAllTracksToPlaylist('id', ['track1', 'track2', 'track3'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should not return error when no error returned', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    const response = await addAllTracksToPlaylist('id', ['track'])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
  })
  it('should return success when no tracks', async () => {
    const response = await addAllTracksToPlaylist('id', [])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(0)
  })
  it('should make the request body when track does not have fields', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addAllTracksToPlaylist('id', ['track'])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', [undefined])
  })
  it('should make the request body when track has uri', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addAllTracksToPlaylist('id', [{ uri: 'track1' }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1'])
  })
  it('should add all tracks', async () => {
    call_add_tracks_to_playlist.mockResolvedValue({ success: true })
    await addAllTracksToPlaylist('id', [{ uri: 'track1' }, { uri: 'track2' }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1', 'track2'])
  })
  it('should add all tracks with limit', async () => {
    call_add_tracks_to_playlist.mockResolvedValue({ success: true })
    await addAllTracksToPlaylist('id', [{ uri: 'track1' }, { uri: 'track2' }, { uri: 'track3' }])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(2)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track1', 'track2'])
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', ['track3'])
  })
})
describe('addTracksToArtistPlaylists', () => {
  beforeEach(() => {
    call_add_tracks_to_playlist.mockClear()
  })
  it('should add tracks', async () => {
    call_add_tracks_to_playlist.mockResolvedValue({ success: true })
    get_playlists.mockResolvedValue({ total: 1, items: [{ name: 'artist' }] })
    await addTracksToArtistPlaylists([{ uri: 'track1', album: { artist: { name: 'artist' } } }, { uri: 'track2', album: { artist: { name: 'artist 2' } } }, { uri: 'track3', album: { artist: { name: 'artist' } } }])
    expect(get_playlists).toHaveBeenCalledTimes(2)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
  })
  // TODO add more tests
})