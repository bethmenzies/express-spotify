import express from 'express';
const router = express.Router();

import { create_playlist_from_db } from "../controllers/createFromDB.ts";

// GET request for list of all Artists.
router.get("/", create_playlist_from_db);

export default router;