import {Router} from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"

const tweetRouter = Router();

tweetRouter.route('/create').post(verifyJWT, createTweet);
tweetRouter.route('/:userId').get(verifyJWT, getUserTweets);
tweetRouter.route('/:tweetId').patch(verifyJWT, updateTweet);
tweetRouter.route('/:tweetId').delete(verifyJWT, deleteTweet);

export default tweetRouter;