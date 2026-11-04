import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"

import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js" 

const subscriptionRouter = Router();
subscriptionRouter.route('/toggle/:channelId').patch(verifyJWT, toggleSubscription);
subscriptionRouter.route('/get-subscribers/:channelId').get(verifyJWT, getUserChannelSubscribers);
subscriptionRouter.route('/get-subscribed-channels/:subscriberId').get(verifyJWT, getSubscribedChannels);

export default subscriptionRouter;
