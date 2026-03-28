import { redisClient } from "../../config/redis.config.js";

const getVideoLikesKey = (videoId) => `video:${videoId}:likes`;
const getCommentLikesKey = (commentId) => `comment:${commentId}:likes`;
const getTweetLikesKey = (tweetId) => `tweet:${tweetId}:likes`;

//Video

const incrementVideoLikes = async (videoId) => {
  return await redisClient.incr(getVideoLikesKey(videoId));
};

const decrementVideoLikes = async (videoId) => {
  return await redisClient.decr(getVideoLikesKey(videoId));
};

const getVideoLikes = async (videoId) => {
  const value = await redisClient.get(getVideoLikesKey(videoId));
  return value ? parent(value) : null;
};

const setVideoLikes = async (videoId, count) => {
  await redisClient.set(getVideoLikesKey(videoId), count);
};
//Comment

const incrementCommentLikes = async (commentId) => {
  return await redisClient.incr(getCommentLikesKey(commentId));
};

const decrementCommentLikes = async (commentId) => {
  return await redisClient.decr(getCommentLikesKey(commentId));
};

const getCommentLikes = async (commentId) => {
    const value = await redisClient.get(getCommentLikesKey(commentId))
    return value ? parent(value) : null;
} 

const setCommentLikes = async (commentId,count) => {
await redisClient.set(getCommentLikesKey(commentId,count))
}

//Tweet

const incrementTweetLikes = async (tweetId) => {
  return await redisClient.incr(getTweetLikesKey(tweetId));
};

const decrementTweetLikes = async (tweetId) => {
  return await redisClient.decr(getTweetLikesKey(tweetId));
};

getTweetLikes = async(tweetId)=>{
    const value = await redisClient.get(getTweetLikesKey(tweetId));
    return value ? parent(value) : null;
}

setTweetLikes = async(tweetId,count)=>{
 await redisClient.set(getTweetLikesKey(tweetId,count));
}

export {
  incrementVideoLikes,
  decrementVideoLikes,
  getVideoLikes,
  setVideoLikes,
  incrementCommentLikes,
  decrementCommentLikes,
  getCommentLikes,
  setCommentLikes,
  incrementTweetLikes,
  decrementTweetLikes,
  getTweetLikes,
  setTweetLikes
};
