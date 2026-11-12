import * as mongoose from 'mongoose';
import Track from './models/track.ts';

export const findTracksLteDate = async (date: string, watchlist: boolean, fields: string): Promise<any[]> => {
  return await Track.find({ 'album.release_date': { $lte: date }, watchlist: watchlist }, fields).exec();
}

export const deleteTracksLteDate = async (date: string, watchlist: boolean): Promise<any> => {
  return await Track.deleteMany({ 'album.release_date': { $lte: date }, watchlist: watchlist }).exec();
}

export const findTrackByUri = async (uri: string, albumArtist: string, watchlist: boolean): Promise<any[]> => {
  return await Track.find({ uri: uri, 'album.artist.name': albumArtist, watchlist: watchlist }).exec();
}

export const updateTrackPlaylistPosition = async (id: mongoose.Types.ObjectId, playlistPosition: number): Promise<any> => {
  return await Track.findByIdAndUpdate(id, { playlist_position: playlistPosition }, { new: true }).exec();
}

export const findAllTracksToInclude = async (watchlist: boolean, fields: string): Promise<any[]> => {
  return await Track.find({ watchlist: watchlist, to_include: true }, fields).sort({ playlist_position: 1 }).exec();
}

export const saveNewTrack = async (track: any, watchlist: boolean): Promise<any> => {
  const newTrack = new Track({
    name: track.name.substring(0, 100),
    spotify_id: track.id,
    uri: track.uri,
    url: track.external_urls.spotify,
    album: {
      name: track.album.name.substring(0, 100),
      spotify_id: track.album.id,
      release_date: track.album.release_date,
      artist: {
        name: track.album.artist.name,
        spotify_id: track.album.artist.spotify_id,
        related_artist: {
          name: track.album.relatedArtist.name,
          spotify_id: track.album.relatedArtist.spotify_id
        },
        watchlist: track.album.artist.watchlist
      }
    },
    track_number: track.track_number,
    to_include: true,
    watchlist: watchlist
  });
  await newTrack.save()
  return newTrack
}

export const getNumberOfTracksInDB = async (watchlist: boolean): Promise<any> => {
  return await Track.countDocuments({ watchlist: watchlist }).exec();
}

export const getNumberOfTracksToInclude = async (watchlist: boolean): Promise<any> => {
  return await Track.countDocuments({ to_include: true, watchlist: watchlist }).exec()
}

export const getAllTracks = async (watchlist: boolean): Promise<any> => {
  return await Track.find({ to_include: true, watchlist: watchlist }, "name url album.artist.name album.name playlist_position")
    .sort({ 'playlist_position': 1 })
    .exec();
}