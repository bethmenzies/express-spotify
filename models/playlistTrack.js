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
  url: { type: String, required: true },
  uri: { type: String, maxLength: 100 },
  album: { type: TrackAlbumSchema, required: true },
  track_number: { type: Number, maxLength: 100 },
  playlist_position: { type: Number, maxLength: 100 },
  to_include: { type: Boolean }
});

// Virtual for this artist instance URL.
TrackSchema.virtual("trackurl").get(function () {
  return "/track/" + this._id;
});

module.exports = mongoose.model("Track", TrackSchema);