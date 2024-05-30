const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TrackSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
  uri: { type: String, maxLength: 100 },
  album_spotify_id: { type: String, required: true, maxLength: 100 },
  track_number: { type: Number, maxLength: 100 },
  to_include: { type: Boolean }
});

module.exports = mongoose.model("Track", TrackSchema);
