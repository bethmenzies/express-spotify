const Track = require("../services/db/models/track");
const asyncHandler = require("express-async-handler");
const { get_tracks_by_album } = require('../services/spotify/track');
const { removeTracksFromPlaylist } = require("../services/trackService");

const artist_tracks_by_album = async (albums, artistNames) => {
  return new Promise(async (resolve) => {
    var tracks = []
    var error = ""
    for (let i = 0; i < albums.length; i++) {
      if (error.error) {
        break
      }
      let albumTracks = []
      let body = await get_tracks_by_album(albums[i].id, 1, 0)
      if (body.error) {
        error = body
        break
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_tracks_by_album(albums[i].id, 50, j*50)
        if (body.error) {
          error = body
          break
        }
        albumTracks.push(...body.items)
      }

      for (let j = 0; j < albumTracks.length; j++) {
        let track = albumTracks[j]

        if (!artistNames.some(el => track.artists.map(artist => artist.name.toLowerCase()).includes(el.toLowerCase()))) {
          continue
        }

        let priority = 0
        if (albums[i].album_type === "album") {
          priority++
        }
        if (albums[i].album_type == "single") {
          priority--
        }
        if (albums[i].name.toLowerCase().includes("deluxe edition") || albums[i].name.toLowerCase().includes("special edition") || albums[i].name.toLowerCase().includes("extended version") || albums[i].name.toLowerCase().includes("deluxe")) {
          priority++
        }
        if (albums[i].name.toLowerCase().includes("greatest hits")) {
          priority--
        }
        if (albums[i].name.toLowerCase().includes("live in") || albums[i].name.toLowerCase().includes("live at") || albums[i].name.toLowerCase().includes("live from")) {
          priority--
        }
        if (albums[i].name.toLowerCase().includes("anniversary")) {
          priority--
        }
        if (albums[i].name.toLowerCase().includes("reimagined") || albums[i].name.toLowerCase().includes("reworked")) {
          priority--
        }
        track.priority = priority

        let existingTrackIndex = tracks.findIndex(existingTrack => {
          return existingTrack.name.toLowerCase() === track.name.toLowerCase() &&
          existingTrack.artists.length === track.artists.length &&
          existingTrack.artists[0].name === track.artists[0].name &&
          existingTrack.duration_ms === track.duration_ms
        })

        if (existingTrackIndex < 0) {
          tracks.push(track)
        } else if (tracks[existingTrackIndex].priority <= track.priority) {
          tracks.splice(existingTrackIndex, 1)
          tracks.push(track)
        }
      }
    }
    resolve({tracks: tracks, error: error})
  })
}

const recentTracks = async (albums) => { 
  var tracks = [];
  var error = ""

  for (const album of albums) {
    if (error.error) {
      break
    }
    const tracksResponse = await getAlbumTracks(album)
    error = tracksResponse.error
    const filteredTracks = filterTracks(tracksResponse.tracks, album)
    const tracksWithAlbumArtists = setAlbumOnTracks(filteredTracks, album)
    tracks.push(...tracksWithAlbumArtists)
  }
  return { tracks: tracks, error: error }
}

const getAlbumTracks = async (album) => {
  return new Promise(async (resolve) => {
    var tracks = []
    let body = await get_tracks_by_album(album.id, 1, 0)
    if (body.error) {
      resolve({ tracks: tracks, error: body })
    }
    let total = body.total
    let iterations = Math.floor(total/50)
    for (let j = 0; j <= iterations; j++) {
      let body = await get_tracks_by_album(album.id, 50, j*50)
      if (body.error) {
        resolve({ tracks: tracks, error: body })
        break
      }
      tracks.push(...body.items)
    }
    resolve({ tracks: tracks, error: ""})
  })
}

const filterTracks = (tracks, album) => {
  return tracks.filter((track) => isTrackArtist(track, album))
}

const isTrackArtist = (track, album) => {
  return track.artists.map(artist => artist.name.toLowerCase()).includes(album.artist.name.toLowerCase()) ||
    track.artists.map(relatedArtist => relatedArtist.name.toLowerCase()).includes(album.relatedArtist.name.toLowerCase())
}

const setAlbumOnTracks = (tracks, album) => {
  return tracks.map(track => { track.album = album; return track; })
}

const track_list = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  const totalTracks = await Track.countDocuments({ watchlist: watchlist }).exec();
  const numPlaylistTracks = await Track.countDocuments({ to_include: true, watchlist: watchlist }).exec()

  const allTracks = await Track.find({ to_include: true, watchlist: watchlist }, "name url album.artist.name album.name playlist_position")
    .sort({ 'playlist_position': 1 })
    .exec();

  res.render("tracks", { 
      title: "Tracks",
      total_track_count: totalTracks,
      playlist_track_count: numPlaylistTracks,
      track_list: allTracks,
      watchlist: watchlist
  });
});

const track_delete_get = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  const track = await Track.findById(req.params.id).exec();

  if (track === null) {
    res.redirect("/tracks?watchlist=" + watchlist);
  }

  res.render("track_delete", {
    title: "Delete Track",
    track: track,
    watchlist: watchlist
  });
});

const track_delete_post = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let track = await Track.findById(req.body.trackid).exec();
  let playlistId
  if (watchlist === 'true') {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID
  } else {
    playlistId = process.env.PLAYLIST_ID
  }
  if (playlistId) {
    let isDeleted = await removeTracksFromPlaylist([track], playlistId)
    if (isDeleted.allResponses) {
      await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
      res.redirect("/tracks?watchlist=" + watchlist);
    } else {
      res.render("error", {
        title: "Error!",
        error: `Something failed when deleting track. Please try to delete ${track.name} again.`,
        errorStatus: isDeleted.error.error.status,
        errorMessage: isDeleted.error.error.message,
      });
    }
  } else {
    await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
    res.redirect("/tracks?watchlist=" + watchlist);
  }
});

module.exports = { recentTracks, getAlbumTracks, isTrackArtist, filterTracks, setAlbumOnTracks, track_list, track_delete_get, track_delete_post, artist_tracks_by_album }