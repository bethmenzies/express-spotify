import { Schema, model } from "mongoose";

const RelatedArtistSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 }
});

const ArtistSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
  related_artists: { type: [RelatedArtistSchema] },
  watchlist: { type: Boolean, required: true }
});

// Virtual for this artist instance URL.
ArtistSchema.virtual("url").get(function () {
  return "/artist/" + this._id;
});

export default model("Artist", ArtistSchema);
