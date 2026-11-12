import express from 'express';
const router = express.Router();

import { track_list, track_delete_get, track_delete_post } from "../controllers/trackController.ts";

// GET request for list of all Artists.
router.get("/", track_list);

router.get("/track/:id/delete", track_delete_get);
router.post("/track/:id/delete", track_delete_post);

export default router;