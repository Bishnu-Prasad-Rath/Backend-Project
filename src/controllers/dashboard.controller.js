import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
   const channelId = req.user._id;

   const totalSubscribers = await Subscription.countDocuments({
    channel : channelId
   }) 

   const totalVideos = await Video.countDocuments({
    owner : channelId
   })

   const totalLikes = await Like.countDocuments({
    owner : channelId
   })

   const totalViewsAgg = await Video.aggregate([
    {
        $match : {owner : channelId}
    },
    {
        $group : {
            _id : null,
            totalViews : {
                $sum : "$views"
            }
        }
    }
   ])

   const totalViews = totalViewsAgg[0]?.totalViews || 0;

 return res.status(200).json(
  new ApiResponse(
    200,
    {
      totalSubscribers,
      totalVideos,
      totalViews,
      totalLikes
    },
    "Channel stats fetched successfully"
  )
)
})



const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.user._id;

    const videos = await Video.find({
        owner : channelId
    }).sort({
        createdAt : -1
    })

    return res
    .status(200)
    .json(new ApiResponse(
        200,videos,"All videos of this channel are fetched successfully"
    ))
})

export {
    getChannelStats, 
    getChannelVideos
    }