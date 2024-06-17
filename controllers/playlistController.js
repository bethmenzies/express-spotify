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

exports.remove_old_tracks = async (tracks) => {
  const allUris = tracks.map(track => track.uri)
  const allBodies = chunkArray(allUris, 100)

  for (let i = 0; i < allBodies.length; i++) {
    const body = JSON.stringify({
      "uris" : allBodies[i]
    })

    const options = {
      hostname: 'api.spotify.com',
      path: `/v1/playlists/${playlistId}/tracks`,
      method: 'DELETE',
      headers: {
          Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
      },
      json: true
    }

    await spotify_controller.call_spotify(options, body);
  }


}

exports.add_tracks = async (playlistId, tracks) => {
  let allTracks;
  if (tracks !== undefined) {
    allTracks = tracks;
  } else {
    allTracks = await Track.find({}, 'playlist_position uri to_include album.release_date album.artist.name').exec();
  }

  for (let i = 0; i < allTracks.length; i++) {
    const body = JSON.stringify({
      "uris" : [allTracks[i].uri],
      "position": allTracks[i].playlist_position
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