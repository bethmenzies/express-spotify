const Track = require("../models/playlistTrack");
const { call_spotify } = require("./spotifyController")
const { remove_tracks } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");

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

const get_old_tracks = async (date) => {
  return new Promise(async (resolve) => {
    const allTracks = await Track.find({}, "uri album.release_date").exec();

    let oldTracks = allTracks.filter(track => {
      return track.album.release_date < date
    });
  
    for (let i = 0; i < oldTracks.length; i++) {
      await Track.findOneAndDelete({ uri: oldTracks[i].uri }).exec();
    }

    let oldTracksInPlaylist = oldTracks.filter(track => track.to_include)
    return resolve(oldTracksInPlaylist)
  });
}

const artist_tracks_by_album = async (albums, artistName) => {
  return new Promise(async (resolve) => {
    var tracks = []
    for (let i = 0; i < albums.length; i++) {
      let albumTracks = []
      let body = await get_tracks_by_album(albums[i].id, 1, 0)
      if (body === null) {
        return resolve(null)
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_tracks_by_album(albums[i].id, 50, j*50)
        albumTracks.push(...body.items)
      }

      for (let j = 0; j < albumTracks.length; j++) {
        let track = albumTracks[j]

        if (!track.artists.map(artist => artist.name.toLowerCase()).includes(artistName.toLowerCase())) {
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
    resolve(tracks)
  })
}

const tracks_by_album = async (albums) => { 
  return new Promise(async (resolve) => {
    var playlistPosition = 0
    var tracks = [];
    for (let i = 0; i < albums.length; i++) {
      var albumTracks = []
      let body = await get_tracks_by_album(albums[i].id, 1, 0)
      if (body === null) {
        return resolve(null)
      }
      let total = body.total
      let iterations = Math.floor(total/50)
      for (let j = 0; j <= iterations; j++) {
        let body = await get_tracks_by_album(albums[i].id, 50, j*50)
        albumTracks.push(...body.items)
      }

      for (let j = 0; j < albumTracks.length; j++) {
        let track = albumTracks[j];
        if (!track.artists.map(artist => artist.name.toLowerCase()).includes(albums[i].artist.name.toLowerCase())) {
          continue
        }

        const existingTrack = await Track.find({ uri: track.uri, 'album.artist.name': albums[i].artist.name }).exec();
        if (existingTrack.length === 0) {
          const new_track = new Track({
            name: track.name,
            spotify_id: track.id,
            uri: track.uri,
            url: track.external_urls.spotify,
            album: {
              name: albums[i].name,
              spotify_id: albums[i].id,
              release_date: albums[i].release_date,
              artist: {
                name: albums[i].artist.name,
                spotify_id: albums[i].artist.spotify_id
              }
            },
            track_number: track.track_number,
            playlist_position: playlistPosition,
            to_include: true
          });
          await new_track.save();
          tracks.push(new_track)
          playlistPosition++
        } else {
          if (existingTrack[0].to_include) {
            await Track.findByIdAndUpdate(existingTrack[0]._id, { playlist_position: playlistPosition}).exec();
            playlistPosition++
          }
          continue;
        }
      }
    }
    resolve(tracks);
  });
}

const track_list = asyncHandler(async (req, res, next) => {
  const totalTracks = await Track.countDocuments({}).exec();
  const numPlaylistTracks = await Track.countDocuments({ to_include: true }).exec()

  const allTracks = await Track.find({ to_include: true }, "name url album.artist.name album.name")
    .sort({ 'playlist_position': 1 })
    .exec();

  res.render("tracks", { 
      title: "Tracks",
      total_track_count: totalTracks,
      playlist_track_count: numPlaylistTracks,
      track_list: allTracks 
  });
});

const track_delete_get = asyncHandler(async (req, res, next) => {
  const track = await Track.findById(req.params.id).exec();

  if (track === null) {
    res.redirect("/tracks");
  }

  res.render("track_delete", {
    title: "Delete Track",
    track: track
  });
});

const track_delete_post = asyncHandler(async (req, res, next) => {
  let track = await Track.findById(req.body.trackid).exec();
  if (process.env.PLAYLIST_ID) {
    let isDeleted = await remove_tracks([track])
    if (isDeleted) {
      await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
      res.redirect("/tracks");
    } else {
      res.send("Something failed when deleting track. Please try again.")
    }
  } else {
    await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
    res.redirect("/tracks");
  }
});

module.exports = { tracks_by_album, get_old_tracks, track_list, track_delete_get, track_delete_post, artist_tracks_by_album }