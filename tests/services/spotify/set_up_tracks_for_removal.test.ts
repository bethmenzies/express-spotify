import { RequestParamError } from "../../../src/errors"
import { set_up_tracks_for_removal } from "../../../src/services/spotify/playlist"

jest.mock('../../../src/utils/constants', () => {
  return {
    SPOTIFY_URI_LIMIT: 2,
  }
})

describe('set_up_tracks_for_removal', () => {
  it('should return uris', () => {
    const uris = set_up_tracks_for_removal([{ name: 'Track 1', uri: 'track1' }, { name: 'Track 2', uri: 'track2' }])
    expect(uris).toStrictEqual([[ { uri: 'track1' }, { uri: 'track2' } ]])
  })
  it('should return error when no uris', () => {
    try {
      set_up_tracks_for_removal([{ name: 'Track 1' }, {name: 'Track 2' }])
    } catch (error) {
      expect(error).toBeInstanceOf(RequestParamError)
    }
  })
  it('should return uris when some uris exist', () => {
    const uris = set_up_tracks_for_removal([{ name: 'Track 1', uri: 'track1' }, { name: 'Track 2' }])
    expect(uris).toStrictEqual([[ { uri: 'track1' } ]])
  })
  it('should split array on uri limit', () => {
    const uris = set_up_tracks_for_removal([{ name: 'Track 1', uri: 'track1' }, { name: 'Track 2', uri: 'track2' }, { name: 'Track 3', 'uri': 'track3' }])
    expect(uris).toStrictEqual([[ { uri: 'track1' }, { uri: 'track2' } ], [ {uri: 'track3' } ]])
  })
})