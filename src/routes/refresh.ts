import express from 'express';
const router = express.Router();

import { refresh, confirm } from "../controllers/refreshController.ts";

/* GET home page. */
router.get('/', refresh);

router.get("/confirm", confirm);

export default router;