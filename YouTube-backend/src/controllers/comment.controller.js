import mongoose from "mongoose"
import {Comment} from "../models/comments.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    // CHeck if video Id is valid or not
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    // Check if video exist in DB or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Bad request, Video doesn't exist")
    }

    // filter all the comments matching videoID
    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $facet: {
                comments: [
                    {
                        $skip: (Number(page) - 1) * Number(limit)
                    },
                    {
                        $limit: Number(limit)
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        avatarImage: 1
                                    }
                                }
                            ],
                            as: "ownerDetails"
                        }
                    },
                    {
                        $addFields: {
                            ownerDetails: { $arrayElemAt : ["$ownerDetails", 0] }
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
                        $addFields: {
                            totalLikes: {
                                $size:  "$commentLikes"
                            }
                        }
                    },
                    {
                        $project: {
                            commentLikes: 0,
                            _id: 1,
                            video: 0,
                            owner: 0,
                        }
                    }
                ],

                metadata: [
                    {
                        $count: "totalComments"
                    }
                ]
            }
        },
        {
            $project: {
                comments: 1,
                totalComments: {
                    $ifNull: [
                        { $arrayElemAt: ["$metadata.totalComments", 0] },
                        0
                    ]
                }
            }
        }
    ];

    const comments = await Comment.aggregate(pipeline);

    return res
    .status(200)
    .json(
        new ApiResponse(200, comments, "Fetched all the comments successfully")
    )
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {content} = req.body
    const {videoId} = req.params

    // CHeck if video Id is valid or not
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    // Check if video exist in DB or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Bad request, Video doesn't exist")
    }

    if(!content){
        throw new ApiError(400, "Bad request, blank comment")
    }

    const comment = await Comment.create({
        content: content.trim(), video: videoId, owner: req.user._id
    });

    if(!comment){
        throw new ApiError(500, "Internal Error while creating comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {content} = req.body
    const {commentId} = req.params

    // CHeck if video Id is valid or not
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content){
        throw new ApiError(400, "Bad request, blank comment")
    }

    // Check if comment exist in DB or not
    let comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Bad request, comment doesn't exist")
    }

    // chcek if correct user is updating comment or not
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad authentication, only owner can update comment")
    }

    comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {content: content.trim()}
        },
        {
            returnDocument: 'after'
        }
    )

    return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    // CHeck if video Id is valid or not
    if(!mongoose.isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    // Check if comment exist in DB or not
    let comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Bad request, comment doesn't exist")
    }

    // chcek if correct user is deleting comment or not
    if(!comment.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad authentication, only owner can delete comment")
    }

    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(new ApiResponse(200, comment, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}