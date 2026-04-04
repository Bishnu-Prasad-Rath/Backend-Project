import { redisClient } from '../../config/redis.config.js';
import { CACHE_KEYS } from './key.js';

const TRENDING_KEY = CACHE_KEYS.TRENDING_VIDEOS();

const getTrendingScore = async (limit = 10) => {
  return await redisClient.zRange(
    TRENDING_KEY,
    0,
    limit - 1,
    { WITHSCORES: true }
  );
};

const updateTrendingScore = async (videoId, score) => {
  console.log("TRENDING_CALLED :", videoId, score);

  await redisClient.zIncrBy(TRENDING_KEY, score, videoId);
};

export { updateTrendingScore, getTrendingScore };