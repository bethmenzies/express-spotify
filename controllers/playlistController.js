const Track = require("../models/playlistTrack");
const spotify_controller = require("./spotifyController")

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
}

const create_playlist = async () => {
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

const remove_tracks = async (tracks) => {
  return new Promise(async (resolve) => {
    var uriObjects = []
    for (let i = 0; i < tracks.length; i++) {
      const uriObject = {
        uri: tracks[i].uri
      }
      uriObjects.push(uriObject)
    }
    const allBodies = chunkArray(uriObjects, 100)

    for (let i = 0; i < allBodies.length; i++) {
      const body = JSON.stringify({
        "tracks": uriObjects
      })

      const options = {
        hostname: 'api.spotify.com',
        path: `/v1/playlists/${process.env.PLAYLIST_ID}/tracks`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
            "Transfer-Encoding": "chunked"
        },
        json: true
      }

      let response = await spotify_controller.call_spotify(options, body);
      if (response === null) {
        return resolve(false)
      } else {
        return resolve(true)
      }
    }
  })
}

const add_tracks_from_db = async (playlistId) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    allTracks = await Track.find({}, 'playlist_position uri to_include album.release_date album.artist.name').exec();
    const allUris = allTracks.filter(track => track.to_include).map(track => track.uri)
    const allBodies = chunkArray(allUris, 100)

    for (let i = 0; i < allBodies.length; i++) {
      const body = JSON.stringify({
        "uris" : allBodies[i]
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result === null) {
        allSuccess = false
      }
    }
    return resolve(allSuccess)
  })
}

const add_tracks = async (playlistId, tracks) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    for (let i = 0; i < tracks.length; i++) {
      const body = JSON.stringify({
        "uris" : [tracks[i].uri],
        "position": tracks[i].playlist_position
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result === null) {
        allSuccess = false
      }
    }
    return resolve(allSuccess)
  })
}

const call_add_tracks_to_playlist = async (playlistId, body) => {
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

module.exports = { add_tracks, add_tracks_from_db, remove_tracks, create_playlist }