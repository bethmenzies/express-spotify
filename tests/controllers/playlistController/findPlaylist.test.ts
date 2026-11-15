import { getAllPlaylists, findPlaylist } from '../../../src/controllers/playlistController'
import { GetPlaylistsError } from '../../../src/errors'
import * as spotifyPlaylist from '../../../src/services/spotify/playlist'

jest.mock('../../../src/services/spotify/playlist')

const mockGetPlaylists = spotifyPlaylist.get_playlists as jest.Mock

describe('getAllPlaylists', () => {
  beforeEach(() => {
    mockGetPlaylists.mockClear()
  })
  it('should return error', async () => {
    mockGetPlaylists.mockRejectedValueOnce(new Error)
    expect.assertions(4)

    try {
      await getAllPlaylists()
    } catch (error) {
      expect(error).toBeInstanceOf(GetPlaylistsError)
      const getPlaylistsError = error as GetPlaylistsError
      expect(getPlaylistsError).toHaveProperty('message', 'Get playlists call errored')
      expect(getPlaylistsError).toHaveProperty('error')
      expect(getPlaylistsError.error).toBeInstanceOf(Error)
    }
  })
  it('should return error on second call', async () => {
    mockGetPlaylists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })
    mockGetPlaylists.mockRejectedValueOnce(new Error)
    expect.assertions(4)

    try {
      await getAllPlaylists()
    } catch (error) {
      expect(error).toBeInstanceOf(GetPlaylistsError)
      const getPlaylistsError = error as GetPlaylistsError
      expect(getPlaylistsError).toHaveProperty('message', 'Get playlists call errored')
      expect(getPlaylistsError).toHaveProperty('error')
      expect(getPlaylistsError.error).toBeInstanceOf(Error)
    }
  })
  it('should return playlists and error if error after iteration', async () => {
    mockGetPlaylists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id' }] })
    mockGetPlaylists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id' }] })
    mockGetPlaylists.mockRejectedValueOnce(new Error)
    expect.assertions(4)

    try {
      await getAllPlaylists()
    } catch (error) {
      expect(error).toBeInstanceOf(GetPlaylistsError)
      const getPlaylistsError = error as GetPlaylistsError
      expect(getPlaylistsError).toHaveProperty('message', 'Get playlists call errored')
      expect(getPlaylistsError).toHaveProperty('error')
      expect(getPlaylistsError.error).toBeInstanceOf(Error)
    }
  })
  it('should return playlist', async () => {
    mockGetPlaylists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })
    mockGetPlaylists.mockResolvedValueOnce({ total: 1, items: [{ id: 'id' }] })

    let playlists = await getAllPlaylists()
    expect(Array.isArray(playlists)).toBe(true)
    expect(playlists.length).toBe(1)
  })
  it('should return all playlists over an iteration', async () => {
    mockGetPlaylists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id1' }] })
    mockGetPlaylists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id1' }] })
    mockGetPlaylists.mockResolvedValueOnce({ total: 75, items: [{ id: 'id2' }] })

    let playlists = await getAllPlaylists() 
    expect(Array.isArray(playlists)).toBe(true)
    expect(playlists.length).toBe(2)
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