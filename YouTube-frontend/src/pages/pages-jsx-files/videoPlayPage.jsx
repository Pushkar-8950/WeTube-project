import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import VideoPlayer from "../../components/components-jsx-files/videoPlayer";
import Comments from "../../components/components-jsx-files/commentSection";
import AddToPlaylistModal from "../../components/components-jsx-files/AddToPlaylistModal";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import '../pages-css-files/videoPlayPage.css';

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

// Helper for views
const formatViews = (views) => {
    if (!views && views !== 0) return "0 views";
    const num = Number(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M views`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K views`;
    return `${num} views`;
};

const VideoPlayPage = () => {
    const { videoId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [recommendedVideos, setRecommendedVideos] = useState([]);
    const [loadingRecs, setLoadingRecs] = useState(false);
    const [playlistModalOpen, setPlaylistModalOpen] = useState(false);

    // Fetch Recommended Videos
    useEffect(() => {
        const fetchRecommended = async () => {
            setLoadingRecs(true);
            try {
                const res = await api.get('/videos/get-home-videos?page=1&limit=12');
                const list = res.data?.data?.videos || [];
                // Filter out current video
                setRecommendedVideos(list.filter(v => v._id !== videoId));
            } catch (err) {
                console.error("Error fetching recommended videos:", err);
            } finally {
                setLoadingRecs(false);
            }
        };

        fetchRecommended();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [videoId]);

    return (
        <div className="watch-page-wrapper">
            <HomeNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            <div className="watch-layout">
                {isSidebarOpen && (
                    <div className="watch-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}>
                        <HomeSidebar isSidebarOpen={true} />
                    </div>
                )}

                <div className="watch-content-container">
                    {/* Primary Left Column: Video, Details & Comments */}
                    <main className="watch-primary-column">
                        <VideoPlayer
                            videoId={videoId}
                            onOpenPlaylistModal={() => setPlaylistModalOpen(true)}
                        />

                        <section className="watch-comments-wrapper">
                            <Comments
                                videoId={videoId}
                                avatarImage={user?.avatarImage || ""}
                            />
                        </section>
                    </main>

                    {/* Secondary Right Column: Recommended Videos */}
                    <aside className="watch-secondary-column">
                        <h3 className="recommended-heading">Related Videos</h3>

                        <div className="recommended-video-list">
                            {recommendedVideos.map(rec => (
                                <article
                                    key={rec._id}
                                    className="recommended-card"
                                    onClick={() => navigate(`/videoPlayPage/${rec._id}`)}
                                >
                                    <div className="rec-thumb-wrap">
                                        <img src={rec.thumbnail} alt={rec.videoTitle} className="rec-thumb-img" />
                                        <span className="rec-duration">
                                            {formatDuration(rec.duration)}
                                        </span>
                                    </div>

                                    <div className="rec-details">
                                        <h4 className="rec-title" title={rec.videoTitle}>
                                            {rec.videoTitle}
                                        </h4>
                                        <p className="rec-channel">
                                            {rec.owner?.fullName || rec.owner?.username || "Creator"}
                                        </p>
                                        <p className="rec-stats">
                                            {formatViews(rec.views)} • {new Date(rec.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </aside>
                </div>
            </div>

            {/* Save to Playlist Modal */}
            <AddToPlaylistModal
                isOpen={playlistModalOpen}
                onClose={() => setPlaylistModalOpen(false)}
                videoId={videoId}
            />
        </div>
    );
};

export default VideoPlayPage;
