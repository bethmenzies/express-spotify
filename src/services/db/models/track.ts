import { Schema, model } from "mongoose";

const TrackRelatedArtistSchema = new Schema({
  name: { type: String, maxLength: 100 },
  spotify_id: { type: String, maxLength: 100 }
});

const TrackArtistSchema = new Schema({
  name: { type: String, required: true,maxLength: 100 },
  related_artist: { type: TrackRelatedArtistSchema },
  spotify_id: { type: String, required: true, maxLength: 100 },
  watchlist: { type: Boolean, required: true }
});

const TrackAlbumSchema = new Schema({
  artist: { type: TrackArtistSchema, required: true },
  name: { type: String, required: true, maxLength: 100 },
  release_date: { type: String, maxLength: 100 },
  spotify_id: { type: String, required: true, maxLength: 100 },
});

const TrackSchema = new Schema({
  album: { type: TrackAlbumSchema, required: true },
  name: { type: String, required: true,maxLength: 100 },
  playlist_position: { type: Number, maxLength: 100 },
  spotify_id: { type: String, required: true,maxLength: 100 },
  to_include: { type: Boolean },
  track_number: { type: Number, maxLength: 100 },
  uri: { type: String, required: true, maxLength: 100 },
  url: { type: String },
  watchlist: { type: Boolean, required: true }
});

// Virtual for this artist instance URL.
TrackSchema.virtual("trackurl").get(function () {
  return "/track/" + this._id;
});

export default model("Track", TrackSchema);