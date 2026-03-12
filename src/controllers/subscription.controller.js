import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Channel ID is invalid");
  }

  if (channelId === req.user._id.toString()) {
    throw new ApiError(400, "You can not subscribe to yourself.");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Channel unsubscribed"));
  }

  const subscription = await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  await User.findByIdAndUpdate(channelId, { $inc: { subscriberCount: 1 } });

  return res
    .status(200)
    .json(new ApiResponse(200, subscription, "Channel subscribed"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "channel ID is not valid");
  }

  const subscribers = await Subscription.find({
    channel: channelId,
  })
    .populate({
      path: "subscriber",
      select: "username fullName avatar",
    })
    .select("subscriber");

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID");
  }

  const channels = await Subscription.find({
    subscriber: subscriberId,
  }).populate({
    path: "channel",
    select: "username fullName avatar",
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, channels, "Subscribed channels fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
