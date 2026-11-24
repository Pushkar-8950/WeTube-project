import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import HomeNavbar from '../../components/components-jsx-files/HomeNavbar';
import HomeSidebar from '../../components/components-jsx-files/HomeSidebar';
import { Search as SearchIcon, Filter, Clock, Eye, AlertCircle } from 'lucide-react';
import '../pages-css-files/search.css';

// Helper to format duration
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

function SearchPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q') || searchParams.get('search_query') || '';

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setVideos([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/videos/get-all-videos?query=${encodeURIComponent(query)}&page=1&limit=25`);
                if (response.data?.success) {
                    setVideos(response.data.data || []);
                }
            } catch (err) {
                console.error("Search error:", err);
                setError(err.response?.data?.message || 'Failed to fetch search results');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    return (
        <div className="search-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="search-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="search-main-content">
                    <div className="search-header-row">
                        <h2>
                            Search results for <span className="query-highlight">"{query}"</span>
                        </h2>
                        <span className="results-count">{videos.length} videos found</span>
                    </div>

                    {loading ? (
                        <div className="search-skeleton-list">
                            {[1, 2, 3, 4, 5].map(n => (
                                <div key={n} className="search-skeleton-row">
                                    <div className="search-skeleton-thumb"></div>
                                    <div className="search-skeleton-info">
                                        <div className="skeleton-bar title"></div>
                                        <div className="skeleton-bar channel"></div>
                                        <div className="skeleton-bar desc"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="search-error-state">
                            <AlertCircle size={32} color="#e04f4f" />
                            <p>{error}</p>
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="search-results-list">
                            {videos.map(video => (
                                <article
                                    key={video.id || video._id}
                                    className="search-video-item"
                                    onClick={() => navigate(`/videoPlayPage/${video.id || video._id}`)}
                                >
                                    <div className="search-item-thumb-wrapper">
                                        <img
                                            src={video.thumbnail || "/placeholder-video.jpg"}
                                            alt={video.title || video.videoTitle}
                                            className="search-item-thumb"
                                        />
                                        <span className="search-duration-badge">
                                            {formatDuration(video.duration)}
                                        </span>
                                    </div>

                                    <div className="search-item-details">
                                        <h3 className="search-item-title">{video.title || video.videoTitle}</h3>

                                        <div className="search-item-stats">
                                            <span>{formatViews(video.views)}</span>
                                            <span>•</span>
                                            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                                        </div>

                                        <div
                                            className="search-item-channel-row"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (video.owner?.username) {
                                                    navigate(`/channel/${video.owner.username}`);
                                                }
                                            }}
                                        >
                                            <div className="search-channel-avatar">
                                                {video.owner?.avatarImage ? (
                                                    <img src={video.owner.avatarImage} alt="" />
                                                ) : (
                                                    <span>{video.owner?.username?.charAt(0).toUpperCase() || 'C'}</span>
                                                )}
                                            </div>
                                            <span className="search-channel-name">
                                                {video.owner?.fullName || video.owner?.username}
                                            </span>
                                        </div>

                                        <p className="search-item-description">
                                            {video.description}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div className="search-empty-state">
                            <SearchIcon size={48} color="var(--accent-secondary, #c68a5c)" />
                            <h3>No results found</h3>
                            <p>Try different keywords or check for spelling errors.</p>
                            <Link to="/" className="search-home-btn">Browse Home Feed</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SearchPage;
