const Track = require('../../src/models/track');
const { findTracksLteDate, deleteTracksLteDate, findTrackByUri, updateTrackPlaylistPosition, saveNewTrack } = require('../../src/db/tracks');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

describe('findTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('returns old tracks', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2022-12-31', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('track1')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
  })
  it('returns old tracks including same day', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(2)
    expect(tracks[0].uri).toBe('track1')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
    expect(tracks[1].uri).toBe('track2')
    expect(tracks[1].album.release_date).toBe('2023-01-01')
  })
  it('returns no old tracks', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: false }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('returns old tracks only for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('track1')
  })
  it('should return an empty array when there are no tracks', async () => {
    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: true }
    ]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
})
describe('deleteTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('deletes tracks by date', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2022-12-31', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('track2')
    expect(remainingTracks[1].uri).toBe('track3')
  })
  it('deletes tracks by date including same day', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2023-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('track3')
  })
  it('deletes no tracks by date', async () => {
    await Track.insertMany([ 
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('track1')
    expect(remainingTracks[1].uri).toBe('track2')
  })
  it('deletes tracks only for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('track2')
  })
  it('should not delete any tracks when there are no tracks', async () => {
    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: true },
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2024-01-01' }, to_include: true, watchlist: true },
      { uri: 'track2', album: { release_date: '2025-01-01' }, to_include: true, watchlist: true }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should delete all tracks when all tracks are old', async () => {
    await Track.insertMany([
      { uri: 'track1', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track2', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false },
      { uri: 'track3', album: { release_date: '2022-01-01' }, to_include: true, watchlist: false }
    ]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
})
describe('findTrackByUri', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('finds track', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: false },
      { uri: 'track2', 'album.artist.name': 'Artist 1', watchlist: false }
    ])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].uri).toBe('track1')
  })
  it('should not find track if no tracks', async () => {
    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should not find track if no matching uri', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: false }
    ])

    const track = await findTrackByUri('track2', 'Artist 1', false)
    
    expect(track.length).toBe(0)
  })
  it('should not find track if no matching artist', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Related Artist 1', watchlist: false }
    ])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should not find track if not in watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: true }
    ])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should only return the track with the matching artist', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: false },
      { uri: 'track1', 'album.artist.name': 'Related Artist 1', watchlist: false }
    ])

    const track = await findTrackByUri('track1', 'Related Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].album.artist.name).toBe('Related Artist 1')
  })
  it('should only return the track with the matching watchlist', async () => {
    await Track.insertMany([
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: true },
      { uri: 'track1', 'album.artist.name': 'Artist 1', watchlist: false }
    ])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].watchlist).toBe(false)
  })
})
describe('updateTrackPlaylistPosition', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('updates playlist_position', async () => {
    await Track.insertMany([
      { playlist_position: 0 }
    ])

    const tracks = await Track.find({})
    const id = tracks[0]._id

    let response = await updateTrackPlaylistPosition(id, 1)
    expect(response.playlist_position).toBe(1)

    const track = await Track.find({ _id: id })
    expect(track[0].playlist_position).toBe(1)
  })
  it('updates only playlist_position for track with _id', async () => {
    await Track.insertMany([
      { playlist_position: 0 },
      { playlist_position: 100 }
    ])

    const tracks = await Track.find({})
    const idToUpdate = tracks[0]._id
    const id = tracks[1]._id

    let response = await updateTrackPlaylistPosition(idToUpdate, 1)
    expect(response.playlist_position).toBe(1)

    const updatedTrack = await Track.find({ _id: idToUpdate })
    expect(updatedTrack[0].playlist_position).toBe(1)

    const track = await Track.find({ _id: id })
    expect(track[0].playlist_position).toBe(100)
  })
  it('does not update playlist_position if cannot find id', async () => {
    await Track.insertMany([
      { playlist_position: 0 },
      { playlist_position: 1 }
    ])

    const tracks = await Track.find({})
    const id = tracks[0]._id

    await Track.deleteMany({_id: id})

    let response = await updateTrackPlaylistPosition(id, 2)
    expect(response).toBe(null)

    const track = await Track.find({})
    expect(track[0].playlist_position).toBe(1)
  })
  it('adds playlist_position if playlist_position not there', async () => {
    await Track.insertMany([
      { uri: 'track1' }
    ])

    const tracks = await Track.find({})
    const id = tracks[0]._id

    let response = await updateTrackPlaylistPosition(id, 100)
    expect(response.playlist_position).toBe(100)

    const track = await Track.find({})
    expect(track[0].playlist_position).toBe(100)
  })
})
describe('saveNewTrack', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.15'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('should save new track', async () => {
    const addedTrack = await saveNewTrack({ name: 'Track 1', external_urls: { spotify: 'track1' }, album: { name: 'Album 1', artist: { name: 'Artist 1' }, relatedArtist: { name: 'Related Artist 1' } } }, false)
    expect(addedTrack.name).toBe('Track 1')

    const tracks = await Track.find({})
    expect(tracks.length).toBe(1)
  })
})