import { RequestParamError } from "../../../src/errors";
import { get_tracks_by_album } from "../../../src/services/spotify/track";
import * as callSpotify from "../../../src/services/spotify/common"

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/albums/albumId/tracks?limit=1&offset=0`,
  method: 'GET',
  headers: {
      Authorization: 'Bearer undefined'
  },
  json: true
}

describe('get_tracks_by_album', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return call_spotify response', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    const response = await get_tracks_by_album('albumId', 1, 0)
    expect(response).toStrictEqual({success: true})
  })
  it('should set path in call_spotify options', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await get_tracks_by_album('albumId', 1, 0)
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, undefined)
  })
  it('should error when no album id', async () => {
    expect.assertions(3)
    try {
      await get_tracks_by_album('', 1, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Album Tracks call cannot be made due to 'albumId' with value: ")
    }
  })
  it('should error when limit is negative', async () => {
    expect.assertions(3)
    try {
      await get_tracks_by_album('albumId', -1, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Album Tracks call cannot be made due to 'limit' with value: -1")
    }
  })
  it('should error when limit is zero', async () => {
    expect.assertions(3)
    try {
      await get_tracks_by_album('albumId', 0, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Album Tracks call cannot be made due to 'limit' with value: 0")
    }
  })
  it('should error when limit is too big', async () => {
    expect.assertions(3)
    try {
      await get_tracks_by_album('artistId', 123, 0)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Album Tracks call cannot be made due to 'limit' with value: 123")
    }
  })
  it('should error when offset is negative', async () => {
    expect.assertions(3)
    try {
      await get_tracks_by_album('artistId', 1, -1)
    } catch (error) {
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Get Album Tracks call cannot be made due to 'offset' with value: -1")
    }
  })
  it('should error when call_spotify errors', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await get_tracks_by_album('albumId', 1, 0)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})