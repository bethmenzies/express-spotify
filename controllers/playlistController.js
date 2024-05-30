const Track = require("../models/track");
const spotify_controller = require("./spotifyController")

exports.create_playlist = async () => {
  const body = JSON.stringify({
    'name' : `Latest Releases - ${Date.now()}`
  });

  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/users/${process.env.USER_ID}/playlists`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options, body);
}

exports.add_tracks = async (playlistId) => {
  const trackUris = await Track.find({}, 'uri track_number').populate({ path: "album", populate: { path: "artist", model: "Artist"}}).exec();
  orderedTracks = trackUris
  .sort((a,b) => a.track_number - b.track_number)
  .sort((a,b) => (a.album.release_date < b.album.release_date) ? 1 : ((b.album.release_date < a.album.release_date) ? -1 : 0))
  .sort((a,b) => (a.album.artist.name > b.album.artist.name) ? 1 : ((b.album.artist.name > a.album.artist.name) ? -1 : 0))

  const body = JSON.stringify({
    "uris" : trackUris.map(track => track.uri)
  })
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/playlists/${playlistId}/tracks`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options, body);
}