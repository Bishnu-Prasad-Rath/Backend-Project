import { CACHE_KEYS } from "./key.js";
import { redisClient } from "../../config/redis.config.js";

const addSubscription = async (userId, channelId) => {
  await redisClient.sAdd(CACHE_KEYS.USER_SUBSCRIPTIONS(userId), channelId);
  await redisClient.sAdd(CACHE_KEYS.CHANNEL_SUBSCRIBERS(channelId), userId);
};

const removeSubscription = async (userId, channelId) => {
  await redisClient.sRem(CACHE_KEYS.USER_SUBSCRIPTIONS(userId), channelId);
  await redisClient.sRem(CACHE_KEYS.CHANNEL_SUBSCRIBERS(channelId), userId);
};

const isSubscribed = async (userId, channelId) => {
  return await redisClient.sIsMember(
    CACHE_KEYS.USER_SUBSCRIPTIONS(userId),
    channelId
  );
};

const getSubscribersCount = (channelId) =>
  redisClient.sCard(CACHE_KEYS.CHANNEL_SUBSCRIBERS(channelId));

export {
  addSubscription,
  removeSubscription,
  isSubscribed,
  getSubscribersCount
};