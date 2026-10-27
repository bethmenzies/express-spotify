var https = require('https');

const call_spotify = async (options, body) => {
  return new Promise((resolve) => {
    const request = https.request(options, function(response) {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        try {
          parsedBody = JSON.parse(responseBody + '');
          return resolve(parsedBody);
        } catch (e) {
          console.error(e)
          return responseBody
        }
      });
    });
  
    request.on('error', err => {
      console.error(err)
    });

    if (body !== undefined) {
      request.write(body);
    }
    request.end();
  });
};

const call_add_tracks_to_playlist = async (playlistId, body) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/playlists/${playlistId}/items`,
    method: 'POST',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options, body);
}

const get_spotify_id_for_artist = async (artistName) => {
  let path = `/v1/search?q=${artistName}&type=artist`;
  let escapedPath = encodeURI(path);
  
  const options = {
    hostname: 'api.spotify.com',
    path: escapedPath,
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  };

  return await call_spotify(options);
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

const get_albums_by_artist = async (artistId, limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/artists/${artistId}/albums?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

const get_tracks_by_album = async (albumId, limit, offset) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks?limit=${limit}&offset=${offset}`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await call_spotify(options);
}

module.exports = { call_add_tracks_to_playlist, get_spotify_id_for_artist, get_playlists, create_playlist, remove_tracks, get_albums_by_artist }