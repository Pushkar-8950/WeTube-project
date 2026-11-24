import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Clock, ListPlus, Share2 } from "lucide-react";
import '../components-css-files/videoCard.css';

// Helper to format seconds into MM:SS or HH:MM:SS
const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const sec = Math.floor(seconds);
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Helper to format views
const formatViews = (views) => {
    if (!views && views !== 0) return "0 views";
    const num = Number(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
    return `${num} ${num === 1 ? "view" : "views"}`;
};

// Helper to format relative time
const formatTimeAgo = (dateStr) => {
    if (!dateStr) return "";
    const created = new Date(dateStr);
    const now = new Date();
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
    if (diffMonths > 0) return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
    if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffMins > 0) return `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
    return "Just now";
};

function VideoCard({ video, onAddToPlaylist }) {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const title = video?.videoTitle || video?.title || "Untitled Video";
    const ownerName = video?.owner?.fullName || video?.owner?.username || "Creator";
    const channelUsername = video?.owner?.username;
    const avatar = video?.owner?.avatarImage;

    const handleCardClick = () => {
        navigate(`/videoPlayPage/${video._id}`);
    };

    const handleChannelClick = (e) => {
        e.stopPropagation();
        if (channelUsername) {
            navigate(`/channel/${channelUsername}`);
        }
    };

    const handleShare = (e) => {
        e.stopPropagation();
        const url = `${window.location.origin}/videoPlayPage/${video._id}`;
        navigator.clipboard?.writeText(url);
        alert("Video link copied to clipboard!");
        setMenuOpen(false);
    };

    return (
        <article className="video-card-container" onClick={handleCardClick}>
            <div className="video-thumbnail-wrapper">
                <img
                    src={video.thumbnail || "/placeholder-video.jpg"}
                    alt={title}
                    className="thumbnail-img"
                    loading="lazy"
                />
                <span className="duration-badge">
                    {formatDuration(video.duration)}
                </span>
            </div>

            <div className="video-info-row">
                <div className="channel-avatar-wrap" onClick={handleChannelClick}>
                    {avatar ? (
                        <img src={avatar} alt={ownerName} className="channel-avatar-img" />
                    ) : (
                        <div className="channel-avatar-fallback">
                            {ownerName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="video-text-meta">
                    <h3 className="video-title" title={title}>
                        {title}
                    </h3>

                    <p className="channel-name-line" onClick={handleChannelClick} title={ownerName}>
                        {ownerName}
                    </p>

                    <div className="video-stats-line">
                        <span>{formatViews(video.views)}</span>
                        <span className="dot-divider">•</span>
                        <span>{formatTimeAgo(video.createdAt)}</span>
                    </div>
                </div>

                <div className="card-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                    <button
                        className="card-menu-trigger"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="More options"
                    >
                        <MoreVertical size={18} />
                    </button>

                    {menuOpen && (
                        <div className="card-dropdown-menu">
                            <button onClick={handleShare}>
                                <Share2 size={16} />
                                <span>Share link</span>
                            </button>
                            {onAddToPlaylist && (
                                <button onClick={() => { onAddToPlaylist(video); setMenuOpen(false); }}>
                                    <ListPlus size={16} />
                                    <span>Save to playlist</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

export default VideoCard;
