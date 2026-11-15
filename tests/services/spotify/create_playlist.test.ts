import { create_playlist } from '../../../src/services/spotify/playlist'
import * as callSpotify from '../../../src/services/spotify/common'
import { RequestParamError } from '../../../src/errors'

jest.mock('../../../src/services/spotify/common')

const mockCallSpotify = callSpotify.call_spotify as jest.Mock

jest.mock('../../../src/utils/dateUtils', () => {
  return {
    now: jest.fn().mockReturnValue('123'),
  }
})

const options = {
  hostname: 'api.spotify.com',
  path: `/v1/me/playlists`,
  method: 'POST',
  headers: {
      Authorization: 'Bearer undefined'
  },
  json: true
}

const body = JSON.stringify({
  'name': 'Latest Releases - 123'
});

describe('create_playlist', () => {
  beforeEach(() => {
    mockCallSpotify.mockClear()
  })
  it('should return response from call_spotify', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    const response = await create_playlist(undefined)
    expect(response).toStrictEqual({ success: true })
  })
  it('should set options', async () => {
    mockCallSpotify.mockResolvedValueOnce({ success: true })
    await create_playlist(undefined)
    expect(mockCallSpotify).toHaveBeenCalledTimes(1)
    expect(mockCallSpotify).toHaveBeenCalledWith(options, body)
  })
  it('should throw error when call_spotify error', async () => {
    mockCallSpotify.mockRejectedValueOnce(new Error)
    expect.assertions(1)
    try {
      await create_playlist(undefined)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
    }
  })
})