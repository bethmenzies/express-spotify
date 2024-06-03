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

const tracks_by_album = async (albums) => {
  // TODO: ignore when track artist does not include artist  
  return new Promise(async (resolve) => {
    for (let i = 0; i < albums.length; i++) {
      let body = await get_tracks_by_album(albums[i].id);
      if (body === null) {
        return resolve(false);
      }

      for (let j = 0; j < body.items.length; j++) {
        let track = body.items[j];
        if (!track.artists.map(artist => artist.name).includes(albums[i].artist.name)) {
          continue
        }
        const existingTrack = await Track.find({ uri: track.uri })
        if (existingTrack.length > 0) {
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
            to_include: existingTrack.to_include,
            _id: existingTrack._id
          });
          await Track.findByIdAndUpdate(existingTrack._id, new_track, {})
        } else {
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
            to_include: true
          });
          await new_track.save();
        }
      }
    }
    resolve(true);
  });
}

module.exports = tracks_by_album