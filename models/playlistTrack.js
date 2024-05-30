const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TrackArtistSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, maxLength: 100 }
});

const TrackAlbumSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
  release_date: { type: String, maxLength: 100 },
  artist: { type: TrackArtistSchema, required: true },
});

const TrackSchema = mongoose.Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
  uri: { type: String, maxLength: 100 },
  album: { type: TrackAlbumSchema, required: true },
  track_number: { type: Number, maxLength: 100 },
  to_include: { type: Boolean }
});

module.exports = mongoose.model("Track", TrackSchema);