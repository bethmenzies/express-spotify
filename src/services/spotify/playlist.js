const { call_spotify } = require('./common')

const create_playlist = async (playlistName) => {
  let playlist
  if (playlistName !== undefined) {
    playlist = playlistName
  } else {
    playlist = "Latest Releases"
  }
  const body = JSON.stringify({
    'name' : `${playlist} - ${Date.now()}`
  });

  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/me/playlists`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options, body);
}

const get_playlists = async (limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/me/playlists?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

const call_add_tracks_to_playlist = async (playlistId, uris, playlistPosition) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/playlists/${playlistId}/items`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  const body = JSON.stringify({
    "uris": uris,
    "position": playlistPosition
  })
  return await call_spotify(options, body);
}

const remove_tracks = async (tracks, playlistId) => {
  return new Promise(async (resolve) => {
    var uriObjects = []
    var allResponses = true
    var error = ""
    for (let i = 0; i < tracks.length; i++) {
      const uriObject = {
        uri: tracks[i].uri
      }
      uriObjects.push(uriObject)
    }
    const allBodies = chunkArray(uriObjects, 100)

    for (let i = 0; i < allBodies.length; i++) {
      if (error.error) {
        break
      }
      const body = JSON.stringify({
        "items": allBodies[i]
      })

      const options = {
        hostname: 'api.spotify.com',
        path: `/v1/playlists/${playlistId}/items`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
            "Transfer-Encoding": "chunked"
        },
        json: true
      }

      let response = await call_spotify(options, body);
      if (response.error) {
        allResponses = false
        error = response
        break
      }
    }
    return resolve({allResponses: allResponses, error: error})
  })
}

module.exports = { call_add_tracks_to_playlist, get_playlists, create_playlist, remove_tracks }