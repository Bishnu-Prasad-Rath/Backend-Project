import { redisClient } from "../../config/redis.config.js";
import { CACHE_KEYS } from "./key.js";
import { Video } from "../../models/video.model.js";

const TRENDING_KEY = CACHE_KEYS.TRENDING_VIDEOS();

const getTrendingScore = async (limit = 10) => {
return await redisClient.zrevrange(TRENDING_KEY, 0, limit - 1, "WITHSCORES");
};

const updateTrendingScore = async (videoId, weight) => {
  try {
    const video = await Video.findById(videoId).select("createdAt");

    if (!video) return;

    const now = Date.now();
    const created = new Date(video.createdAt).getTime();

    const hours = (now - created) / (1000 * 60 * 60);

    const decayFactor = 1 / (hours + 2);

    const score = weight * decayFactor;

    console.log("🔥 ADV SCORE:", videoId, score);

await redisClient.zincrby(TRENDING_KEY, score, videoId.toString());

  } catch (err) {
    console.error("Trending error:", err.message);
  }
};

export { updateTrendingScore , getTrendingScore };