import mongoose, {Schema} from 'mongoose'

const subscriptionsSchema = new Schema({

    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, {timestamps: true})

// Compound unique index (same user same channel ko duplicate subscribe nahi kar sakta.)
subscriptionsSchema.index(
    { subscriber: 1, channel: 1 },
    { unique: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionsSchema);