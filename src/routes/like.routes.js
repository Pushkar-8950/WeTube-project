import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { 
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
 } from "../controllers/like.controller.js";

 const likeRouter = Router();

 likeRouter.route('/toggle-comment-like/:commentId').patch(verifyJWT, toggleCommentLike);
 likeRouter.route('/toggle-tweet-like/:tweetId').patch(verifyJWT, toggleTweetLike);
 likeRouter.route('/toggle-video-like/:videoId').patch(verifyJWT, toggleVideoLike);
 likeRouter.route('/get-liked-videos').get(verifyJWT, getLikedVideos);
 
 export default likeRouter;