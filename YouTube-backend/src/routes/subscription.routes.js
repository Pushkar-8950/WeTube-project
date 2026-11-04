import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getSubscribersCount
} from "../controllers/subscription.controller.js" 

const subscriptionRouter = Router();
subscriptionRouter.route('/toggle/:channelId').patch(verifyJWT, toggleSubscription);
subscriptionRouter.route('/get-subscribers/:channelId').get(verifyJWT, getUserChannelSubscribers);
subscriptionRouter.route('/get-subscribed-channels/:subscriberId').get(verifyJWT, getSubscribedChannels);
subscriptionRouter.route('/get-subscribers-count/:channelId').get(getSubscribersCount)

export default subscriptionRouter;
