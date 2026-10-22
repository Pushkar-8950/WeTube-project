import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// It tells Express to read JSON data sent by the client and put it inside req.body
app.use(express.json({limit: '16kb'}))

// It tells Express to read URL-encoded data sent by the client and put it inside req.body
app.use(express.urlencoded({extended: true, limit: '16kb'}))

// It tells Express to serve static files from the 'public' directory
app.use(express.static('public'));

// It tells Express to parse(convert raw strings sent by client into JavaScript readable objects)
app.use(cookieParser());

// routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import playlistRouter from "./routes/playlist.routes.js";
import commentsRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js"
import likeRouter from "./routes/like.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js"

// routes declaration
app.use('/api/v1/users', userRouter); // activates userRouter and passes control to user.routes.js
app.use("/api/v1/videos", videoRouter); // activates videoRouter and passes control to video.routes.js
app.use("/api/v1/playlist", playlistRouter); 
app.use("/api/v1/comments", commentsRouter); 
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export {app}    