const Track = require("../models/track");
const { call_add_tracks_to_playlist, get_playlists } = require('../services/spotifyService')

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
}

const find_playlist = async (playlistName) => {
  let playlists = []
  var error = ""
  let body = await get_playlists(1, 0)
  if (body.error) {
    error = body
    return null
  }
  let total = body.total
  let iterations = Math.floor(total/50)
  for (let i = 0; i <= iterations; i++) {
    let body = await get_playlists(50, i*50)
    if (body.error) {
      error = body
      break
    }
    playlists.push(...body.items)
  }
  let matchingPlaylist = playlists.filter(playlist => playlist.name.toLowerCase() === playlistName.toLowerCase())
  if (matchingPlaylist.length === 0) {
    return null
  } else {
    return matchingPlaylist[0].id
  }
}

const add_tracks_to_artist_playlists = async (tracks) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    var error = ""
    let tracksGroupedByArtist = Object.values(
      tracks.reduce((acc, current) => {
          acc[current.album.artist.name] = acc[current.album.artist.name] ?? [];
          acc[current.album.artist.name].push(current);
          return acc;
      }, {})
    );
    for (let i = 0; i < tracksGroupedByArtist.length; i++) {
      if (error.error) {
        break
      }
      let artist = tracksGroupedByArtist[i][0].album.artist.name
      let playlistId = await find_playlist(artist)
      if (playlistId === null) {
        continue
      }
      let playlist = await add_tracks_no_playlist_position(playlistId, tracksGroupedByArtist[i])
      if (playlist.error) {
        allSuccess = false
        error = playlist
        break
      }
    }
    return resolve({allSuccess: allSuccess, error: error})
  })
}

const add_included_tracks = async (playlistId, tracks) => {
  // TODO: add to the right place in the playlist
  return new Promise(async (resolve) => {
    let allSuccess = true
    var error = ""
    const allUris = tracks.filter(track => track.to_include).map(track => track.uri)
    const allBodies = chunkArray(allUris, 100)

    for (let i = 0; i < allBodies.length; i++) {
      if (error.error) {
        break
      }
      const body = JSON.stringify({
        "uris": allBodies[i]
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result.error) {
        allSuccess = false
        error = result
        break
      }
    }
    return resolve({allSuccess: allSuccess, error: error})
  })
}

const add_tracks_no_playlist_position = async (playlistId, tracks) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    var error = ""
    const allUris = tracks.map(track => track.uri)
    const allBodies = chunkArray(allUris, 100)

    for (let i = 0; i < allBodies.length; i++) {
      if (error.error) {
        break
      }
      const body = JSON.stringify({
        "uris": allBodies[i]
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result.error) {
        allSuccess = false
        error = result
        break
      }
    }
    return resolve({allSuccess: allSuccess, error: error})
  })
}

const add_tracks_from_db = async (playlistId, watchlist) => {
  return new Promise(async (resolve) => {
    let allSuccess = true
    var error = ""
    allTracks = await Track.find({ watchlist: watchlist }, 'playlist_position uri to_include album.release_date album.artist.name')
      .sort({ 'playlist_position': 1 })
      .exec();
    const allUris = allTracks.filter(track => track.to_include).map(track => track.uri)
    const allBodies = chunkArray(allUris, 100)

    for (let i = 0; i < allBodies.length; i++) {
      if (error.error) {
        break
      }
      const body = JSON.stringify({
        "uris" : allBodies[i]
      })

      let result = await call_add_tracks_to_playlist(playlistId, body)
      if (result.error) {
        allSuccess = false
        error = result
        break
      }
    }
    return resolve({allSuccess: allSuccess, error: error})
  })
}

const addTracksToPlaylist = async (playlistId, tracks) => {
  for (const track of tracks) {
    const body = JSON.stringify({
      "uris" : [track.uri],
      "position": track.playlist_position
    })

    let result = await call_add_tracks_to_playlist(playlistId, body)
    if (result.error) {
      return result
    }
  }
  return { success: true }
}

module.exports = { add_tracks_from_db, add_tracks_no_playlist_position, add_tracks_to_artist_playlists, add_included_tracks, addTracksToPlaylist }