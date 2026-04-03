import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket/socketInstance.js";
import {
  incrementVideoLikes,
  decrementVideoLikes,
  getVideoLikes,
  incrementCommentLikes,
  decrementCommentLikes,
  incrementTweetLikes,
  decrementTweetLikes,
  setVideoLikes,
  getCommentLikes,
  setCommentLikes,
  getTweetLikes,
  setTweetLikes,
} from "../redis/cache/like.cache.js";
import { incrementLikes } from "../redis/cache/dashboard.cache.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findById(videoId);
  const channelId = video.owner;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  const io = getIO();

  let action;
  let like;
  let totalLikes;

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    action = "unlike";

    totalLikes = await decrementVideoLikes(videoId);
  } else {
    like = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    action = "like";

    await incrementLikes(channelId, "video");

    totalLikes = await incrementVideoLikes(videoId);
  }

  totalLikes = Number(totalLikes) || 0;

  if (totalLikes < 0) {
    let redisLikes = await getVideoLikes(videoId);

    if (redisLikes !== null) {
      totalLikes = Number(redisLikes) || 0;
    } else {
      const dbCount = await Like.countDocuments({ video: videoId });
      await setVideoLikes(videoId, dbCount);
      totalLikes = dbCount;
    }
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "Video liked" : "Video unliked"
      )
    );

  io.to(videoId).emit("video:like", {
    videoId,
    userId: req.user._id,
    action,
    totalLikes,
  });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  const io = getIO();

  let action;
  let like;
  let totalLikes;

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    action = "unlike";
    totalLikes = await decrementCommentLikes(commentId);
  } else {
    like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    action = "like";

    await incrementLikes(req.user._id, "comment");

    totalLikes = await incrementCommentLikes(commentId);
  }

  totalLikes = Number(totalLikes) || 0;

  if (totalLikes < 0) {
    let redisLikes = await getCommentLikes(commentId);

    if (redisLikes !== null) {
      totalLikes = Number(redisLikes) || 0;
    } else {
      const dbCount = await Like.countDocuments({ comment: commentId });
      await setCommentLikes(commentId, dbCount);
      totalLikes = dbCount;
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "Comment liked" : "Comment unliked"
      )
    );

  io.to(commentId).emit("comment:like", {
    commentId,
    userId: req.user._id,
    action,
    totalLikes,
  });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  const io = getIO();

  let action;
  let like;
  let totalLikes;

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    action = "unlike";
    totalLikes = await decrementTweetLikes(tweetId);
  } else {
    like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    action = "like";

    await incrementLikes(req.user._id, "tweet");

    totalLikes = await incrementTweetLikes(tweetId);
  }

  totalLikes = Number(totalLikes) || 0;

  if (totalLikes < 0) {
    let redisLikes = await getTweetLikes(tweetId);

    if (redisLikes !== null) {
      totalLikes = Number(redisLikes) || 0;
    } else {
      const dbCount = await Like.countDocuments({ tweet: tweetId });
      await setTweetLikes(tweetId, dbCount);
      totalLikes = dbCount;
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "tweet liked" : "tweet unliked"
      )
    );

  io.to(tweetId).emit("tweet:like", {
    tweetId,
    userId: req.user._id,
    action,
    totalLikes,
  });
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likes = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true, $ne: null },
  }).populate({
    path: "video",
    select: "title thumbnail views createdAt owner",
    populate: {
      path: "owner",
      select: "username fullName avatar",
    },
  });

  const likedVideos = likes.map((like) => like.video);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos fetched successfully.")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
