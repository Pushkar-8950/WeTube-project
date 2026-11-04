import mongoose from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Comment } from "../models/comments.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    // Validate video ID
    // check if video exist in DB or not
    // check if video is already liked or not
    // if liked, remove entry
    // if not, add entry
    // check if entry is created or not
    // return response
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Bad request, invalid Video ID")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video doesn't exist")
    }

    const entry = await Like.findOne(
        {
            video: videoId,
            likedBy: req.user._id
        }
    );

    if(entry){
            
        // video is alrleady liked
        await Like.findOneAndDelete(
            {
                video: videoId,
                likedBy: req.user._id
            }
        )

        return res.status(200).json(new ApiResponse(200, entry, "Like removed from video successfully"))

    } else {

        const newEntry = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })

        if(!newEntry){
            throw new ApiError(500, "Internal error, unable to create like entry in DB")
        }

        return res.status(201).json(new ApiResponse(201, newEntry, "video liked successfully"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Bad request, invalid comment ID")
    }

    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment doesn't exist")
    }

    const entry = await Like.findOne(
        {
            comment: commentId,
            likedBy: req.user._id
        }
    );

    if(entry){
            
        // video is alrleady liked
        await Like.findOneAndDelete(
            {
                comment: commentId,
                likedBy: req.user._id
            }
        )

        return res.status(200).json(new ApiResponse(200, entry, "Like removed from comment successfully"))

    } else {

        const newEntry = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        if(!newEntry){
            throw new ApiError(500, "Internal error, unable to create like entry in DB")
        }

        return res.status(201).json(new ApiResponse(201, newEntry, "comment liked successfully"))
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Bad request, invalid comment ID")
    }

    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet doesn't exist")
    }

    const entry = await Like.findOne(
        {
            tweet: tweetId,
            likedBy: req.user._id
        }
    );

    if(entry){
            
        // video is alrleady liked
        await Like.findOneAndDelete(
            {
                tweet: tweetId,
                likedBy: req.user._id
            }
        )

        return res.status(200).json(new ApiResponse(200, entry, "Like removed from Tweet successfully"))

    } else {

        const newEntry = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if(!newEntry){
            throw new ApiError(500, "Internal error, unable to create like entry in DB")
        }

        return res.status(201).json(new ApiResponse(201, newEntry, "tweet liked successfully"))
    }
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const pipeline = [
        {
            $match: {
                likedBy: req.user._id,
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $project: {
                _id: 0,
                videoDetails: 1
            }
        }
    ];

    const likedVideos = await Like.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}