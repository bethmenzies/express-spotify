import { ObjectId } from "mongoose"
import Track from '../../../src/services/db/models/track';
import { findTracksLteDate, deleteTracksLteDate, findTrackByUri, updateTrackPlaylistPosition, saveNewTrack } from '../../../src/services/db/tracks';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

const release2022 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    release_date: '2022-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2022',
  spotify_id: 'release2022',
  uri: 'release2022',
  watchlist: false 
}
const release2023 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    release_date: '2023-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2023',
  spotify_id: 'release2023',
  uri: 'release2023',
  watchlist: false 
}
const release2024 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    release_date: '2024-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2024',
  spotify_id: 'release2024',
  uri: 'release2024',
  watchlist: false 
}
const release2025 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    release_date: '2025-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2025',
  spotify_id: 'release2025',
  uri: 'release2025',
  watchlist: false 
}
const release2022Watchlist = {
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: true
    },
    name: 'Album 1',
    release_date: '2022-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2022 Watchlist',
  spotify_id: 'release2022Watchlist',
  uri: 'release2022Watchlist',
  watchlist: true 
}
const release2024Watchlist = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: true
    },
    name: 'Album 1',
    release_date: '2024-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2024 Watchlist',
  spotify_id: 'release2024Watchlist',
  uri: 'release2024Watchlist',
  watchlist: true 
}
const release2025Watchlist = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: true
    },
    name: 'Album 1',
    release_date: '2025-01-01',
    spotify_id: 'album1',
  },
  name: 'Release 2025 Watchlist',
  spotify_id: 'release2025Watchlist',
  uri: 'release2025Watchlist',
  watchlist: true 
}

const track1Artist1 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  spotify_id: 'track1',
  uri: 'track1',
  watchlist: false 
}
const track2Artist1 = { 
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 2',
  spotify_id: 'track2',
  uri: 'track2',
  watchlist: false 
}
const track1RelatedArtist1 = { 
  album: {
    artist: {
      name: 'Related Artist 1',
      spotify_id: 'relatedArtist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  spotify_id: 'track1',
  uri: 'track1',
  watchlist: false  
}
const track1Artist1Watchlist = {
  album: {
    artist: {
      name: 'Artist 1',
      spotify_id: 'artist1',
      watchlist: false
    },
    name: 'Album 1',
    spotify_id: 'album1',
  },
  name: 'Track 1',
  spotify_id: 'track1',
  uri: 'track1',
  watchlist: true 
}

const playlistPosition0 = { 
  album: {
    artist: {
      name: 'playlistPosition0',
      spotify_id: 'playlistPosition0',
      watchlist: false
    },
    name: 'playlistPosition0',
    spotify_id: 'playlistPosition0',
  },
  name: 'playlistPosition0',
  playlist_position: 0,
  spotify_id: 'playlistPosition0',
  uri: 'playlistPosition0',
  watchlist: false 
}
const playlistPosition1 = { 
  album: {
    artist: {
      name: 'playlistPosition1',
      spotify_id: 'playlistPosition1',
      watchlist: false
    },
    name: 'playlistPosition1',
    spotify_id: 'playlistPosition1',
  },
  name: 'playlistPosition1',
  playlist_position: 1,
  spotify_id: 'playlistPosition1',
  uri: 'playlistPosition1',
  watchlist: false 
}
const playlistPosition100 = {
  album: {
    artist: {
      name: 'playlistPosition100',
      spotify_id: 'playlistPosition100',
      watchlist: false
    },
    name: 'playlistPosition100',
    spotify_id: 'playlistPosition100',
  },
  name: 'playlistPosition100',
  playlist_position: 100,
  spotify_id: 'playlistPosition100',
  uri: 'playlistPosition100',
  watchlist: false 
}
const noPlaylistPosition = {
  album: {
    artist: {
      name: 'noPlaylistPosition',
      spotify_id: 'noPlaylistPosition',
      watchlist: false
    },
    name: 'noPlaylistPosition',
    spotify_id: 'noPlaylistPosition',
  },
  name: 'noPlaylistPosition',
  spotify_id: 'noPlaylistPosition',
  uri: 'noPlaylistPosition',
  watchlist: false
}

describe('findTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('returns old tracks', async () => {
    await Track.insertMany([release2022, release2023, release2024]);

    const tracks = await findTracksLteDate('2022-12-31', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('release2022')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
  })
  it('returns old tracks including same day', async () => {
    await Track.insertMany([release2022, release2023, release2024]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(2)
    expect(tracks[0].uri).toBe('release2022')
    expect(tracks[0].album.release_date).toBe('2022-01-01')
    expect(tracks[1].uri).toBe('release2023')
    expect(tracks[1].album.release_date).toBe('2023-01-01')
  })
  it('returns no old tracks', async () => {
    await Track.insertMany([release2024, release2025]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('returns old tracks only for the specified watchlist', async () => {
    await Track.insertMany([release2022, release2022Watchlist]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(1)
    expect(tracks[0].uri).toBe('release2022')
  })
  it('should return an empty array when there are no tracks', async () => {
    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([release2022Watchlist, release2022Watchlist]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
  it('should return an empty array when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([release2024Watchlist, release2025Watchlist]);

    const tracks = await findTracksLteDate('2023-01-01', false, "uri album.release_date to_include watchlist");
    expect(tracks.length).toBe(0)
  })
})
describe('deleteTracksLteDate', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('deletes tracks by date', async () => {
    await Track.insertMany([release2022, release2023, release2024]);

    await deleteTracksLteDate('2022-12-31', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('release2023')
    expect(remainingTracks[1].uri).toBe('release2024')
  })
  it('deletes tracks by date including same day', async () => {
    await Track.insertMany([release2022, release2023, release2024]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('release2024')
  })
  it('deletes no tracks by date', async () => {
    await Track.insertMany([release2024, release2025]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
    expect(remainingTracks[0].uri).toBe('release2024')
    expect(remainingTracks[1].uri).toBe('release2025')
  })
  it('deletes tracks only for the specified watchlist', async () => {
    await Track.insertMany([release2022, release2022Watchlist]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(1)
    expect(remainingTracks[0].uri).toBe('release2022Watchlist')
  })
  it('should not delete any tracks when there are no tracks', async () => {
    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist', async () => {
    await Track.insertMany([release2022Watchlist, release2022Watchlist]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should not delete any tracks when there are no tracks for the specified watchlist and date', async () => {
    await Track.insertMany([release2024Watchlist, release2025Watchlist]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(2)
  })
  it('should delete all tracks when all tracks are old', async () => {
    await Track.insertMany([release2022, release2022, release2022]);

    await deleteTracksLteDate('2023-01-01', false);
    const remainingTracks = await Track.find({}).exec();
    expect(remainingTracks.length).toBe(0)
  })
})
describe('findTrackByUri', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('finds track', async () => {
    await Track.insertMany([track1Artist1, track2Artist1])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].uri).toBe('track1')
  })
  it('should not find track if no tracks', async () => {
    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should not find track if no matching uri', async () => {
    await Track.insertMany([track1Artist1])

    const track = await findTrackByUri('track2', 'Artist 1', false)
    
    expect(track.length).toBe(0)
  })
  it('should not find track if no matching artist', async () => {
    await Track.insertMany([track1RelatedArtist1])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should not find track if not in watchlist', async () => {
    await Track.insertMany([track1Artist1Watchlist])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(0)
  })
  it('should only return the track with the matching artist', async () => {
    await Track.insertMany([track1Artist1, track1RelatedArtist1])

    const track = await findTrackByUri('track1', 'Related Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].album.artist.name).toBe('Related Artist 1')
  })
  it('should only return the track with the matching watchlist', async () => {
    await Track.insertMany([track1Artist1Watchlist, track1Artist1])

    const track = await findTrackByUri('track1', 'Artist 1', false)

    expect(track.length).toBe(1)
    expect(track[0].watchlist).toBe(false)
  })
})
describe('updateTrackPlaylistPosition', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('updates playlist_position', async () => {
    await Track.insertMany([playlistPosition0])

    const tracks = await Track.find({})
    const id: mongoose.Types.ObjectId = tracks[0]._id

    let response = await updateTrackPlaylistPosition(id, 1)
    expect(response.playlist_position).toBe(1)

    const track = await Track.find({ _id: id })
    expect(track[0].playlist_position).toBe(1)
  })
  it('updates only playlist_position for track with _id', async () => {
    await Track.insertMany([playlistPosition0, playlistPosition100])

    const tracks = await Track.find({})
    const idToUpdate: mongoose.Types.ObjectId = tracks[0]._id
    const id: mongoose.Types.ObjectId = tracks[1]._id

    let response = await updateTrackPlaylistPosition(idToUpdate, 1)
    expect(response.playlist_position).toBe(1)

    const updatedTrack = await Track.find({ _id: idToUpdate })
    expect(updatedTrack[0].playlist_position).toBe(1)

    const track = await Track.find({ _id: id })
    expect(track[0].playlist_position).toBe(100)
  })
  it('does not update playlist_position if cannot find id', async () => {
    await Track.insertMany([playlistPosition0, playlistPosition1])

    const tracks = await Track.find({})
    const id: mongoose.Types.ObjectId = tracks[0]._id

    await Track.deleteMany({_id: id})

    let response = await updateTrackPlaylistPosition(id, 2)
    expect(response).toBe(null)

    const track = await Track.find({})
    expect(track[0].playlist_position).toBe(1)
  })
  it('adds playlist_position if playlist_position not there', async () => {
    await Track.insertMany([noPlaylistPosition])

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
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { runtimeAdapters: { os: require('os') } });
  });
  beforeEach(async () => {
    await Track.deleteMany({}).exec();
  })
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it('should save new track', async () => {
    const newTrack = { 
      name: 'Track 1',
      id: 'track1',
      uri: 'track1',
      track_number: 1,
      external_urls: { spotify: 'track1' },
      album: {
        name: 'Album 1',
        id: 'album1',
        release_date: '2022-01-01',
        artist: {
          name: 'Artist 1',
          spotify_id: 'artist1',
          watchlist: false
        },
        relatedArtist: {
          name: 'Related Artist 1',
          spotify_id: 'relatedArtist1'
        }
      }
    }
    const addedTrack = await saveNewTrack(newTrack, false)
    expect(addedTrack.name).toBe('Track 1')

    const tracks = await Track.find({})
    expect(tracks.length).toBe(1)
  })
})