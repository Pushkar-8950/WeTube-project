import { Router } from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { deleteVideo, getAllVideos, getVideoById, getVideosForHomepage, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const videoRouter = Router();

videoRouter.route('/get-all-videos').get(verifyJWT, getAllVideos);
videoRouter.route('/publish-video').post(
    verifyJWT,
    upload.fields([
        {
            name: "videoToPublish",
            maxCount: 1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
);


videoRouter.route('/get-video-by-id/:videoId').get(verifyJWT, getVideoById);
videoRouter.route('/update-video-details').patch(
    verifyJWT, 
    upload.single('newThumbnail'),
    updateVideo
);
videoRouter.route('/delete-video').delete(verifyJWT, deleteVideo);
videoRouter.route('/toggle-publish-status').patch(verifyJWT, togglePublishStatus);
videoRouter.route('/get-home-videos').get(getVideosForHomepage);

export default videoRouter;