import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comments.model.js"
import {Subscription} from "../models/subscriptions.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {User} from "../models/user.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Like} from "../models/like.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params;

    // validate
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Bad request, invalid channel ID")
    }

    // Check if channel exist or not
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel doesn't exist")
    }   

    const allViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        },
        {
            $project: {
                _id: 0,
                totalViews: 1
            }
        }
    ]);
    
    const totalSubscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(channelId)
    });

    const totalVideos = await Video.countDocuments({
        owner: new mongoose.Types.ObjectId(channelId)
    });   
    
    const allVideoLikes = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "videoLikes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$videoLikes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                }
            }
        }
    ]);

    const allCommentLikes = await Comment.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentLikes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$commentLikes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                }
            }
        }
    ]);

    const allTweetLikes = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "tweetLikes"
            }
        },
        {
            $project: {
                totalLikes: {
                    $size: "$tweetLikes"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                    $sum: "$totalLikes"
                }
            }
        }
    ]);

    const totalViews = allViews[0]?.totalViews ?? 0; 
    const totalLikes = (allVideoLikes[0]?.totalLikes ?? 0) + (allCommentLikes[0]?.totalLikes ?? 0) + (allTweetLikes[0]?.totalLikes ?? 0);

    const channelDetails = {
        totalViews: totalViews,
        totalSubscribers: totalSubscribers,
        totalVideos: totalVideos,
        totalLikes: totalLikes
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelDetails, "Channel stats fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params;

    // validate
    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Bad request, invalid channel ID")
    }

    // Check if channel exist or not
    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel doesn't exist")
    } 

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId),
                isPublished: true
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "ALL channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}