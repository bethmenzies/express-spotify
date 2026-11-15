import { call_add_tracks_to_playlist } from '../../../src/services/spotify/playlist'
import * as callSpotify from '../../../src/services/spotify/common'
import { RequestParamError } from '../../../src/errors'

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/playlists/playlistId/items`,
  method: 'POST',
  headers: {
      Authorization: 'Bearer undefined'
  },
  json: true
}

const body = JSON.stringify({
  "uris": ['uri'],
  "position": 0
})

describe('call_add_tracks_to_playlist', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return call_spotify response', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    const response = await call_add_tracks_to_playlist('playlistId', ['uri'], 0)
    expect(response).toStrictEqual({ success: true })
  })
  it('should call with options and body', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await call_add_tracks_to_playlist('playlistId', ['uri'], 0)
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, body)
  })
  it('should return error when no playlistId', async () => {
    expect.assertions(3)
    try {
      await call_add_tracks_to_playlist('', ['uri'], 0)
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
      const message = error as RequestParamError
      expect(message.message).toBe("Add Items to Playlist call cannot be made due to 'playlistId' with value: ")
      expect(mockCallSpotify).toHaveBeenCalledTimes(0)
    }
  })
  it('should return error when call_spotify errored', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await call_add_tracks_to_playlist('playlistId', ['uri'], 0)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})