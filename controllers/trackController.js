const Track = require("../models/playlistTrack");
const spotify_controller = require("./spotifyController")

const get_tracks_by_album = async (albumId) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options);
}

const get_old_tracks = async (date) => {
  return new Promise(async (resolve) => {
    const allTracks = await Track.find({}, "uri release_date").exec();

    let oldTracks = allTracks.filter(track => {
      return track.release_date < date
    });
  
    for (let track in oldTracks) {
      await Track.findOneAndDelete({ uri: track.uri }).exec();
    }
  
    return resolve(oldTracks)
  });
}

const tracks_by_album = async (albums) => { 
  return new Promise(async (resolve) => {
    var playlistPosition = 0
    var tracks = [];
    for (let i = 0; i < albums.length; i++) {
      let body = await get_tracks_by_album(albums[i].id);
      if (body === null) {
        return resolve(null);
      }

      for (let j = 0; j < body.items.length; j++) {
        let track = body.items[j];
        if (!track.artists.map(artist => artist.name).includes(albums[i].artist.name)) {
          continue
        }

        const existingTrack = await Track.find({ uri: track.uri }).exec();
        if (existingTrack.length === 0) {
          const new_track = new Track({
            name: track.name,
            spotify_id: track.id,
            uri: track.uri,
            album: {
              name: albums[i].name,
              spotify_id: albums[i].id,
              release_date: albums[i].release_date,
              artist: {
                name: albums[i].artist.name,
                spotify_id: albums[i].artist.spotify_id
              }
            },
            track_number: track.track_number,
            playlist_position: playlistPosition,
            to_include: true
          });
          await new_track.save();
          tracks.push(new_track)
          playlistPosition++
        } else {
          await Track.findByIdAndUpdate(existingTrack[0]._id, { playlist_position: playlistPosition}).exec();
          playlistPosition++
          continue;
        }
      }
    }
    resolve(tracks);
  });
}

module.exports = { tracks_by_album, get_old_tracks }