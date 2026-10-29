const Track = require('./models/track');

const findTracksLteDate = async (date, watchlist, fields) => {
  return await Track.find({ 'album.release_date': { $lte: date }, watchlist: watchlist }, fields).exec();
}

const deleteTracksLteDate = async (date, watchlist) => {
  return await Track.deleteMany({ 'album.release_date': { $lte: date }, watchlist: watchlist }).exec();
}

const findTrackByUri = async (uri, albumArtist, watchlist) => {
  return await Track.find({ uri: uri, 'album.artist.name': albumArtist, watchlist: watchlist }).exec();
}

const updateTrackPlaylistPosition = async (id, playlistPosition) => {
  return await Track.findByIdAndUpdate(id, { playlist_position: playlistPosition }, { new: true }).exec();
}

const findAllTracksToInclude = async (watchlist, fields) => {
  return await Track.find({ watchlist: watchlist, to_include: true }, fields).sort({ playlist_position: 1 }).exec();
}

const saveNewTrack = async (track, watchlist) => {
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

module.exports = { findTracksLteDate, deleteTracksLteDate, findTrackByUri, updateTrackPlaylistPosition, findAllTracksToInclude, saveNewTrack }