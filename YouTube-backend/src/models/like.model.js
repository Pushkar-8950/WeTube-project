import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema({
    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }

}, { timestamps: true });

// Same video 1 se jyada bar like na ho ske
likeSchema.index(
    { likedBy: 1, video: 1 },
    {
        unique: true,
        partialFilterExpression: {
            video: { $type: "objectId" }
        }
    }
);

likeSchema.index(
    { likedBy: 1, comment: 1 },
    {
        unique: true,
        partialFilterExpression: {
            comment: { $type: "objectId" }
        }
    }
);

likeSchema.index(
    { likedBy: 1, tweet: 1 },
    {
        unique: true,
        partialFilterExpression: {
            tweet: { $type: "objectId" }
        }
    }
);


export const Like = mongoose.model("Like", likeSchema);