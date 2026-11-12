import { get_playlists } from '../../../src/services/spotify/playlist'
import * as callSpotify from '../../../src/services/spotify/common'
import { RequestParamError } from '../../../src/errors'

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/me/playlists?limit=1&offset=0`,
  method: 'GET',
  headers: {
      Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
  },
  json: true
}

describe('get_playlists', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return response from call_spotify', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    const response = await get_playlists(1, 0)
    expect(response).toStrictEqual({ success: true })
  })
  it('should set options', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await get_playlists(1, 0)
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, undefined)
  })
  it('should throw error when limit is 0', async () => {
    expect.assertions(3)
    try {
      await get_playlists(0, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Current User's Playlists call cannot be made due to 'limit' with value: 0")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  }) 
  it('should throw error when limit is negative', async () => {
    expect.assertions(3)
    try {
      await get_playlists(-1, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Current User's Playlists call cannot be made due to 'limit' with value: -1")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should throw error when limit is too big', async () => {
    expect.assertions(3)
    try {
      await get_playlists(123, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Current User's Playlists call cannot be made due to 'limit' with value: 123")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should throw error when offset is negative', async () => {
    expect.assertions(3)
    try {
      await get_playlists(1, -1)
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Current User's Playlists call cannot be made due to 'offset' with value: -1")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should throw error when call_spotify error', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await get_playlists(1, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})