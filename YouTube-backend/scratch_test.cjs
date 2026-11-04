const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://Pushkar:Pushkar_1234@pushkar.ick6z0k.mongodb.net/videotube').then(async () => {
    const res = await mongoose.connection.collection('videos').aggregate([
        { $match: { isPublished: true } },
        { $sort: { createdAt: -1, _id: -1 } },
        { $skip: 0 },
        { $limit: 8 },
        { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'ownerDetails' } },
        { $addFields: { owner: { $arrayElemAt: ['$ownerDetails', 0] } } },
        { $project: { videoTitle: 1, title: 1, thumbnail: 1, duration: 1, views: 1, owner: { username: 1, avatarImage: 1, fullName: 1 }, createdAt: 1 } }
    ]).toArray();
    console.log('RESULT_FIRST_TWO:', JSON.stringify(res.slice(0, 2), null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
