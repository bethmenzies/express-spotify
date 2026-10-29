const { getAllPlaylists, findPlaylist } = require('../../../src/controllers/playlistController');
const { get_playlists } = require('../../../src/services/spotify/playlist');

jest.mock('../../../src/services/spotify/playlist', () => {
  return {
    get_playlists: jest.fn()
  };
});

describe('getAllPlaylists', () => {
  beforeEach(() => {
    get_playlists.mockClear()
  })
  it('should return error', async () => {
    get_playlists.mockResolvedValueOnce({ error: 'API error' })

    let playlistsResponse = await getAllPlaylists()
    expect(playlistsResponse).toHaveProperty('playlists')
    expect(Array.isArray(playlistsResponse.playlists)).toBe(true)
    expect(playlistsResponse.playlists.length).toBe(0)
    expect(playlistsResponse).toHaveProperty('error')
    expect(playlistsResponse.error).toHaveProperty('error')
    expect(playlistsResponse.error.error).toBe('API error')
  })
  it('should return error on second call', async () => {
    get_playlists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })
    get_playlists.mockResolvedValueOnce({ error: 'API error' })

    let playlistsResponse = await getAllPlaylists()
    expect(playlistsResponse).toHaveProperty('playlists')
    expect(Array.isArray(playlistsResponse.playlists)).toBe(true)
    expect(playlistsResponse.playlists.length).toBe(0)
    expect(playlistsResponse).toHaveProperty('error')
    expect(playlistsResponse.error).toHaveProperty('error')
    expect(playlistsResponse.error.error).toBe('API error')
  })
  it('should return playlists and error if error after iteration', async () => {
    get_playlists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id' }] })
    get_playlists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id' }] })
    get_playlists.mockResolvedValueOnce({ error: 'API error' })

    let playlistsResponse = await getAllPlaylists()
    expect(playlistsResponse).toHaveProperty('playlists')
    expect(Array.isArray(playlistsResponse.playlists)).toBe(true)
    expect(playlistsResponse.playlists.length).toBe(1)
    expect(playlistsResponse).toHaveProperty('error')
    expect(playlistsResponse.error).toHaveProperty('error')
    expect(playlistsResponse.error.error).toBe('API error')
  })
  it('should return playlist', async () => {
    get_playlists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })
    get_playlists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })

    let playlistsResponse = await getAllPlaylists()
    expect(playlistsResponse).toHaveProperty('playlists')
    expect(Array.isArray(playlistsResponse.playlists)).toBe(true)
    expect(playlistsResponse.playlists.length).toBe(1)
    expect(playlistsResponse).toHaveProperty('error')
    expect(playlistsResponse.error).toBe('')
  })
  it('should return all playlists over an iteration', async () => {
    get_playlists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id1' }] })
    get_playlists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id1' }] })
    get_playlists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id2' }] })

    let playlistsResponse = await getAllPlaylists() 
    expect(playlistsResponse).toHaveProperty('playlists')
    expect(playlistsResponse.playlists.length).toBe(2)
  })
})
describe('findPlaylist', () => {
  it('should find playlist', () => {
    let playlists = [{ name: 'playlistName' }]
    const result = findPlaylist('playlistName', playlists)
    expect(result).toStrictEqual({ name: 'playlistName' })
  })
  it('should not find playlist', () => {
    let playlists = [ { name: 'playlistName' }]
    const result = findPlaylist('notPlaylistName', playlists)
    expect(result).toBeUndefined()
  })
  it('should not find playlist when empty', () => {
    const result = findPlaylist('playlistName', [])
    expect(result).toBeUndefined()
  })
  it('should find playlist case insensitive', () => {
    let playlists = [ { name: 'pLaYlIsTnAmE' }]
    const result = findPlaylist('PlAyLiStNaMe', playlists)
    expect(result).toStrictEqual({ name: 'pLaYlIsTnAmE' })
  })
})