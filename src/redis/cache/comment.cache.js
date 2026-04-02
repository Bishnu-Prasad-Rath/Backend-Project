import { getCache, setCache, deleteCache } from "./base.cache.js";

// ✅ GET
const getCommentsCache = async (videoId, page) => {
  const key = `comments:${videoId}:page=${page}`;
  return await getCache(key);
};

// ✅ SET
const setCommentsCache = async (videoId, page, data) => {
  const key = `comments:${videoId}:page=${page}`;
  await setCache(key, data, 60);
};

// ✅ DELETE
const deleteCommentsCache = async (videoId) => {
  const pattern = `comments:${videoId}:page=`;

  const keys = await redisClient.keys(`${pattern}*`);

  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export {
  getCommentsCache,
  setCommentsCache,
  deleteCommentsCache,
};