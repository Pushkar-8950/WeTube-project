import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscriptions.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    // validate channel ID
    // Check if channel / user exist or not
    // Check if user is not trying to subscribe himself
    // Find one entry in subsciptions where subscriber == req.user._id && channel == channelId
    // If it exists, means user has already subscribed to the channel and delete this entry from subscriptions
    // if it doesn't exists, then add a entry 
    // Check if entry is created successfully or not
    // return response

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Bad request, invalid channel ID")
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel doesn't exist")
    }

    if (channelId === req.user._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to yourself");
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(subscription){

        // channel is already subscribed by the user, delete the entry
        await Subscription.findOneAndDelete(
            {
                subscriber: req.user._id,
                channel: channelId
            }
        )

        return res.status(200).json(
            new ApiResponse(200, subscription, "Channel Unsubscribed successfully")
        )

    } else {

        const newSubscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        if(!newSubscription){
            throw new ApiError(500, "Unable to subscribe to the channel")
        }

        return res
        .status(201)
        .json(
            new ApiResponse(201, newSubscription, "Channel subscribed successfully")
        )
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    // Validate channel ID
    // Check if channel/user exist or not
    // Only, the owner can see the subscribers of his channel
    // Using pipeline, return all the subscription entries where channel === req.user._id
    // return response  

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Bad request, invalid channel ID")
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel doesn't exist")
    }

    if(channelId !== req.user._id.toString()){
        throw new ApiError(403, "Bad authentication, only owner can see the subscribers")
    }

    const pipeline = [
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "SubscriberDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            fullName: 1,
                            avatarImage: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$SubscriberDetails"
        },
        {
            $project: {
                _id: 1,
                subscriber: 1,
                channel: 1,
                SubscriberDetails: 1
            }
        }
    ]

    const subscribers = await Subscription.aggregate(pipeline);

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    // validate subscriber ID
    // check if subscriber/user exist or not
    // also, only subscriber can see to whom he has subscribed so add validation (subscriberId === req.user._id)
    // using pipeline, fetch all the channels and their details

    if(!mongoose.isValidObjectId(subscriberId)){
        throw new ApiError(400, "Bad request, invalid subcriber ID")
    }

    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(404, "Subscriber doesn't exist")
    }

    if(subscriberId !== req.user._id.toString()){
        throw new ApiError(403, "Bad authentication, only subscriber can see the channels subscribed")
    }

    const pipeline = [
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "ChannelDetails",
                pipeline: [
                    {
                        $project: {
                             _id: 0,
                            username: 1,
                            email: 1,
                            fullName: 1,
                            avatarImage: 1,
                            coverImage: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$ChannelDetails"
        },
        {
            $project: {
                 _id: 1,
                ChannelDetails: 1
            }
        }
    ]

    const channels = await Subscription.aggregate(pipeline);

    return res
    .status(200)
    .json(
        new ApiResponse(200, channels, "Channels fetched successfully")
    ) 
})

const getSubscribersCount = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    // Validate channel ID
    // Check if channel/user exist or not

    if(!mongoose.isValidObjectId(channelId)){
        throw new ApiError(400, "Bad request, invalid channel ID")
    }

    const channel = await User.findById(channelId);
    if(!channel){
        throw new ApiError(404, "Channel doesn't exist")
    }

    const response = await Subscription.countDocuments({
            channel: new mongoose.Types.ObjectId(channelId)
    })


    return res.status(200).json(new ApiResponse(200, response, "Subscriber Count fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscribersCount
}