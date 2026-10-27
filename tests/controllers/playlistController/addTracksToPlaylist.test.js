const { addTracksToPlaylist } = require('../../../src/controllers/playlistController')
const { call_add_tracks_to_playlist } = require('../../../src/services/spotifyService')

jest.mock('../../../src/services/spotifyService', () => {
  return {
    call_add_tracks_to_playlist: jest.fn()
  };
});

describe('addTracksToPlaylist', () => {
  beforeEach(() => {
    call_add_tracks_to_playlist.mockClear()
  })
  it('should return error response', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addTracksToPlaylist('id', ['track'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should return error response after successful call', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    call_add_tracks_to_playlist.mockResolvedValueOnce({ error: "API error" })
    const response = await addTracksToPlaylist('id', ['track1', 'track2'])
    expect(response).toHaveProperty('error')
    expect(response.error).toBe('API error')
  })
  it('should not return error when no error returned', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    const response = await addTracksToPlaylist('id', ['track'])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
  })
  it('should return success when no tracks', async () => {
    const response = await addTracksToPlaylist('id', [])
    expect(response).toHaveProperty('success')
    expect(response.success).toBe(true)
  })
  it('should make the request body when track does not have fields', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksToPlaylist('id', ['track'])
    const expectedBody = JSON.stringify({
      "uris" : [null]
    })
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', expectedBody)
  })
  it('should make the request body when track has uri', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksToPlaylist('id', [{ uri: 'track1' }])
    const expectedBody = JSON.stringify({
      "uris" : ['track1']
    })
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', expectedBody)
  })
  it('should make the request body when track has fields', async () => {
    call_add_tracks_to_playlist.mockResolvedValueOnce({ success: true })
    await addTracksToPlaylist('id', [{ uri: 'track1', playlist_position: 101 }])
    const expectedBody = JSON.stringify({
      "uris" : ['track1'],
      "position": 101
    })
    expect(call_add_tracks_to_playlist).toHaveBeenCalledTimes(1)
    expect(call_add_tracks_to_playlist).toHaveBeenCalledWith('id', expectedBody)
  })
})