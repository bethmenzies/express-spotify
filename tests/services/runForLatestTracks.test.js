const { runForLatestTracks } = require('../../src/services/runService')
const { removeTracksFromDB, removeTracksFromPlaylist } = require('../../src/services/trackService')
const { create_playlist, add_tracks, add_tracks_to_artist_playlists } = require('../../src/controllers/playlistController')
const { recentAlbums } = require('../../src/controllers/albumController')
const { recentTracks } = require('../../src/controllers/trackController')
const Artist = require('../../src/models/artist')
const Track = require('../../src/models/track')
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const returnValues = require('../resources/returnValues')

let mongoServer;

jest.mock('../../src/services/trackService', () => {
  const originalModule = jest.requireActual('../../src/services/trackService')
  return {
    ...originalModule,
    removeTracksFromDB: jest.fn(),
    removeTracksFromPlaylist: jest.fn()
  }
})

jest.mock('../../src/controllers/playlistController', () => {
  return {
    create_playlist: jest.fn(),
    add_tracks: jest.fn(),
    add_tracks_to_artist_playlists: jest.fn()
  }
})

jest.mock('../../src/controllers/albumController', () => {
  return {
    recentAlbums: jest.fn()
  }
})

jest.mock('../../src/controllers/trackController', () => {
  return {
    recentTracks: jest.fn()
  }
})

describe('runForLatestTracks', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    await Artist.insertMany([returnValues.armsLength, returnValues.fallOutBoy, returnValues.paramore])
    await Track.insertMany([returnValues.theWeightDB, returnValues.startTodayToIncludeDB, returnValues.startTodayNotIncludeDB, returnValues.particlePhysicsDB, returnValues.mirtazapineDB])
  });
  beforeEach(async () => {
    removeTracksFromDB.mockClear()
    removeTracksFromPlaylist.mockClear()
    create_playlist.mockClear()
    recentAlbums.mockClear()
    recentTracks.mockClear()
    add_tracks.mockClear()
    add_tracks_to_artist_playlists.mockClear()
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  })
  it('should update tracks in db', async () => {
    removeTracksFromDB.mockReturnValue([])
    removeTracksFromPlaylist.mockReturnValue({ allResponses: true, error: '' })
    create_playlist.mockResolvedValue({ success: true })
    recentAlbums.mockReturnValue({ albums: [returnValues.theresAWholeWorldOutThere, returnValues.sameOldWastedWonderfulWorldDeluxe, returnValues.sameOldWastedWonderfulWorld, returnValues.fromUnderTheCorkTree, returnValues.startToday, returnValues.egoDeathAtABacheloretteParty], error: '' })
    recentTracks.mockReturnValue({ tracks: [returnValues.theWeight, returnValues.startTodayNotInclude, returnValues.startTodayToInclude, returnValues.particlePhysics, returnValues.particlePhysicsNew, returnValues.mirtazapine], error: ''})
    add_tracks.mockResolvedValue({ allSuccess: true, error: '' })
    add_tracks_to_artist_playlists.mockResolvedValue({ allSuccess: true, error: '' })

    const toRender = await runForLatestTracks(false)
    expect(toRender.tracks.length).toBe(1)

    const tracks = await Track.find({}).sort({ 'playlist_position': 1 })
    expect(tracks.length).toBe(6)
  })
})