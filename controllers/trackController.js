const Track = require("../models/playlistTrack");
const spotify_controller = require("./spotifyController")
const { remove_tracks } = require("../controllers/playlistController")
const asyncHandler = require("express-async-handler");

const get_tracks_by_album = async (albumId) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/albums/${albumId}/tracks`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options);
}

const get_old_tracks = async (date) => {
  return new Promise(async (resolve) => {
    const allTracks = await Track.find({}, "uri release_date").exec();

    let oldTracks = allTracks.filter(track => {
      return track.release_date < date
    });
  
    for (let track in oldTracks) {
      await Track.findOneAndDelete({ uri: track.uri }).exec();
    }
  
    return resolve(oldTracks)
  });
}

const tracks_by_album = async (albums) => { 
  return new Promise(async (resolve) => {
    var playlistPosition = 0
    var tracks = [];
    for (let i = 0; i < albums.length; i++) {
      let body = await get_tracks_by_album(albums[i].id);
      if (body === null) {
        return resolve(null);
      }

      for (let j = 0; j < body.items.length; j++) {
        let track = body.items[j];
        if (!track.artists.map(artist => artist.name.toLowerCase()).includes(albums[i].artist.name.toLowerCase())) {
          continue
        }

        const existingTrack = await Track.find({ uri: track.uri }).exec();
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
      await Track.findByIdAndUpdate(req.body.trackid, { to_include: false }).exec();
      res.redirect("/tracks");
    } else {
      res.send("Something failed when deleting track. Please try again.")
    }
  } else {
    await Track.findByIdAndUpdate(req.body.trackid, { to_include: false }).exec();
    res.redirect("/tracks");
  }
});

module.exports = { tracks_by_album, get_old_tracks, track_list, track_delete_get, track_delete_post }