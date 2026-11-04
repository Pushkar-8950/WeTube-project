import mongoose from "mongoose";

await mongoose.connect("mongodb+srv://Pushkar:Pushkar_1234@pushkar.ick6z0k.mongodb.net/videotube");

const res = await mongoose.connection.collection("videos").aggregate([
  { $match: { isPublished: true } },
  { $sort: { createdAt: -1, _id: -1 } },
  { $lookup: { from: "users", localField: "owner", foreignField: "_id", as: "ownerDetails" } },
  { $addFields: { owner: { $arrayElemAt: ["$ownerDetails", 0] } } },
  { $project: { videoTitle: 1, thumbnail: 1, duration: 1, views: 1, owner: { username: 1, avatarImage: 1, fullName: 1 }, createdAt: 1 } }
]).toArray();

console.log("TOTAL_VIDEOS:", res.length);
res.forEach((v, i) => {
  console.log(`Video ${i + 1}: title="${v.videoTitle}" hasOwner=${!!v.owner} username=${v.owner?.username}`);
});

process.exit(0);
