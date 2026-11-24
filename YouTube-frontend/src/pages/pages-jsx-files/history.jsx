import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import { History as HistoryIcon, Clock, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import "../pages-css-files/history.css";

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

function HistoryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [historyVideos, setHistoryVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const res = await api.get('/users/history');
                if (res.data?.success) {
                    setHistoryVideos(res.data.data || []);
                }
            } catch (err) {
                console.error("Failed to fetch history:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [user]);

    if (!user) {
        return (
            <div className="history-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="history-login-prompt">
                    <HistoryIcon size={48} color="var(--accent-secondary, #c68a5c)" />
                    <h2>Keep track of what you watch</h2>
                    <p>Watch history isn't viewable when signed out.</p>
                    <Link to="/login" className="history-primary-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="history-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="history-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="history-main">
                    <header className="history-header">
                        <h2>Watch History</h2>
                        <span className="history-count">{historyVideos.length} videos</span>
                    </header>

                    {loading ? (
                        <div className="history-loading">Loading watch history...</div>
                    ) : historyVideos.length > 0 ? (
                        <div className="history-videos-list">
                            {historyVideos.map((video, idx) => {
                                const owner = video.owner || {};
                                return (
                                    <article
                                        key={video._id || idx}
                                        className="history-video-card"
                                        onClick={() => navigate(`/videoPlayPage/${video._id}`)}
                                    >
                                        <div className="history-thumb-wrap">
                                            <img
                                                src={video.thumbnail || "/placeholder-video.jpg"}
                                                alt={video.videoTitle}
                                                className="history-thumb-img"
                                            />
                                            <span className="history-duration">
                                                {formatDuration(video.duration)}
                                            </span>
                                        </div>

                                        <div className="history-video-details">
                                            <h3 className="history-title">{video.videoTitle}</h3>

                                            <div
                                                className="history-channel-row"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (owner.username) navigate(`/channel/${owner.username}`);
                                                }}
                                            >
                                                <span>{owner.fullName || owner.username || "Creator"}</span>
                                            </div>

                                            <div className="history-stats">
                                                <span>{video.views || 0} views</span>
                                                <span>•</span>
                                                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <p className="history-desc-snippet">{video.description}</p>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="history-empty">
                            <HistoryIcon size={48} color="var(--accent-secondary, #c68a5c)" />
                            <h3>No watch history yet</h3>
                            <p>Videos you watch will show up here.</p>
                            <Link to="/" className="history-primary-btn">Explore Videos</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default HistoryPage;
