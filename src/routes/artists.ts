import express from 'express';
const router = express.Router();

import { artist_list, artist_add_get, artist_add_post, artist_delete_get, artist_delete_post, artist_swap_playlist_get, artist_swap_playlist_post, run_for_artist, artist_edit_get, artist_edit_post } from "../controllers/artistController.ts";

// GET request for list of all Artists.
router.get("/", artist_list);

router.get("/add", artist_add_get);
router.post("/add", artist_add_post);

router.get("/artist/:id/delete", artist_delete_get);
router.post("/artist/:id/delete", artist_delete_post);

router.get("/artist/:id/swap", artist_swap_playlist_get);
router.post("/artist/:id/swap", artist_swap_playlist_post);

router.get("/artist/:id/run", run_for_artist);

router.get("/artist/:id/edit", artist_edit_get)
router.post("/artist/:id/edit", artist_edit_post)

export default router;