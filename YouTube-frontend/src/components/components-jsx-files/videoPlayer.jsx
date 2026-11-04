
import '../components-css-files/videoPlayer.css';
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    Download,
    MoreHorizontal,
    Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

function VideoPlayer(props) {

    const navigate = useNavigate();

    const videoId = props.videoId;

     // get video detailss inside a response matching videoId
    const [totalLikes, setTotalLikes] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isVideoLiked, setIsVideoLiked] = useState(false);
    const [views, setViews] = useState(0);
    const [createdAt, setCreatedAt] = useState("");
    const [description, setDescription] = useState("");
    const [title, setTitle] = useState("");
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [channelId, setChannelId] = useState("");
    const [channelName, setChannelName] = useState("");
    const [videoFile, setVideoFile] = useState("");
    const [avatarImage, setAvatarImage] = useState("");
    const [thumbnail, setThumbnail] = useState("");

    const [loading, setLoading] = useState(false);
    const [isVideoDisliked, setIsVideoDisliked] = useState(false);

    // Response Format
    /*
        response format: 
            {
                "statusCode": 200,
                "data": [
                    {
                        "_id": "6ae1db039c9f52f857a3bb5b",
                        "videoTitle": "Sunil Jhatu Video",
                        "thumbnail": "http://res.cloudinary.com/bcplcdtk/image/upload/v1793186561/fqsugk5ffwll5hgdur6i.png",
                        "description": "about metrology project",
                        "duration": 46.033333,
                        "views": 0,
                        "videoFile": "http://res.cloudinary.com/bcplcdtk/video/upload/v1793205027/u6ucziee9m6fd3jyotyp.mp4",
                        "isPublished": true,
                        "owner": "6acc90521fdb1db40cba2d54",
                        "createdAt": "2026-10-28T11:22:43.143Z",
                        "updatedAt": "2026-10-28T11:22:43.143Z",
                        "__v": 0,
                        "ownerDetails": [
                            {
                                "username": "pushkar_sehrawat",
                                "avatarImage": "http://res.cloudinary.com/bcplcdtk/image/upload/v1791807538/zlgwvn5cq0frvfgfstln.png"
                            }
                        ],
                        "subscribed": [
                            {
                                "_id": "6aeb05324abd305c42a830bc",
                                "subscriber": "6ad9c04a747746fa962de3be",
                                "channel": "6acc90521fdb1db40cba2d54",
                                "createdAt": "2026-11-04T10:13:06.558Z",
                                "updatedAt": "2026-11-04T10:13:06.558Z",
                                "__v": 0
                            }
                        ]
                    }
                ],
                "message": "Video Fetched Successfully",
                "success": true
            }

    */
    
    useEffect(()=>{

        setIsSubscribed(false);
        setIsVideoLiked(false);
        setLoading(true);
        
        const fetchVideoData = async() => {

            try {

                // api call to get video details from backend
                const response1 = await api.get(`/videos/get-video-by-id/${videoId}`);
                const videoResponse = response1.data.data[0];

                console.log(videoResponse);

                // api calls to get subscribers, totalLikes and liked status
                
                    // Using promise.all(), all three request will run simultaneously reducing the overall time to load page. All three are independent of each other so we are able of combining them 
                const [response2, response3, response4] = await Promise.all([
                    api.get(`/subscriptions/get-subscribers-count/${videoResponse.owner}`),
                    api.get(`/likes/get-total-likes-on-video/${videoId}`),
                    api.get(`/likes/is-video-liked/${videoId}`)
                ]);

                const subscriberResponse = response2.data.data;
                const likesResponse = response3.data.data[0];
                const likeStatus = response4.data.data;

                console.log(videoResponse, subscriberResponse, likesResponse, likeStatus);

                // Initialize data
                setIsSubscribed(videoResponse.subscribed.length > 0);
                setViews(videoResponse.views);
                setCreatedAt(videoResponse.createdAt);
                setDescription(videoResponse.description);
                setTitle(videoResponse.videoTitle);
                setChannelId(videoResponse.owner);
                setChannelName(videoResponse.ownerDetails[0].username);
                setVideoFile(videoResponse.videoFile);
                setAvatarImage(videoResponse.ownerDetails[0].avatarImage);
                setThumbnail(videoResponse.thumbnail);
                setTotalSubscribers(subscriberResponse);
                setTotalLikes(likesResponse.totalLikes);
                setIsVideoLiked(likeStatus);

            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }

        fetchVideoData();

    }, [videoId]);

    // Logic for subscribe btn
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);

    const setSubscribeButton = () => {
        setIsSubscribed(prev=>!prev);
    }

    const toggleSubscription = async() => {

        setIsSubscriptionLoading(true); // to avoid multiple api request clicking btn multple times

        try {
            
            const response = await api.patch(`/subscriptions/toggle/${channelId}`);
            setSubscribeButton();

        } catch (error) {
            
            console.log(error);
        } finally {
            setIsSubscriptionLoading(false);
        }
    }

    // Logic for like and dislike btns
    const [isLikingVideo, setIsLikingVideo] = useState(false);
    const likeVideo = async() => {
        setIsLikingVideo(true);
        try{

            // api call for liking the video
            await api.patch(`/likes/toggle-video-like/${videoId}`);
            setIsVideoLiked(prev=>!prev);
            setIsVideoDisliked(false);
            setTotalLikes(prev=>isVideoLiked ? prev-1 : prev+1);
        } catch(error){
            console.log(error);
        } finally{
            setIsLikingVideo(false);
        }
    }

    const dislikeVideo = async () => {

        if(isVideoLiked){
            setIsVideoLiked(false);
            setTotalLikes(prev=>prev-1);
        } 

        setIsVideoDisliked(prev=>!prev);
    }


    // Conditional rendering
    if (loading) {
        return (
            <div className="video-loading">
                <div className="loader"></div>
                <p>Loading video...</p>
            </div>
        );
    }

    return (

        <div className="video-player-section">

            {/* Video player */}
            <div className="video-container">
                <video
                    className="main-video"
                    src={videoFile}
                    poster={thumbnail}
                    controls
                />
            </div>

            {/* Video title */}
            <h2 className="main-video-title">
                {title}
            </h2>

            {/* Channel information and video actions */}
            <div className="video-channel-actions">

                {/* Channel information */}
                <div className="video-channel-info">

                    <img
                        className="video-channel-avatar"
                        src={avatarImage}
                        alt="Channel avatar"
                        onClick={()=>navigate(`/channel/${channelId}`)}
                    />

                    <div className="video-channel-details">
                        <h4 
                            onClick={()=>navigate(`/channel/${channelId}`)}
                        >{channelName}</h4>
                        <p>
                            {totalSubscribers} subscribers
                        </p>
                    </div>

                    <button 
                        className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
                        onClick={toggleSubscription}
                        disabled={isSubscriptionLoading}
                    >
                        {isSubscriptionLoading
                            ? "Please wait..."
                            : isSubscribed ? "Unsubscribe" : "Subscribe"
                        }

                    </button>

                </div>

                {/* Video actions */}
                <div className="video-actions">

                    <div className="like-dislike-group">
                        <button className="video-action-btn">
                            <ThumbsUp 
                                size={21} 
                                fill={isVideoLiked ? "white" : "none"}
                                onClick={likeVideo}
                                disabled={isLikingVideo}
                            />
                            <span>{totalLikes}</span>
                        </button>

                        <div className="action-divider"></div>

                        <button className="video-action-btn dislike-action">
                            <ThumbsDown 
                                size={21} 
                                onClick={dislikeVideo}
                                fill={isVideoDisliked ? "white" : "none"}
                                disabled={isLikingVideo}
                            />
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
                    <span>{views} views</span>
                    <span>{new Date(createdAt).toLocaleDateString()}</span>

                    {/* {video.tags?.map((tag, index) => (
                        <span key={index} className="video-tag">
                            #{tag}
                        </span>
                    ))} */}
                </div>

                <div className="video-description-content">
                    {description}
                </div>

                <button className="description-more-btn">
                    ...more
                </button>

            </div>

        </div>
    );
}

export default VideoPlayer;
