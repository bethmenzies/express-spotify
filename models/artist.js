const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ArtistSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, maxLength: 100 }
});

module.exports = mongoose.model("Artist", ArtistSchema);
