import Track from "../services/db/models/track.ts"
import asyncHandler from "express-async-handler"
import { get_tracks_by_album } from '../services/spotify/track.ts'
import { removeTracksFromPlaylist } from "../services/trackService.ts"
import { increasePriority, decreasePriority, SPOTIFY_LIMIT } from "../utils/constants.ts"
import { getAllTracks, getNumberOfTracksInDB, getNumberOfTracksToInclude } from "../services/db/tracks.ts"
import { AlbumsTracksError, PlaylistTracksError } from "../errors.ts"

export const artistTracksByAlbum = async (albums: any[], artistNames: string[]): Promise<any[]> => {
  let tracks: any[] = []
  try {
    for (const album of albums) {
      const tracksResponse = await getAlbumTracks(album)

      for (const track of tracksResponse) {
        if (!artistNames.some(el => track.artists.map((artist: any) => artist.name.toLowerCase()).includes(el.toLowerCase()))) {
          continue
        }

        let priority = 0
        if (album.album_type === "album") {
          priority++
        }
        if (album.album_type == "single") {
          priority--
        }
        if (increasePriority.some(str => album.name.toLowerCase().includes(str))) {
          priority++
        }
        if (decreasePriority.some(str => album.name.toLowerCase().includes(str))) {
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
  } catch (error) {
    console.error(error)
    throw error
  }
  return tracks
}

export const getRecentTracks = async (albums: any[]): Promise<any[]> => { 
  var recentTracks: any[] = [];

  try {
    for (const album of albums) {
      const tracksResponse = await getAlbumTracks(album)
      const filteredTracks = filterTracks(tracksResponse, album)
      const tracksWithAlbumArtists = setAlbumOnTracks(filteredTracks, album)
      recentTracks.push(...tracksWithAlbumArtists)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
  return recentTracks
}

export const getAlbumTracks = async (album: any): Promise<any[]> => {
  return new Promise(async (resolve, reject) => {
    var tracks: any[] = []
    let body
    try {
      body = await get_tracks_by_album(album.id, 1, 0)
    } catch (error) {
      console.error(error)
      return reject(new AlbumsTracksError(album, error))
    }
    let total = body.total
    let iterations = Math.floor(total/SPOTIFY_LIMIT)
    for (let j = 0; j <= iterations; j++) {
      let body 
      try {
        body = await get_tracks_by_album(album.id, SPOTIFY_LIMIT, j*SPOTIFY_LIMIT)
      } catch (error) {
        console.error(error)
        return reject(new AlbumsTracksError(album, error))
      }
      tracks.push(...body.items)
    }
    resolve(tracks)
  })
}

export const filterTracks = (tracks: any[], album: any) => {
  return tracks.filter((track) => isTrackArtist(track, album))
}

export const isTrackArtist = (track: any, album: any) => {
  return track.artists.map((artist: any) => artist.name.toLowerCase()).includes(album.artist.name.toLowerCase()) ||
    track.artists.map((relatedArtist: any) => relatedArtist.name.toLowerCase()).includes(album.relatedArtist.name.toLowerCase())
}

export const setAlbumOnTracks = (tracks: any[], album: any) => {
  return tracks.map(track => { track.album = album; return track; })
}

export const track_list = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let watchlistBool: boolean
  watchlist === "true" ? watchlistBool = true : watchlistBool = false
  
  const totalTracks = await getNumberOfTracksInDB(watchlistBool)
  const numPlaylistTracks = await getNumberOfTracksToInclude(watchlistBool)
  const allTracks = await getAllTracks(watchlistBool)

  res.render("tracks", { 
      title: "Tracks",
      total_track_count: totalTracks,
      playlist_track_count: numPlaylistTracks,
      track_list: allTracks,
      watchlist: watchlist
  });
});

export const track_delete_get = asyncHandler(async (req, res, next) => {
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

export const track_delete_post = asyncHandler(async (req, res, next) => {
  let watchlist = req.query.watchlist
  let track = await Track.findById(req.body.trackid).exec();
  let playlistId
  if (watchlist === 'true') {
    playlistId = process.env.WATCHLIST_PLAYLIST_ID
  } else {
    playlistId = process.env.PLAYLIST_ID
  }
  if (playlistId) {
    try {
      await removeTracksFromPlaylist([track], playlistId)
      await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
      res.redirect("/tracks?watchlist=" + watchlist);
    } catch (error) {
      if (error instanceof PlaylistTracksError) {
        res.render("error", {
          title: "Error!",
          message: error.message,
          error: error.error,
          resolution: `Please try to delete ${track!.name} again.`
        });
        return
      }
    }
  } else {
    await Track.findByIdAndUpdate(req.body.trackid, { to_include: false, playlist_position: -1 }).exec();
    res.redirect("/tracks?watchlist=" + watchlist);
  }
});