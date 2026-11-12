import express from 'express';
const router = express.Router();

import { get_home_page } from "../controllers/indexController.ts";

/* GET home page. */
router.get('/', get_home_page);

export default router;
