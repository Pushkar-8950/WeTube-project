import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import ApiResponse from "../utils/APIResponse.js"
import { Subscription } from "../models/subscriptions.model.js"

const getVideosForHomepage = asyncHandler(async (req, res) => {

    const {page=1, limit=8} = req.query;

    const pageNumber = Number(page) || 1, limitNumber = Number(limit) || 8;

    if(!Number.isInteger(pageNumber) || !Number.isInteger(limitNumber) || pageNumber < 1 || limitNumber < 1 || limitNumber > 50) {
        throw new ApiError(400, "Invalid pagination parameters ")
    }

    // Get videos from the DB
    const videos = await Video.aggregate([
        {
            $match: {
                isPublished: true
            }
        },
        { 
            $sort: { 
                createdAt: -1, _id: -1 
            } 
        },
        {
            $skip: (pageNumber - 1) * limitNumber
        },
        {
            $limit: limitNumber
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "Subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: {
                                $size: "$Subscribers"
                            }
                        }
                    },
                    {
                        $project: {
                            Subscribers: 0
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$ownerDetails", 0]
                }
            }
        },
        {
            $project: {
                videoTitle: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                owner: {
                    username: 1,
                    avatarImage: 1,
                    fullName: 1,
                    subscribersCount: 1
                },
                createdAt: 1,
                videoFile: 1,
                totalLikesCount: 1
            }
        }
    ]);

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            {
                videos, 
                currentPage: pageNumber
            },
            "Video fetched successfully"
        )
    )
});

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    
    //TODO: get all videos based on query, sort, pagination
    const pipeline = [];

    // Match videos where on of the conditions matches. Either, title or description contains the query ignoring case senstivity
    if (query) {
        pipeline.push(
            {
                $match: {
                    $or: [
                        {title: {$regex: query, $options: "i"}},
                        {description: {$regex: query, $options: "i"}}
                    ]
                }
            }
        )
    }

    if(userId){

        // validate the user ID
        const isValidUserId = mongoose.isValidObjectId(userId);
        if(!isValidUserId){
            throw new ApiError(400, "Invalid User ID");
        }

        // NOw check if user exists in DB or not
        const user = await User.findById(userId);
        if(!user){
            throw new ApiError(404, "User doesn't exist")
        }

        // Now, match if all the videos belongs to current user or not
        pipeline.push(
            {
                // we are having user ID, we can filter only those videos where  
                $match: {
                    owner: new mongoose.Types.ObjectId(userId)
                }
            }
        )
    }

    // Now, attach owner details with every video
    pipeline.push(
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner" 
            }
        },
        {
            $addFields: {
                owner: { $arrayElemAt: ["$owner", 0] }
            }
        }
    )

    // sort videos by type
    if (sortBy && sortType) {
        pipeline.push(
            {
                $sort: {
                    [sortBy] : sortType === "asc" ? 1 : -1
                }
            }
        )
    }

    pipeline.push(
        {
            $project: {
                videoFile: 1,
                thumbnail: 1,
                id: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                createdAt: 1,
                updatedAt: 1,
                "owner.fullName": 1,
                "owner.username": 1,
                "owner.email": 1
            }
        }
    )

    // Validate page and limit before pagination
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if(!Number.isInteger(pageNumber) || !Number.isInteger(limitNumber) || pageNumber < 1 || limitNumber < 1) {
        throw new ApiError(400, "Invalid User Input (Bad request) ")
    }

    pipeline.push(
        {
            $skip: (pageNumber - 1) * limitNumber
        }
    )

    pipeline.push(
        {
            $limit: Number(limitNumber)
        }
    )

    const videos = await Video.aggregate(pipeline);

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "All videos fetched successfully")
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    const videoToPublish = req.files?.videoToPublish[0].path;
    const thumbnail = req.files?.thumbnail[0].path;

    if(!videoToPublish){
        throw new ApiError(401, "video to publish not found");
    }

    if(!thumbnail){
        throw new ApiError(401, "Thumbnail not found");
    }

    const uploadedVideo = await uploadOnCloudinary(videoToPublish);
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

    if(!uploadedVideo){
        throw new ApiError(500, "Error while uploading video on cloudinary")
    }

    if(!thumbnail){
        throw new ApiError(500, "Error while uploading thumbnail on cloudinary")
    }
    
    const video = await Video.create({
        videoTitle: title,
        thumbnail: uploadedThumbnail.url,
        description,
        duration: uploadedVideo.duration,
        isPublished: true,
        owner: req.user?._id,
        videoFile: uploadedVideo.url
    });

    const publishedVideo = await Video.findById(video._id);

    if(!publishedVideo) {
        throw new ApiError(500, "Something went wrong while publishing video");
    }

    return res.status(200)
    .json(
        new ApiResponse(200, publishedVideo, "Video Published Successfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Bad request, invalid video ID")
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            avatarImage: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "owner",
                foreignField: "channel",
                as: "subscribed"
            }
        },
        {
            $addFields: {
                subscribed: {
                    $filter: {
                        input: "$subscribed",
                        as: "sub",
                        cond: {
                            $eq: [
                                "$$sub.subscriber",
                                new mongoose.Types.ObjectId(req.user._id)
                            ]
                        }
                    }
                }
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Fetched Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    const { newTitle, newDescription } = req.body
    const newThumbnail = req.file?.path;

    //TODO: update video details like title, description, thumbnail
    
    // validate video ID
    if(!mongoose.isValidObjectId(videoId)) {throw new ApiError(400, "Bad request, invalid video ID")}

    // if valid then check if any video exist in DB
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "video not found")
    }

    // if video exist, then check who is updating the video
    if (!video.owner.equals(req.user._id)) {
        throw new ApiError(403, "You are not allowed to update this video");
    }

    const updateFields = {};

    // If thumbnail is present then upload on cloudinary
    if(newThumbnail){
        const uploadedThumbnail = await uploadOnCloudinary(newThumbnail);

        if(!uploadedThumbnail) {
            throw new ApiError(500, "Error while uploading new Thumbnail on cloudinary")
        }

        updateFields.thumbnail = uploadedThumbnail.url;
    }

    if (newTitle) {
        updateFields.videoTitle = newTitle;
    }

    if (newDescription) {
        updateFields.description = newDescription;
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateFields 
        },
        {returnDocument: "after"}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "Video Details updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.query
    //TODO: delete video
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Bad request, invalid video ID")
    }

    const video = await Video.findByIdAndDelete(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video Deleted Successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.query

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Bad request, invalid video ID")
    }

    const video = await Video.findByIdAndUpdate(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const status = video.isPublished;
    const newVideo = await Video.findByIdAndUpdate(
        videoId, 
        {
            $set: {
                isPublished: !status
            }
        },
        {returnDocument: 'after'}
    ).select('-videoFile -thumbnail -duration -views -description')

    return res
    .status(200)
    .json(
        new ApiResponse(200, newVideo, "Publish status toggled successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideosForHomepage
}