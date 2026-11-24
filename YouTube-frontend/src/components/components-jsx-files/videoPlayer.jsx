import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api';
import { useAuth } from "../../context/AuthContext";
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    ListPlus,
    Bell,
    Check,
    MoreHorizontal
} from "lucide-react";
import '../components-css-files/videoPlayer.css';

function VideoPlayer({ videoId, onOpenPlaylistModal }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [video, setVideo] = useState(null);
    const [totalLikes, setTotalLikes] = useState(0);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isVideoLiked, setIsVideoLiked] = useState(false);
    const [isVideoDisliked, setIsVideoDisliked] = useState(false);
    const [totalSubscribers, setTotalSubscribers] = useState(0);

    const [loading, setLoading] = useState(true);
    const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
    const [isLikingVideo, setIsLikingVideo] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        const fetchVideoData = async () => {
            try {
                // Fetch video details
                const videoRes = await api.get(`/videos/get-video-by-id/${videoId}`);
                const videoData = videoRes.data?.data?.[0];

                if (!videoData) return;
                if (!isMounted) return;

                setVideo(videoData);
                setIsSubscribed(videoData.subscribed?.length > 0);

                // Fetch likes count, like status, subscribers count in parallel
                const [subCountRes, likesRes, likeStatusRes] = await Promise.all([
                    api.get(`/subscriptions/get-subscribers-count/${videoData.owner}`),
                    api.get(`/likes/get-total-likes-on-video/${videoId}`),
                    user ? api.get(`/likes/is-video-liked/${videoId}`) : Promise.resolve({ data: { data: false } })
                ]);

                if (!isMounted) return;

                setTotalSubscribers(subCountRes.data?.data || 0);
                setTotalLikes(likesRes.data?.data?.[0]?.totalLikes || 0);
                setIsVideoLiked(likeStatusRes.data?.data || false);
            } catch (err) {
                console.error("Error loading video details:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchVideoData();

        return () => {
            isMounted = false;
        };
    }, [videoId, user]);

    const toggleSubscription = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsSubscriptionLoading(true);
        try {
            await api.patch(`/subscriptions/toggle/${video.owner}`);
            setIsSubscribed(prev => !prev);
            setTotalSubscribers(prev => isSubscribed ? Math.max(0, prev - 1) : prev + 1);
        } catch (err) {
            console.error("Error toggling subscription:", err);
        } finally {
            setIsSubscriptionLoading(false);
        }
    };

    const handleLike = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setIsLikingVideo(true);
        try {
            await api.patch(`/likes/toggle-video-like/${videoId}`);
            const newLiked = !isVideoLiked;
            setIsVideoLiked(newLiked);
            setIsVideoDisliked(false);
            setTotalLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
        } catch (err) {
            console.error("Error liking video:", err);
        } finally {
            setIsLikingVideo(false);
        }
    };

    const handleDislike = () => {
        if (isVideoLiked) {
            setIsVideoLiked(false);
            setTotalLikes(prev => Math.max(0, prev - 1));
        }
        setIsVideoDisliked(prev => !prev);
    };

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: video?.videoTitle,
                    url
                });
            } catch (err) {
                if (err.name !== "AbortError") {
                    navigator.clipboard.writeText(url);
                    alert("Video link copied to clipboard!");
                }
            }
        } else {
            navigator.clipboard.writeText(url);
            alert("Video link copied to clipboard!");
        }
    };

    if (loading) {
        return (
            <div className="video-player-loading-skeleton">
                <div className="skeleton-player-screen"></div>
                <div className="skeleton-player-title"></div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="video-not-found-msg">
                <h2>Video not found or has been removed</h2>
                <button onClick={() => navigate('/')} className="btn-return-home">
                    Back to Home
                </button>
            </div>
        );
    }

    const channelUsername = video.ownerDetails?.[0]?.username;
    const channelAvatar = video.ownerDetails?.[0]?.avatarImage;

    return (
        <div className="video-player-section">
            {/* Native HTML5 Video Element with Controls */}
            <div className="video-container">
                <video
                    className="main-video"
                    src={video.videoFile}
                    poster={video.thumbnail}
                    controls
                    autoPlay
                />
            </div>

            {/* Video Title */}
            <h1 className="main-video-title">
                {video.videoTitle}
            </h1>

            {/* Channel Info & Actions Bar */}
            <div className="video-channel-actions">
                <div className="video-channel-info">
                    <img
                        className="video-channel-avatar"
                        src={channelAvatar || "/default-avatar.png"}
                        alt={channelUsername}
                        onClick={() => channelUsername && navigate(`/channel/${channelUsername}`)}
                    />

                    <div className="video-channel-details">
                        <h4 onClick={() => channelUsername && navigate(`/channel/${channelUsername}`)}>
                            {channelUsername}
                        </h4>
                        <p>{totalSubscribers} subscribers</p>
                    </div>

                    <button
                        className={`subscribe-btn ${isSubscribed ? "subscribed" : ""}`}
                        onClick={toggleSubscription}
                        disabled={isSubscriptionLoading}
                    >
                        {isSubscribed ? (
                            <>
                                <Check size={16} />
                                <span>Subscribed</span>
                            </>
                        ) : (
                            <>
                                <Bell size={16} />
                                <span>Subscribe</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="video-actions">
                    <div className="like-dislike-group">
                        <button
                            className={`video-action-btn ${isVideoLiked ? "active-like" : ""}`}
                            onClick={handleLike}
                            disabled={isLikingVideo}
                            title="I like this"
                        >
                            <ThumbsUp size={18} fill={isVideoLiked ? "currentColor" : "none"} />
                            <span>{totalLikes}</span>
                        </button>

                        <div className="action-divider"></div>

                        <button
                            className={`video-action-btn dislike-action ${isVideoDisliked ? "active-dislike" : ""}`}
                            onClick={handleDislike}
                            title="I dislike this"
                        >
                            <ThumbsDown size={18} fill={isVideoDisliked ? "currentColor" : "none"} />
                        </button>
                    </div>

                    <button className="round-action-btn" onClick={handleShare} title="Share video">
                        <Share2 size={18} />
                        <span>Share</span>
                    </button>

                    <button
                        className="round-action-btn"
                        onClick={onOpenPlaylistModal}
                        title="Save to playlist"
                    >
                        <ListPlus size={18} />
                        <span>Save</span>
                    </button>
                </div>
            </div>

            {/* Video Description Box */}
            <div className="video-description">
                <div className="video-description-stats">
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>

                <div className={`video-description-content ${isDescriptionExpanded ? "expanded" : ""}`}>
                    {video.description}
                </div>

                {video.description?.length > 120 && (
                    <button
                        className="description-more-btn"
                        onClick={() => setIsDescriptionExpanded(prev => !prev)}
                    >
                        {isDescriptionExpanded ? "Show less" : "...more"}
                    </button>
                )}
            </div>
        </div>
    );
}

export default VideoPlayer;
