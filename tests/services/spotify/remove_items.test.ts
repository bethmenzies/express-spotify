import { remove_items } from '../../../src/services/spotify/playlist'
import * as callSpotify from '../../../src/services/spotify/common'
import { RequestParamError } from '../../../src/errors'

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/playlists/playlistId/items`,
  method: 'DELETE',
  headers: {
      Authorization: 'Bearer undefined',
      "Transfer-Encoding": "chunked"
  },
  json: true
}

const body = JSON.stringify({
  "items": [{ "uri": "uri"}]
})

describe('remove_items', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return call_spotify response', async () => {
    mockCallSpotify.mockResolvedValueOnce({success: true})
    const response = await remove_items('playlistId', [{ uri: 'uri' }])
    expect(response).toStrictEqual({ success: true })
  })
  it('should call with options and body', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await remove_items('playlistId', [{ uri: 'uri' }])
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, body)
  })
  it('should return error when no playlistId', async () => {
    expect.assertions(3)
    try {
      await remove_items('', [{ uri: 'uri' }])
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Remove Playlist Items call cannot be made due to 'playlistId' with value: ")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should return error when no uris', async () => {
    expect.assertions(3)
    try {
      await remove_items('playlistId', [])
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Remove Playlist Items call cannot be made due to 'items' with value: is empty")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should return error when call_spotify errored', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await remove_items('playlistId', [{ uri: 'uri' }])
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})