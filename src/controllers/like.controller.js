import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getIO } from "../socket/socketInstance.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

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

if(existingLike){
  await Like.findByIdAndDelete(existingLike._id);
  action = "unlike";
}else{
  like = await Like.create({
    video : videoId,
    likedBy : req.user._id,
  });
  action = "like";
}

  const totalLikes = await Like.countDocuments({
    video: videoId,
  });

  io.to(videoId).emit("video:like", {
    videoId,
    userId: req.user._id,
    action,
    totalLikes,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "Video liked" : "Video unliked"
      )
    );
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

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    action = "unlike";
  }else{
   like = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });

  action = "like";
  }


  const totalLikes = await Like.countDocuments({
    comment: commentId,
  });

  io.to(commentId).emit("comment:like", {
    commentId,
    userId: req.user._id,
    action,
    totalLikes,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "Comment liked" : "Comment unliked"
      )
    );
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

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    action = "unlike";
  }else{
       like = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  action = "like";
  }

  const totalLikes = await Like.countDocuments({
    tweet: tweetId,
  });

  io.to(tweetId).emit("tweet:like", {
    tweetId,
    userId: req.user._id,
    action,
    totalLikes,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { like, action, totalLikes },
        action === "like" ? "tweet liked" : "tweet unliked"
      )
    );
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
