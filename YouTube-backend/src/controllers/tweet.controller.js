import mongoose from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content} = req.body;

    if(!content?.trim()){
        throw new ApiError(400, "Bad request, tweet can't be blank")
    }

    // create tweet 
    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })

    if(!tweet){
        throw new ApiError(500, "Internal error, unable to create tweet")
    }

    return res.status(201).json(new ApiResponse(201, tweet, "Tweet Created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    // vaidate userID
    if(!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Bad request, invalid user ID");
    
    // Check if user exist or not
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "user doesn't exist");
    }

    const pipeline = [
        {
            $match: {
                owner : new mongoose.Types.ObjectId(userId)
            }
        }
    ]

    const tweets = await Tweet.aggregate(pipeline);

    return res.status(200).json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params;
    const {newContent} = req.body;
    
    if(!newContent?.trim()){
        throw new ApiError(400, "Bad request, content can't be empty")
    }

    // validate iD
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Bad request, invalid tweet Id")
    }

    // check if tweet exist or not 
    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError(404, "Tweet doesn't exist")
    }

    // if tweet exist then only owner can update the tweet
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad authentication, only owner can update the tweet")
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content: newContent.trim()
        },
        {
            new: true,
            runValidators: true // for schema validations 
        }
    )

    return res.status(200).json(new ApiResponse(200, newTweet, "Tweet Updated successfully"));
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params;

    // validate iD
    if(!mongoose.isValidObjectId(tweetId)){
        throw new ApiError(400, "Bad request, invalid tweet Id")
    }

    // check if tweet exist or not 
    const tweet = await Tweet.findById(tweetId);

    if(!tweet) {
        throw new ApiError(404, "Tweet doesn't exist")
    }

    // if tweet exist then only owner can delete the tweet
    if(!tweet.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad authentication, only owner can delete the tweet")
    }

    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}