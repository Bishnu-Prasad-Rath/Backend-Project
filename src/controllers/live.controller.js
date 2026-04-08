import { Live } from "../models/live.model.js";
import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { createLiveToken } from "../utils/livekit.js";

const getLiveToken = asyncHandler(async (req, res)=>{
   const {liveId} = req.params;

   if(!liveId){
    throw new ApiError(400, "Live ID is required");
   }

   if(!isValidObjectId(liveId)){
    throw new ApiError(400, "Invalid Live ID");
   }

   const live = await Live.findById(liveId);

   if(!live || !live.isLive){
    throw new ApiError(404, "Live stream not found");
   }
   
const isStreamer = live.streamer.toString() === req.user._id.toString();

let token;

   try {
   token = createLiveToken(liveId, req.user,isStreamer);
   } catch (error) {
    throw new ApiError(500, "Error generating live token");
   }

   return res
   .status(200)
   .json(new ApiResponse(200, {token}, "LIve token generated successfully"))
})

const startLive = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if(!title){
     throw new ApiError(400, "Title is required to start a live stream");
  }

  const existingLive = await Live.findOne({
    streamer: req.user._id,
    isLive: true,
  })

  if(existingLive){
    throw new ApiError(400, "You already have an active live stream");
  }

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

  if(!liveId){
    throw new ApiError(400, "Live ID is required");
  }

  if(!isValidObjectId(liveId)){
    throw new ApiError(400, "Invalid Live ID");
  }

const live = await Live.findById(liveId);

if (!live) {
  throw new ApiError(404, "Live stream not found");
}

if (live.streamer.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "You are not authorized to end this live stream");
}

live.isLive = false;
await live.save();

  return res
    .status(200)
    .json(new ApiResponse(200, live, "Live stream ended successfully"));
});

const getLiveStreams = asyncHandler(async (req, res) => {
  const lives = await Live.find({
    isLive: true,
  }).populate("streamer", "username avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, lives, "Active live streams fetched successfully")
    );
});

const getLiveById = asyncHandler(async (req, res) => {
  const { liveId } = req.params;

  if(!liveId){
    throw new ApiError(400, "Live ID is required");
  }

  if(!isValidObjectId(liveId)){
    throw new ApiError(400, "Invalid Live ID");
  }

  const live = await Live.findById(liveId).populate(
    "streamer",
    "username avatar"
  );

  if(!live){
    throw new ApiError(404, "Live stream not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, live, "Live stream fetched successfully"));
});


export {
    getLiveToken,
    startLive,
    endLive,
    getLiveStreams,
    getLiveById
}