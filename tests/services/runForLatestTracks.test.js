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
    expect(track5[0].album.artist.related_artist.name).toBe("Hayley Williams")
  })
})