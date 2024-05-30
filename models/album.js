const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AlbumSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
  release_date: { type: String, maxLength: 100 }
});

module.exports = mongoose.model("Album", AlbumSchema);