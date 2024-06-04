const Album = require("../models/album");
const Artist = require("../models/artist");
const spotify_controller = require("./spotifyController");

const get_date_2_years_ago = () => {
  var date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  date.setFullYear(date.getFullYear() - 2)
  return date.toISOString().split('T')[0]
}

const get_albums_by_artist = async (artistId) => {
  const options = {
    hostname: 'api.spotify.com',
    path: `/v1/artists/${artistId}/albums`,
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
    },
    json: true
  }
  return await spotify_controller.call_spotify(options);
}

const recent_albums_by_artist = async () => {
  const date = get_date_2_years_ago();

  const allArtistsWithSpotifyIds = await Artist.find({}, "name spotify_id")
  .sort({ name: 1 })
  .exec();

  return new Promise(async (resolve) => {
    var albums = []
    for (let i = 0; i < allArtistsWithSpotifyIds.length; i++) {
      let artist = allArtistsWithSpotifyIds[i]
      let body = await get_albums_by_artist(artist.spotify_id)
      if (body === null) {
        return resolve([]);
      }
      let recentAlbums = body.items.filter(album => {
        return album.release_date > date
      });
  
      // TODO: Remove the save to db
      for (let j = 0; j < recentAlbums.length; j++) {
        recentAlbums[j].artist = {
          name: artist.name,
          spotify_id: artist.spotify_id
        }
        const existingAlbum = await Album.find({ spotify_id: recentAlbums[j].id })
        if (existingAlbum.length > 0) {
          const new_album = new Album({
            name: recentAlbums[j].name,
            spotify_id: recentAlbums[j].id,
            release_date: recentAlbums[j].release_date,
            artist: existingAlbum.artist,
            _id: existingAlbum._id
          });
          await Album.findByIdAndUpdate(existingAlbum._id, new_album, {})
        } else {
          const new_album = new Album({
            name: recentAlbums[j].name,
            spotify_id: recentAlbums[j].id,
            release_date: recentAlbums[j].release_date,
            artist: artist._id
          });
          await new_album.save();
        }
      }
      albums = albums.concat(recentAlbums)
    }
    resolve(albums);
  });
}

module.exports = recent_albums_by_artist