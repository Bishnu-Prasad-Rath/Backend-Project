import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res.status(200).json(new ApiResponse(200, {}, "Video unliked"));
  }

  const like = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, like, "Video liked"));
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

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res.status(200).json(new ApiResponse(200, {}, "Comment unliked"));
  }

  const like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, like, "Comment liked"));
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

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);

    return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked"));
  }

  const like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res.status(200).json(new ApiResponse(200, like, "Tweet liked"));
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
