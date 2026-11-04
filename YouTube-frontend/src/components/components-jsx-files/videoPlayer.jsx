
import '../components-css-files/videoPlayer.css';
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    Download,
    MoreHorizontal,
    Sparkles
} from "lucide-react";

/*
    props: {
        video: {
            createdAt: "2026-10-28T16:30:29.864Z"
            duration: 92.166667
            owner: {
                    username: 'sunil_kumar', 
                    fullName: 'Sunil Kumar', 
                    avatarImage: 'http://res.cloudinary.com/bcplcdtk/image/upload/v1792653606/oyoal5ms2cb5xdo4cyof.png'
            }
            thumbnail: "http://res.cloudinary.com/bcplcdtk/image/upload/v1793205028/qwznqqphnfikgujgjai8.png"
            videoFile: "http://res.cloudinary.com/bcplcdtk/video/upload/v1793205027/u6ucziee9m6fd3jyotyp.mp4"
            videoTitle: "DB Video"
            views: 0
            _id: "6ae22325010a99970dd1b944"
        }
    }

*/
function VideoPlayer(props) {

    const video = props.video;

    return (
        <div className="video-player-section">

            {/* Video player */}
            <div className="video-container">
                <video
                    className="main-video"
                    src={video.videoFile}
                    poster={video.thumbnail}
                    controls
                />
            </div>

            {/* Video title */}
            <h2 className="main-video-title">
                {video.videoTitle}
            </h2>

            {/* Channel information and video actions */}
            <div className="video-channel-actions">

                {/* Channel information */}
                <div className="video-channel-info">

                    <img
                        className="video-channel-avatar"
                        src={video.owner?.avatarImage}
                        alt="Channel avatar"
                    />

                    <div className="video-channel-details">
                        <h4>{video.owner?.username}</h4>
                        <p>
                            {video.owner?.subscribersCount ?? 0} subscribers
                        </p>
                    </div>

                    <button className="subscribe-btn">
                        Subscribe
                    </button>

                </div>

                {/* Video actions */}
                <div className="video-actions">

                    <div className="like-dislike-group">
                        <button className="video-action-btn">
                            <ThumbsUp size={21} />
                            <span>{video.totalLikes ?? 0}</span>
                        </button>

                        <div className="action-divider"></div>

                        <button className="video-action-btn dislike-action">
                            <ThumbsDown size={21} />
                        </button>
                    </div>

                    <button className="round-action-btn">
                        <Share2 size={21} />
                        <span>Share</span>
                    </button>

                    <button className="round-action-btn">
                        <Sparkles size={21} />
                    </button>

                    <button className="round-action-btn">
                        <Download size={21} />
                    </button>

                    <button className="round-action-btn">
                        <MoreHorizontal size={23} />
                    </button>

                </div>

            </div>

            {/* Video description */}
            <div className="video-description">

                <div className="video-description-stats">
                    <span>{video.views ?? 0} views</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>

                    {video.tags?.map((tag, index) => (
                        <span key={index} className="video-tag">
                            #{tag}
                        </span>
                    ))}
                </div>

                <div className="video-description-content">
                    {video.description}
                </div>

                <button className="description-more-btn">
                    ...more
                </button>

            </div>

        </div>
    );
}

export default VideoPlayer;
