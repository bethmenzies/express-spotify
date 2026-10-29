const { SPOTIFY_URI_LIMIT } = require('../utils/constants')
const Track = require("../services/db/models/track");
const { call_add_tracks_to_playlist, get_playlists } = require('../services/spotify/playlist')

const chunkArray = (array, chunkSize) => {
  const numberOfChunks = Math.ceil(array.length / chunkSize)

  return [...Array(numberOfChunks)]
    .map((value, index) => {
      return array.slice(index * chunkSize, (index + 1) * chunkSize)
    })
}

const getAllPlaylists = async () => {
  return new Promise(async (resolve) => {
    let playlists = []
    let body = await get_playlists(1, 0)
    if (body.error) {
      resolve({ playlists: playlists, error: body })
    }
    let total = body.total
    let iterations = Math.floor(total/50)
    for (let i = 0; i <= iterations; i++) {
      let body = await get_playlists(50, i*50)
      if (body.error) {
        resolve({ playlists: playlists, error: body})
        break
      }
      playlists.push(...body.items)
    }
    return resolve({ playlists: playlists, error: ""})
  })
}

const findPlaylist = (playlistName, playlists) => {
  return playlists.find((playlist) => playlist.name.toLowerCase() === playlistName.toLowerCase())
}

const addTracksOneByOneToPlaylist = async (playlistId, tracks) => {
  for (const track of tracks) {
    let result = await call_add_tracks_to_playlist(playlistId, [track.uri], track.playlist_position)
    if (result.error) {
      return result
    }
  }
  return { success: true }
}

const addAllTracksToPlaylist = async (playlistId, tracks) => {
  const trackUris = tracks.map(track => track.uri)
  const urisWithLimit = chunkArray(trackUris, SPOTIFY_URI_LIMIT)

  for (const uris of urisWithLimit) {
    let result = await call_add_tracks_to_playlist(playlistId, uris)
    if (result.error) {
      return result
    }
  }
  return { success: true }
}

const addTracksToArtistPlaylists = async (tracks) => {
  let tracksGroupedByArtist = tracks.reduce((acc, current) => {
    acc[current.album.artist.name] = acc[current.album.artist.name] ?? [];
    acc[current.album.artist.name].push(current);
    return acc;
  }, {})

  const playlistsResponse = await getAllPlaylists()
  if (playlistsResponse.error.error) {
    return playlistsResponse.error
  }

  for (const artist in tracksGroupedByArtist) {
    let playlist = await findPlaylist(artist, playlistsResponse.playlists)
    if (playlist === undefined) {
      continue
    }
    let result = await addAllTracksToPlaylist(playlist.id, tracksGroupedByArtist[artist])
    if (result.error) {
      return result 
    }
  }
  return { success: true }
}

module.exports = { addTracksOneByOneToPlaylist, addAllTracksToPlaylist, addTracksToArtistPlaylists, getAllPlaylists, findPlaylist }