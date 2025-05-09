const Track = require("../models/playlistTrack");
const { call_spotify } = require("./spotifyController")

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
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

const find_playlist = async (playlistName) => {
  let playlists = []
  let body = await get_playlists(1, 0)
  let total = body.total
  let iterations = Math.floor(total/50)
  for (let i = 0; i <= iterations; i++) {
    let body = await get_playlists(50, i*50)
    playlists.push(...body.items)
  }
  let matchingPlaylist = playlists.filter(playlist => playlist.name === playlistName)
  if (matchingPlaylist.length === 0) {
    return null
  } else {
    return matchingPlaylist[0].id
  }
}

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
    path: `/v1/users/${process.env.USER_ID}/playlists`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options, body);
}

const remove_tracks = async (tracks, playlistId) => {
  return new Promise(async (resolve) => {
    var uriObjects = []
    var allResponses = true
    for (let i = 0; i < tracks.length; i++) {
      const uriObject = {
        uri: tracks[i].uri
      }
      uriObjects.push(uriObject)
    }
    const allBodies = chunkArray(uriObjects, 100)

    for (let i = 0; i < allBodies.length; i++) {
      const body = JSON.stringify({
        "tracks": allBodies[i]
      })

      const options = {
        hostname: 'api.spotify.com',
        path: `/v1/playlists/${playlistId}/tracks`,
        method: 'DELETE',
        headers: {
            Authorization: 'Bearer ' + process.env.ACCESS_TOKEN,
            "Transfer-Encoding": "chunked"
        },
        json: true
      }

      let response = await call_spotify(options, body);
      if (response === null) {
        allResponses = false
      }
    }
    return resolve(allResponses)
  })
}

const add_tracks_to_artist_playlists = async (tracks) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    let tracksGroupedByArtist = Object.values(
      tracks.reduce((acc, current) => {
          acc[current.album.artist.name] = acc[current.album.artist.name] ?? [];
          acc[current.album.artist.name].push(current);
          return acc;
      }, {})
    );
    for (let i = 0; i < tracksGroupedByArtist.length; i++) {
      let artist = tracksGroupedByArtist[i][0].album.artist.name
      let playlistId = await find_playlist(artist)
      if (playlistId === null) {
        continue
      }
      let playlist = await add_tracks_no_playlist_position(playlistId, tracksGroupedByArtist[i])
      if (!playlist) {
        allSuccess = false
      }
    }
    return resolve(allSuccess)
  })
}

const add_tracks_no_playlist_position = async (playlistId, tracks) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    const allUris = tracks.map(track => track.uri)
    const allBodies = chunkArray(allUris, 100)

    for (let i = 0; i < allBodies.length; i++) {
      const body = JSON.stringify({
        "uris": allBodies[i]
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result === null) {
        allSuccess = false
      }
    }
    return resolve(allSuccess)
  })
}

const add_tracks_from_db = async (playlistId) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    allTracks = await Track.find({}, 'playlist_position uri to_include album.release_date album.artist.name')
      .sort({ 'playlist_position': 1 })
      .exec();
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
  await call_spotify(options, body);
}

module.exports = { add_tracks, add_tracks_from_db, remove_tracks, create_playlist, add_tracks_no_playlist_position, add_tracks_to_artist_playlists }