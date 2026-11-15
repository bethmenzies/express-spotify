import express from 'express';
const router = express.Router();

import { refresh, confirm } from "../controllers/refreshController";

/* GET home page. */
router.get('/', refresh);

router.get("/confirm", confirm);

export default router;