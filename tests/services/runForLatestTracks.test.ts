import { runForLatestTracks } from '../../src/services/runService'
import * as trackService from '../../src/services/trackService'
import * as playlistController from '../../src/controllers/playlistController'
import * as albumController from '../../src/controllers/albumController'
import * as trackController from '../../src/controllers/trackController'
import Artist from '../../src/services/db/models/artist'
import Track from '../../src/services/db/models/track'
import { MongoMemoryServer } from 'mongodb-memory-server'
import * as mongoose from 'mongoose'
import * as returnValues from '../resources/returnValues'
import * as spotifyPlaylist from '../../src/services/spotify/playlist'

let mongoServer: MongoMemoryServer;

jest.mock('../../src/services/trackService', () => {
  const actualTrackService = jest.requireActual('../../src/services/trackService')
  return {
    ...actualTrackService,
    removeTracksFromDB: jest.fn(),
    removeTracksFromPlaylist: jest.fn()
  }
})

const mockRemoveTracksFromDB = trackService.removeTracksFromDB as jest.Mock
const mockRemoveTracksFromPlaylist = trackService.removeTracksFromPlaylist as jest.Mock

jest.mock('../../src/services/spotify/playlist')

const mockCreatePlaylist = spotifyPlaylist.create_playlist as jest.Mock

jest.mock('../../src/controllers/albumController')

const mockGetRecentAlbums = albumController.getRecentAlbums as jest.Mock

jest.mock('../../src/controllers/trackController')

const mockGetRecentTracks = trackController.getRecentTracks as jest.Mock

jest.mock('../../src/controllers/playlistController')

const mockAddTracksOneByOneToPlaylist = playlistController.addTracksOneByOneToPlaylist as jest.Mock
const mockAddTracksToArtistPlaylists = playlistController.addTracksToArtistPlaylists as jest.Mock

describe('runForLatestTracks', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });

    await Artist.insertMany([returnValues.armsLength, returnValues.fallOutBoy, returnValues.paramore])
    await Track.insertMany([returnValues.theWeightDB, returnValues.startTodayToIncludeDB, returnValues.startTodayNotIncludeDB, returnValues.particlePhysicsDB, returnValues.mirtazapineDB])
  });
  beforeEach(async () => {
    mockRemoveTracksFromDB.mockClear()
    mockRemoveTracksFromPlaylist.mockClear()
    mockCreatePlaylist.mockClear()
    mockGetRecentAlbums.mockClear()
    mockGetRecentTracks.mockClear()
    mockAddTracksOneByOneToPlaylist.mockClear()
    mockAddTracksToArtistPlaylists.mockClear()
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  })
  it('should update tracks in db', async () => {
    mockRemoveTracksFromDB.mockReturnValue([])
    mockRemoveTracksFromPlaylist.mockReturnValue({ success: true })
    mockCreatePlaylist.mockResolvedValue({ success: true })
    mockGetRecentAlbums.mockReturnValue([returnValues.theresAWholeWorldOutThere, returnValues.sameOldWastedWonderfulWorldDeluxe, returnValues.sameOldWastedWonderfulWorld, returnValues.fromUnderTheCorkTree, returnValues.startToday, returnValues.egoDeathAtABacheloretteParty])
    mockGetRecentTracks.mockReturnValue([returnValues.theWeight, returnValues.startTodayNotInclude, returnValues.startTodayToInclude, returnValues.particlePhysics, returnValues.particlePhysicsNew, returnValues.mirtazapine])

    const toRender = await runForLatestTracks(false)
    expect(toRender.tracks.length).toBe(1)
    expect(toRender.tracks[0].playlist_position).toBe(3)

    const tracks = await Track.find({}).sort({ 'playlist_position': 1 })
    expect(tracks.length).toBe(6)
    const track1 = await Track.find({ playlist_position: 0 })
    expect(track1[0].name).toBe('The Weight')
    const track2 = await Track.find({ playlist_position: 1 })
    expect(track2[0].name).toBe('Start Today')
    expect(track2[0].to_include).toBe(true)
    expect(track2[0].album.name).toBe('From Under The Cork Tree (20th Anniversary Deluxe)')
    const track3 = await Track.find({ playlist_position: 2 })
    expect(track3[0].name).toBe("Particle Physics")
    expect(track3[0].album.name).toBe('The Same Old Wasted Wonderful World')
    const track4 = await Track.find({ playlist_position: 3 })
    expect(track4[0].name).toBe("Particle Physics")
    expect(track4[0].album.name).toBe("The Same Old Wasted Wonderful World (Deluxe)")
    const track5 = await Track.find({ playlist_position: 4 })
    expect(track5[0].name).toBe("Mirtazapine")
    expect(track5[0].album.artist.name).toBe("Paramore")
    expect(track5[0].album.artist.related_artist!.name).toBe("Hayley Williams")
  })
})