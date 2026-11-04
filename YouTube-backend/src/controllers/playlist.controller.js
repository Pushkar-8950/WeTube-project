import { Aggregate } from "mongoose"
import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/APIResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist
    
    // Verify, who is creating playlist (only logged in user allowed)
    // Check if name and description are provided or not
    // create playlist 
    // return response

    if(!name || !description){
        throw new ApiError(400, "Bad Request, name or description is not provided")
    }

    const playlist = await Playlist.create({
        name, description, owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500, "Unable to create playlist")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, playlist, "Playlist created Successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    
    // validate userID
    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400, 'Bad req, invalid user ID')
    }

    const pipeline = [];

    pipeline.push(
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }
    )

    const playlists = await Playlist.aggregate(pipeline);

    if(playlists.length === 0){
        throw new ApiError(400, "No playlist exist for provided user")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "Playlist fetched successfully")
    )
})


const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Bad request, invalid playlist ID")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video doesn't exist in DB")
    }

    const playlist = await Playlist.findById(playlistId).select('-createdAt -updatedAt -description');

    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }

    // IF playlist exist, then only owner can make changes (add videos)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad request, only owner can make changes")
    }

    if(playlist.videos.some(id => id.equals(videoId))){
        throw new ApiError(400, "Video already exist in playlist")
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "video doesn't exist in DB")
    }

    const playlist = await Playlist.findById(playlistId).select('-createdAt -updatedAt -description');

    if(!playlist){
        throw new ApiError(404, "Playlist doesn't exist")
    }

    // IF playlist exist, then only owner can make changes (add videos)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad request, only owner can make changes")
    }

    if(!playlist.videos.some(id => id.equals(videoId))){
        throw new ApiError(400, "video doesn't exist inside playlist")
    }

    playlist.videos = playlist.videos.filter(
        id => !id.equals(videoId)
    );

    await playlist.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const playlist = await Playlist.findById(playlistId);

    // IF playlist exist, then only owner can make changes (add videos)
    if(!playlist.owner.equals(req.user._id)){
        throw new ApiError(403, "Bad request, only owner can delete playlist")
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

     if(!mongoose.isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid Playlist ID")
    }

    const updateFields = {};

    if(name){
        updateFields.name = name;
    }

    if(description){
        updateFields.description = description;
    }

    const newPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: updateFields
        },
        {
            new: true,
            runValidators: true
        }
    )

    if (!newPlaylist) {
        throw new ApiError(
            404,
            "Playlist doesn't exist or you're not the owner"
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, newPlaylist, "Playlist Updated Successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}