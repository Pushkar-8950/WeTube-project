import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"

import {
    getChannelStats, 
    getChannelVideos
} from "../controllers/dashboard.controller.js"

const dashboardRouter = Router();

dashboardRouter.route('/get-channel-stats/:channelId').get(verifyJWT, getChannelStats);
dashboardRouter.route('/get-channel-videos/:channelId').get(verifyJWT, getChannelVideos);

export default dashboardRouter;