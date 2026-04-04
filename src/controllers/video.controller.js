import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
  getPublicId,
} from "../utils/cloudinary.js";
import { getCache,setCache,deleteCache } from "../redis/cache/base.cache.js";
import {getVideoCache,setVideoCache,deleteVideoCache,getVideosCache,setVideosCache,deleteVideosCache} from  "../redis/cache/video.cache.js"
import {incrementVideos,incrementViews} from '../redis/cache/dashboard.cache.js';
import {updateTrendingScore,getTrendingScore} from '../redis/cache/trending.cache.js';

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
const params = { page, limit, query, sortBy, sortType, userId };

const isListValid = await getCache("videos:all")

let cachedVideos = null;

  if (isListValid) {
    cachedVideos = await getVideosCache(params);
  }

  if(cachedVideos){
    return res
    .status(200)
    .json(new ApiResponse(
      200,
      cachedVideos,
      "Videos fetched from the cache."
    ))
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const match = {
    isPublished: true,
  };
  if (query) {
    match.title = {
      $regex: query,
      $options: "i",
    };
  }
  if (userId) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }
  const sortOptions = {};
  if (sortBy) {
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1;
  }
  const videos = await Video.aggregate([
    {
      $match: match,
    },
    {
      $sort: sortOptions,
    },
    {
      $skip: skip,
    },
    {
      $limit: limitNumber,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  if (!videos.length) {
    throw new ApiError(404, "Videos not found");
  }

  await setVideosCache(params,videos);
  
  await setCache("videos:all", true);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.files?.videoFile || !req.files?.thumbnail) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;

  const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
  const uploadedThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!uploadedVideo?.url || !uploadedThumbnail?.url) {
    throw new ApiError(400, "Error when uploading video or thumbnail");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: uploadedVideo.url,
    thumbnail: uploadedThumbnail.url,
    owner: req.user._id,
    isPublished: true,
    duration: uploadedVideo.duration,
  });

  await incrementVideos(req.user._id);

await deleteCache("videos:all")

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const cachedVideo = await getVideoCache(videoId);

  if(cachedVideo){

await Video.findByIdAndUpdate(videoId, {
  $inc: { views: 1 },
});

await incrementViews(cachedVideo.owner._id);

await updateTrendingScore(videoId, 2);


    return res
    .status(200)
    .json(new ApiResponse(
      200,cachedVideo,"Video fetched from cache."
    ))
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
        isPublished: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        "owner.username": 1,
        "owner.fullName": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  if (!video.length) {
    throw new ApiError(404, "Video not found");
  }

  const videoData = video[0];

  await Video.findByIdAndUpdate(videoId,{
    $inc: { views: 1 },
  })

  await incrementViews(videoData.owner._id);

  await setVideoCache(videoId, videoData);

await updateTrendingScore(videoId, 2);

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const getTrending = asyncHandler(async (req, res) => {
  const videoIds = await getTrendingScore(10);

  if(!videoIds.length){
    return res
    .status(200)
    .json(new ApiResponse(200, [], "No trending videos found."));
  }

const videos = await Video.find({
  _id: { $in: videoIds },
});

const videoMap = new Map(
  videos.map((v) => [v._id.toString(), v])
);

const orderedVideos = videoIds.map((id) =>
  videoMap.get(id.toString())
);

  return res
  .status(200)
  .json(new ApiResponse(200, orderedVideos, "trending videos fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) {
    video.title = title;
  }

  if (description) {
    video.description = description;
  }

  if (req.file?.path) {
    const uploadedThumbnail = await uploadOnCloudinary(req.file.path);

    if (!uploadedThumbnail?.url) {
      throw new ApiError(400, "Error when uploading thumbnail");
    }
    video.thumbnail = uploadedThumbnail.url;
  }

  await video.save();

await deleteVideoCache(videoId);

await deleteCache("videos:all");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  const videoPublicId = getPublicId(video.videoFile);
  const thumbnailPublicId = getPublicId(video.thumbnail);

  await deleteFromCloudinary(videoPublicId, "video");
  await deleteFromCloudinary(thumbnailPublicId, "image");

  await Video.findByIdAndDelete(videoId);

// await deleteVideoCache(videoId);

await deleteCache("videos:all")

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to change the status of this video"
    );
  }

  video.isPublished = !video.isPublished;

  await video.save();

await deleteVideoCache(videoId);

await deleteCache("videos:all");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video status changed successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  getTrending,
};
