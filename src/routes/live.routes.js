import express from 'express';
import { getLiveToken,startLive , endLive , getLiveStreams , getLiveById } from '../controllers/live.controller.js';
import {verifyJWT} from '../middlewares/auth.middleware.js';
import { rateLimitMiddleware } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.post("/start",rateLimitMiddleware({
    windowSize: 60,
    maxRequests: 3,
}), verifyJWT, startLive);
router.get("/:liveId/token",rateLimitMiddleware({
    windowSize: 60,
    maxRequests: 20,
}), verifyJWT, getLiveToken);
router.patch("/end/:liveId", rateLimitMiddleware({
    windowSize: 60,
    maxRequests: 3,
}), verifyJWT, endLive);
router.get("/active",rateLimitMiddleware({
    windowSize: 60,
    maxRequests: 100,
}), getLiveStreams);
router.get("/:liveId", getLiveById);

export default router;