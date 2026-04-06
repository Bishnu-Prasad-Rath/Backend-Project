import { Live } from "../models/live.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const startLive = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const live = await Live.create({
    streamer: req.user._id,
    title,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, live, "Live stream started successfully"));
});

const endLive = asyncHandler(async (req, res) => {
  const { liveId } = req.params;

  const live = await Live.findByIdAndUpdate(
    liveId,
    {
      isAtive: false,
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, live, "Live stream ended successfully"));
});

const getLiveStreams = asyncHandler(async (req, res) => {
  const lives = await Live.find({
    isActive: true,
  }).populate("streamer", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, lives, "Active live streams fetched successfully")
    );
});

const getLiveById = asyncHandler(async (req, res) => {
  const { liveId } = req.params;

  const live = await Live.findById(liveId).populate(
    "streamer",
    "username avatar"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, live, "Live stream fetched successfully"));
});


export {
    startLive,
    endLive,
    getLiveStreams,
    getLiveById
}