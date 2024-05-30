const Album = require("../models/album");
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

exports.tracks_by_album = async () => {
  const albums = await Album.find({}).populate("artist").exec()

  for (let i = 0; i < albums.length; i++) {
    let body = await get_tracks_by_album(albums[i].spotify_id);
    for (let j = 0; j < body.items.length; j++) {
      let track = body.items[j];
      const existingTrack = await Track.find({ uri: track.uri })
      if (existingTrack.length > 0) {
        const new_track = new Track({
          name: track.name,
          spotify_id: track.id,
          uri: track.uri,
          album: {
            name: albums[i].name,
            spotify_id: albums[i].spotify_id,
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
            spotify_id: albums[i].spotify_id,
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
}