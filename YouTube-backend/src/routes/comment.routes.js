import { Router } from "express";

import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/auth.middleware.js";

const commentsRouter = Router();

commentsRouter.route('/:videoId').get(verifyJWT, getVideoComments);
commentsRouter.route('/:videoId').post(verifyJWT, addComment);
commentsRouter.route('/:commentId').patch(verifyJWT, updateComment);
commentsRouter.route('/:commentId').delete(verifyJWT, deleteComment);

export default commentsRouter;