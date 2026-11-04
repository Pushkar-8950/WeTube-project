import { Router } from "express";
import { 
    addVideoToPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getPlaylistById, 
    getUserPlaylists, 
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const playlistRouter = Router();

playlistRouter.route('/create').post(verifyJWT, createPlaylist);
playlistRouter.route('/get-user-playlist/:userId').get(verifyJWT, getUserPlaylists);
playlistRouter.route('/get-playlist/:playlistId').get(verifyJWT, getPlaylistById);
playlistRouter.route('/add-video/:playlistId/:videoId').patch(verifyJWT, addVideoToPlaylist);
playlistRouter.route('/remove-video/:playlistId/:videoId').patch(verifyJWT, removeVideoFromPlaylist);
playlistRouter.route('/:playlistId').delete(verifyJWT, deletePlaylist);
playlistRouter.route('/update/:playlistId').patch(verifyJWT, updatePlaylist);

export default playlistRouter;