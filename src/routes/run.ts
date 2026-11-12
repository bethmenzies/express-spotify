import express from 'express';
const router = express.Router();

import { run } from "../controllers/runController.ts";

// GET request for list of all Artists.
router.get("/", run);

export default router;