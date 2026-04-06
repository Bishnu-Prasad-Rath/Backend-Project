import express from 'express';
import { startLive , endLive , getLiveStreams , getLiveById } from '../controllers/live.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/start", verifyJWT, startLive);
router.patch("/end/:liveId", verifyJWT, endLive);
router.get("/active", getLiveStreams);
router.get("/:liveId", getLiveById);

export default router;