const Artist = require("../models/artist");
const Album = require("../models/album");
const asyncHandler = require("express-async-handler");
var https = require('https');
const album = require("../models/album");

// Get missing spotify ids.
exports.get_spotify_ids = asyncHandler(async (req, res, next) => {
    const date = getDate2YearsAgo();

    const allArtists = await Artist.find({}, "name spotify_id")
    .sort({ name: 1 })
    .exec();

    for (let i = 0; i < allArtists.length; i++) {
        let artist = allArtists[i]
        if (artist.spotify_id === null || artist.spotify_id == "") {
            let spotifyId = await getSpotifyIdForArtist(artist.name);
            const new_artist = new Artist({
                name: artist.name,
                spotify_id: spotifyId,
                _id: artist.id
            });
            await Artist.findByIdAndUpdate(artist.id, new_artist, {});
        }
    }

    const allArtistsWithSpotifyIds = await Artist.find({}, "name spotify_id")
    .sort({ name: 1 })
    .exec();

    for (let i = 0; i < allArtistsWithSpotifyIds.length; i++) {
        let artist = allArtistsWithSpotifyIds[i]
        let albums = await getReleasesForArtist(artist.spotify_id)
        let recentAlbums = albums.filter(album => {
            return album.release_date > date
        });

        for (let j = 0; j < recentAlbums.length; j++) {
            const existingAlbum = await Album.find({ spotify_id: recentAlbums[j].id })
            if (existingAlbum.length > 0) {
                const new_album = new Album({
                    name: recentAlbums[j].name,
                    spotify_id: recentAlbums[j].id,
                    release_date: recentAlbums[j].release_date,
                    _id: existingAlbum._id
                });
                await Album.findByIdAndUpdate(existingAlbum._id, new_album, {})
            } else {
                const new_album = new Album({
                    name: recentAlbums[j].name,
                    spotify_id: recentAlbums[j].id,
                    release_date: recentAlbums[j].release_date,
                });
                await new_album.save();
            }
        }
    }
});

const getDate2YearsAgo = () => {
    var date = new Date()
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    date.setFullYear(date.getFullYear() - 2)
    return date.toISOString().split('T')[0]
}

const getReleasesForArtist = (artistId) => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'api.spotify.com',
            path: `/v1/artists/${artistId}/albums`,
            method: 'GET',
            headers: {
                Authorization: 'Bearer ' + process.env.ACCESS_TOKEN
            },
            json: true
        }

        const request = https.request(options, function(response) {
        let responseBody = '';
        console.log(response.statusCode);
        response.setEncoding('utf8');
        response.on('data', (chunk) => responseBody = responseBody + chunk);
        response.on('end', function () {
            const parsedBody = JSON.parse(responseBody + '');
    
            // Resolve based on status code.
            if (response.statusCode === 200) {
                resolve(parsedBody.items);
            } else {
                resolve(null)
            }
        });
        });
    
        request.on('error', err => {
        console.error(err)
        });
    
        request.write("data \n");
        request.end();
    });
}

const getSpotifyIdForArtist = (artistName) => {
  return new Promise((resolve) => {
    let path = `/v1/search?q=artist:${artistName}&type=artist`;
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

    const request = https.request(options, function(response) {
      let responseBody = '';
      console.log(response.statusCode);
      response.setEncoding('utf8');
      response.on('data', (chunk) => responseBody = responseBody + chunk);
      response.on('end', function () {
        const parsedBody = JSON.parse(responseBody + '');
  
        // Resolve based on status code.
        if (response.statusCode === 200) {
            resolve(parsedBody.artists.items[0].id);
        } else {
            resolve(null)
        }
      });
    });
  
    request.on('error', err => {
    console.error(err)
    });

    request.write("data \n");
    request.end();
  });
};

exports.run = asyncHandler(async (req, res, next) => {
    this.get_spotify_ids()
    res.send("run");
});