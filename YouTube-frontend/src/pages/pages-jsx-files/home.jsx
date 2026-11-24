import React, { useRef, useEffect, useState, useCallback } from "react";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import VideoCard from "../../components/components-jsx-files/videoCard";
import AddToPlaylistModal from "../../components/components-jsx-files/AddToPlaylistModal";
import api from "../../services/api";
import { Sparkles } from "lucide-react";
import '../pages-css-files/home.css';

function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleIsSidebarOpen = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const sidebarRef = useRef(null);
    const menuButtonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !menuButtonRef.current?.contains(event.target)) {
                setIsSidebarOpen(false);
            }
        }
        document.addEventListener("click", handleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    // Video fetching & infinite scroll
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState("All");

    // Modal state for saving to playlist
    const [playlistModalVideoId, setPlaylistModalVideoId] = useState(null);

    const sentinelRef = useRef();
    const isFetchingRef = useRef(false);

    const categories = [
        "All",
        "Recently Uploaded",
        "Gaming",
        "Music",
        "Podcasts",
        "Technology",
        "Creative",
        "Community"
    ];

    const fetchVideos = useCallback(async (pageNumber) => {
        if (isFetchingRef.current) return;

        setLoading(true);
        isFetchingRef.current = true;
        try {
            const response = await api.get(`/videos/get-home-videos?page=${pageNumber}&limit=8`);
            const newVideos = response.data?.data?.videos || [];

            setVideos(prev => pageNumber === 1 ? newVideos : [...prev, ...newVideos]);
            setPage(pageNumber + 1);
            setHasMore(newVideos.length === 8);
        } catch (error) {
            console.error("Error fetching homepage videos:", error);
        } finally {
            setLoading(false);
            setInitialLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    // Fetch initial on mount
    useEffect(() => {
        fetchVideos(1);
    }, [fetchVideos]);

    // Infinite scrolling
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
                    fetchVideos(page);
                }
            },
            {
                threshold: 0,
                rootMargin: "250px"
            }
        );

        if (sentinelRef.current && videos.length > 0) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loading, page, hasMore, fetchVideos, videos.length]);

    // Filter videos by category if needed
    const displayedVideos = videos.filter(video => {
        if (activeCategory === "All") return true;
        if (activeCategory === "Recently Uploaded") {
            const videoDate = new Date(video.createdAt);
            const now = new Date();
            const diffDays = (now - videoDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }
        const text = `${video.videoTitle || ''} ${video.description || ''}`.toLowerCase();
        return text.includes(activeCategory.toLowerCase());
    });

    return (
        <div className="youtube-home">
            <HomeNavbar
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleIsSidebarOpen}
                menuButtonRef={menuButtonRef}
            />

            <div className="home-layout-body">
                <div ref={sidebarRef}>
                    <HomeSidebar isSidebarOpen={isSidebarOpen} />
                </div>

                <main className="main-content">
                    {/* Categories Bar */}
                    <nav className="category-bar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={activeCategory === cat ? "active" : ""}
                                onClick={() => setActiveCategory(cat)}
                            >
                                {cat === "Recently Uploaded" && <Sparkles size={14} style={{ marginRight: 6 }} />}
                                {cat}
                            </button>
                        ))}
                    </nav>

                    {/* Loading Skeletons */}
                    {initialLoading ? (
                        <div className="video-grid">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="video-skeleton-card">
                                    <div className="skeleton-thumb"></div>
                                    <div className="skeleton-info">
                                        <div className="skeleton-avatar"></div>
                                        <div className="skeleton-text">
                                            <div className="skeleton-line full"></div>
                                            <div className="skeleton-line half"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : displayedVideos.length > 0 ? (
                        <section className="video-grid">
                            {displayedVideos.map((video) => (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                    onAddToPlaylist={(v) => setPlaylistModalVideoId(v._id)}
                                />
                            ))}
                        </section>
                    ) : (
                        <div className="no-videos-empty-state">
                            <Sparkles size={48} color="var(--accent-secondary, #c68a5c)" />
                            <h2>No videos found in this category</h2>
                            <p>Try selecting "All" or check back later as creators upload new content.</p>
                            <button
                                className="reset-category-btn"
                                onClick={() => setActiveCategory("All")}
                            >
                                Show All Videos
                            </button>
                        </div>
                    )}

                    {/* Sentinel for infinite scroll */}
                    <div ref={sentinelRef} className="sentinel"></div>

                    {loading && !initialLoading && (
                        <div className="loading-more-container">
                            <div className="custom-spinner"></div>
                            <span>Loading more videos...</span>
                        </div>
                    )}
                </main>
            </div>

            {/* Save to Playlist Modal */}
            <AddToPlaylistModal
                isOpen={!!playlistModalVideoId}
                onClose={() => setPlaylistModalVideoId(null)}
                videoId={playlistModalVideoId}
            />
        </div>
    );
}

export default Home;
