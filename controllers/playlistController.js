const Track = require("../models/playlistTrack");
const spotify_controller = require("./spotifyController")

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
}

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
  const trackUris = await Track.find({}, 'track_number uri to_include album.release_date album.artist.name').exec();
  orderedTracks = trackUris
  .sort((a,b) => a.track_number - b.track_number)
  .sort((a,b) => (a.album.release_date > b.album.release_date) ? 1 : ((b.album.release_date > a.album.release_date) ? -1 : 0))
  .sort((a,b) => (a.album.artist.name > b.album.artist.name) ? 1 : ((b.album.artist.name > a.album.artist.name) ? -1 : 0))

  const allUris = orderedTracks.filter(track => track.to_include).map(track => track.uri)
  const allBodies = chunkArray(allUris, 100)

  for (let i = 0; i < allBodies.length; i++) {
    const body = JSON.stringify({
      "uris" : allBodies[i]
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

    await spotify_controller.call_spotify(options, body);
  }
}