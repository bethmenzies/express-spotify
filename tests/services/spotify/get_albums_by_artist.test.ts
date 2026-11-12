import { RequestParamError } from "../../../src/errors";
import { get_albums_by_artist } from "../../../src/services/spotify/album";
import * as callSpotify from "../../../src/services/spotify/common"

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/artists/artistId/albums?limit=1&offset=0`,
  method: 'GET',
  headers: {
      Authorization: 'Bearer undefined'
  },
  json: true
}

describe('get_albums_by_artist', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return call_spotify response', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    const response = await get_albums_by_artist('artistId', 1, 0)
    expect(response).toStrictEqual({success: true})
  })
  it('should set path in call_spotify options', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await get_albums_by_artist('artistId', 1, 0)
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, undefined)
  })
  it('should error when no artist id', async () => {
    expect.assertions(3)
    try {
      await get_albums_by_artist('', 1, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Artist's Albums call cannot be made due to 'artistId' with value: ")
    }
  })
  it('should error when limit is negative', async () => {
    expect.assertions(3)
    try {
      await get_albums_by_artist('artistId', -1, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Artist's Albums call cannot be made due to 'limit' with value: -1")
    }
  })
  it('should error when limit is zero', async () => {
    expect.assertions(3)
    try {
      await get_albums_by_artist('artistId', 0, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Artist's Albums call cannot be made due to 'limit' with value: 0")
    }
  })
  it('should error when limit is too big', async () => {
    expect.assertions(3)
    try {
      await get_albums_by_artist('artistId', 123, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Artist's Albums call cannot be made due to 'limit' with value: 123")
    }
  })
  it('should error when offset is negative', async () => {
    expect.assertions(3)
    try {
      await get_albums_by_artist('artistId', 1, -1)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Artist's Albums call cannot be made due to 'offset' with value: -1")
    }
  })
  it('should error when call_spotify errors', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await get_albums_by_artist('artistId', 1, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})