import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import { ThumbsUp, Play, Lock } from "lucide-react";
import "../pages-css-files/likedVideos.css";

// Helper for duration
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

function LikedVideosPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [likedVideos, setLikedVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/likes/get-liked-videos');
                if (res.data?.success) {
                    setLikedVideos(res.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch liked videos:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedVideos();
    }, [user]);

    if (!user) {
        return (
            <div className="liked-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="liked-login-prompt">
                    <ThumbsUp size={48} color="var(--accent-secondary, #c68a5c)" />
                    <h2>Keep track of videos you like</h2>
                    <p>Sign in to access videos you've liked on WeTube.</p>
                    <Link to="/login" className="liked-primary-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    const firstVideo = likedVideos[0]?.videoDetails;

    return (
        <div className="liked-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="liked-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="liked-main">
                    {/* Left Sidebar Card (YouTube Playlist Hero) */}
                    <aside className="liked-playlist-hero">
                        <div className="hero-thumb-box">
                            {firstVideo ? (
                                <img src={firstVideo.thumbnail} alt="" className="hero-thumb-img" />
                            ) : (
                                <div className="hero-thumb-fallback">
                                    <ThumbsUp size={48} />
                                </div>
                            )}
                        </div>

                        <h2>Liked Videos</h2>
                        <div className="hero-author-row">
                            <span>{user.fullName || user.username}</span>
                        </div>
                        <div className="hero-meta-row">
                            <span>{likedVideos.length} videos</span>
                            <span>•</span>
                            <span className="privacy-badge"><Lock size={12} /> Private</span>
                        </div>

                        {firstVideo && (
                            <button
                                className="btn-play-all"
                                onClick={() => navigate(`/videoPlayPage/${firstVideo._id}`)}
                            >
                                <Play size={18} fill="currentColor" />
                                <span>Play All</span>
                            </button>
                        )}
                    </aside>

                    {/* Right Videos List */}
                    <section className="liked-videos-content">
                        {loading ? (
                            <div className="liked-loading">Loading liked videos...</div>
                        ) : likedVideos.length > 0 ? (
                            <div className="liked-list">
                                {likedVideos.map((item, idx) => {
                                    const video = item.videoDetails;
                                    if (!video) return null;

                                    return (
                                        <article
                                            key={video._id || idx}
                                            className="liked-video-row"
                                            onClick={() => navigate(`/videoPlayPage/${video._id}`)}
                                        >
                                            <span className="liked-index">{idx + 1}</span>

                                            <div className="liked-thumb-wrap">
                                                <img src={video.thumbnail || "/placeholder-video.jpg"} alt="" />
                                                <span className="liked-duration">
                                                    {formatDuration(video.duration)}
                                                </span>
                                            </div>

                                            <div className="liked-meta">
                                                <h4 className="liked-title">{video.videoTitle}</h4>
                                                <p className="liked-channel-name">Creator</p>
                                                <div className="liked-stats">
                                                    <span>{video.views || 0} views</span>
                                                    <span>•</span>
                                                    <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="liked-empty">
                                <ThumbsUp size={40} color="var(--accent-secondary, #c68a5c)" />
                                <h3>No liked videos yet</h3>
                                <p>Videos you like will be saved here for easy access.</p>
                                <Link to="/" className="liked-primary-btn">Browse Home Feed</Link>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default LikedVideosPage;
