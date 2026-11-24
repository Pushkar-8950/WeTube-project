import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import VideoCard from "../../components/components-jsx-files/videoCard";
import AddToPlaylistModal from "../../components/components-jsx-files/AddToPlaylistModal";
import {
    Bell,
    Check,
    Video,
    ListVideo,
    MessageSquare,
    Info,
    Send,
    ThumbsUp,
    Trash2,
    Edit2,
    Calendar,
    Eye,
    Film,
    Heart,
    CircleUserRound,
    AlertCircle
} from "lucide-react";
import "../pages-css-files/channelPage.css";

function ChannelPage() {
    const { identifier, channelId, username } = useParams();
    const channelIdentifier = username || channelId || identifier;

    const navigate = useNavigate();
    const { user } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [channel, setChannel] = useState(null);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [tweets, setTweets] = useState([]);

    const [activeTab, setActiveTab] = useState("Videos");
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subCount, setSubCount] = useState(0);
    const [subLoading, setSubLoading] = useState(false);
    const [error, setError] = useState("");

    // Community / Tweet creation
    const [newTweetContent, setNewTweetContent] = useState("");
    const [postingTweet, setPostingTweet] = useState(false);
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editTweetText, setEditTweetText] = useState("");

    // Playlist modal
    const [playlistModalVideoId, setPlaylistModalVideoId] = useState(null);

    // Fetch Channel Profile
    useEffect(() => {
        const fetchChannel = async () => {
            if (!channelIdentifier) return;
            setLoading(true);
            setError("");

            try {
                // If identifier is username or we try fetching channel
                const res = await api.get(`/users/c/${channelIdentifier}`);
                if (res.data?.success && res.data.data) {
                    const data = res.data.data;
                    setChannel(data);
                    setIsSubscribed(data.isSubscribed || false);
                    setSubCount(data.subscribersCount || 0);

                    // Now fetch stats, videos, playlists, tweets with channel._id
                    const channelDbId = data._id;
                    if (channelDbId) {
                        // Parallel fetches
                        const [statsRes, videosRes, plRes, tweetsRes] = await Promise.allSettled([
                            api.get(`/dashboard/get-channel-stats/${channelDbId}`),
                            api.get(`/dashboard/get-channel-videos/${channelDbId}`),
                            api.get(`/playlist/get-user-playlist/${channelDbId}`),
                            api.get(`/tweets/${channelDbId}`)
                        ]);

                        if (statsRes.status === "fulfilled" && statsRes.value.data?.success) {
                            setStats(statsRes.value.data.data);
                        }
                        if (videosRes.status === "fulfilled" && videosRes.value.data?.success) {
                            setVideos(videosRes.value.data.data || []);
                        }
                        if (plRes.status === "fulfilled" && plRes.value.data?.success) {
                            setPlaylists(plRes.value.data.data || []);
                        }
                        if (tweetsRes.status === "fulfilled" && tweetsRes.value.data?.success) {
                            setTweets(tweetsRes.value.data.data || []);
                        }
                    }
                }
            } catch (err) {
                console.error("Error fetching channel:", err);
                setError(err.response?.data?.message || "Channel not found");
            } finally {
                setLoading(false);
            }
        };

        fetchChannel();
    }, [channelIdentifier]);

    // Handle Subscription Toggle
    const handleToggleSub = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!channel?._id) return;
        setSubLoading(true);

        try {
            await api.patch(`/subscriptions/toggle/${channel._id}`);
            const nextState = !isSubscribed;
            setIsSubscribed(nextState);
            setSubCount(prev => nextState ? prev + 1 : Math.max(0, prev - 1));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update subscription");
        } finally {
            setSubLoading(false);
        }
    };

    // Create Tweet (Community Post)
    const handleCreateTweet = async (e) => {
        e.preventDefault();
        if (!newTweetContent.trim() || postingTweet) return;

        setPostingTweet(true);
        try {
            const res = await api.post('/tweets/create', { content: newTweetContent.trim() });
            if (res.data?.success) {
                const created = res.data.data;
                setTweets(prev => [created, ...prev]);
                setNewTweetContent("");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post tweet");
        } finally {
            setPostingTweet(false);
        }
    };

    // Toggle Tweet Like
    const handleToggleTweetLike = async (tweetId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            await api.patch(`/likes/toggle-tweet-like/${tweetId}`);
            // Optimistic toggle
            setTweets(prev => prev.map(t => {
                if (t._id === tweetId) {
                    const liked = t.isLiked;
                    return {
                        ...t,
                        isLiked: !liked,
                        likesCount: (t.likesCount || 0) + (liked ? -1 : 1)
                    };
                }
                return t;
            }));
        } catch (err) {
            console.error("Error liking tweet:", err);
        }
    };

    // Delete Tweet
    const handleDeleteTweet = async (tweetId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            const res = await api.delete(`/tweets/${tweetId}`);
            if (res.data?.success) {
                setTweets(prev => prev.filter(t => t._id !== tweetId));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete tweet");
        }
    };

    // Save Edit Tweet
    const handleSaveTweetEdit = async (tweetId) => {
        if (!editTweetText.trim()) return;
        try {
            const res = await api.patch(`/tweets/${tweetId}`, { newContent: editTweetText.trim() });
            if (res.data?.success) {
                setTweets(prev => prev.map(t => t._id === tweetId ? { ...t, content: editTweetText.trim() } : t));
                setEditingTweetId(null);
                setEditTweetText("");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update tweet");
        }
    };

    const isChannelOwner = user && channel && (user.username === channel.username || user._id === channel._id);

    if (loading) {
        return (
            <div className="channel-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="channel-skeleton-loader">
                    <div className="skeleton-banner"></div>
                    <div className="skeleton-channel-header">
                        <div className="skeleton-header-avatar"></div>
                        <div className="skeleton-header-info">
                            <div className="skeleton-bar title"></div>
                            <div className="skeleton-bar meta"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !channel) {
        return (
            <div className="channel-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="channel-error-state">
                    <AlertCircle size={48} color="#e04f4f" />
                    <h2>This channel doesn't exist</h2>
                    <p>The channel you are looking for may have been removed or renamed.</p>
                    <Link to="/" className="btn-channel-home">Back to Browse</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="channel-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="channel-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="channel-main-content">
                    {/* Banner Image */}
                    <div className="channel-banner-box">
                        {channel.coverImage ? (
                            <img src={channel.coverImage} alt="Channel Cover Banner" className="channel-cover-img" />
                        ) : (
                            <div className="channel-banner-fallback">
                                <span>WeTube Creator Channel</span>
                            </div>
                        )}
                    </div>

                    {/* Channel Header Details */}
                    <div className="channel-header-section">
                        <div className="channel-avatar-outer">
                            <img
                                src={channel.avatarImage || "/default-avatar.png"}
                                alt={channel.username}
                                className="channel-avatar-main"
                            />
                        </div>

                        <div className="channel-identity-info">
                            <div className="channel-title-row">
                                <h1>{channel.fullName || channel.username}</h1>
                            </div>

                            <div className="channel-sub-info">
                                <span className="channel-handle">@{channel.username}</span>
                                <span>•</span>
                                <span>{subCount} subscribers</span>
                                <span>•</span>
                                <span>{stats?.totalVideos ?? videos.length} videos</span>
                            </div>

                            <p className="channel-bio-preview">
                                Welcome to the official channel of {channel.fullName || channel.username}. Watch videos, community posts, and curated playlists.
                            </p>

                            <div className="channel-action-row">
                                {!isChannelOwner ? (
                                    <button
                                        className={`channel-sub-btn ${isSubscribed ? "subscribed" : ""}`}
                                        onClick={handleToggleSub}
                                        disabled={subLoading}
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
                                ) : (
                                    <div className="owner-action-group">
                                        <Link to="/studio" className="btn-studio-edit">
                                            Manage Videos (Studio)
                                        </Link>
                                        <Link to="/settings" className="btn-customize-channel">
                                            Customize Channel
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <nav className="channel-nav-tabs">
                        {["Videos", "Playlists", "Community", "About"].map(tab => (
                            <button
                                key={tab}
                                className={`channel-tab-btn ${activeTab === tab ? "active" : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    {/* Tab 1: Videos */}
                    {activeTab === "Videos" && (
                        <section className="channel-tab-content">
                            {videos.length > 0 ? (
                                <div className="channel-video-grid">
                                    {videos.map(video => (
                                        <VideoCard
                                            key={video._id}
                                            video={{ ...video, owner: channel }}
                                            onAddToPlaylist={(v) => setPlaylistModalVideoId(v._id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="channel-tab-empty">
                                    <Film size={40} color="var(--accent-secondary, #c68a5c)" />
                                    <h3>This channel has no videos yet.</h3>
                                    {isChannelOwner && (
                                        <Link to="/studio" className="btn-create-first-video">
                                            Upload your first video
                                        </Link>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Tab 2: Playlists */}
                    {activeTab === "Playlists" && (
                        <section className="channel-tab-content">
                            {playlists.length > 0 ? (
                                <div className="channel-playlist-grid">
                                    {playlists.map(pl => (
                                        <article
                                            key={pl._id}
                                            className="channel-playlist-card"
                                            onClick={() => navigate(`/playlist/${pl._id}`)}
                                        >
                                            <div className="pl-card-thumb-wrap">
                                                <div className="pl-card-overlay">
                                                    <ListVideo size={24} />
                                                    <span>{pl.videos?.length || 0} videos</span>
                                                </div>
                                            </div>
                                            <div className="pl-card-meta">
                                                <h4>{pl.name}</h4>
                                                <p>{pl.description || "View full playlist"}</p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <div className="channel-tab-empty">
                                    <ListVideo size={40} color="var(--accent-secondary, #c68a5c)" />
                                    <h3>No playlists created yet.</h3>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Tab 3: Community / Tweets */}
                    {activeTab === "Community" && (
                        <section className="channel-tab-content community-tab-content">
                            {isChannelOwner && (
                                <form onSubmit={handleCreateTweet} className="create-community-post-box">
                                    <div className="post-input-header">
                                        <img src={channel.avatarImage} alt="" className="post-author-avatar" />
                                        <textarea
                                            placeholder="Post an update to your community..."
                                            value={newTweetContent}
                                            onChange={(e) => setNewTweetContent(e.target.value)}
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="post-input-footer">
                                        <button
                                            type="submit"
                                            className="btn-publish-post"
                                            disabled={postingTweet || !newTweetContent.trim()}
                                        >
                                            <Send size={15} />
                                            <span>{postingTweet ? 'Posting...' : 'Post'}</span>
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="community-posts-list">
                                {tweets.length > 0 ? (
                                    tweets.map(tweet => (
                                        <article key={tweet._id} className="community-post-card">
                                            <div className="community-post-header">
                                                <img src={channel.avatarImage} alt="" className="community-post-avatar" />
                                                <div className="community-post-meta">
                                                    <h4>{channel.fullName || channel.username}</h4>
                                                    <span>{new Date(tweet.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {isChannelOwner && (
                                                    <div className="post-owner-actions">
                                                        <button
                                                            onClick={() => {
                                                                setEditingTweetId(tweet._id);
                                                                setEditTweetText(tweet.content);
                                                            }}
                                                            title="Edit Post"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTweet(tweet._id)}
                                                            className="danger"
                                                            title="Delete Post"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {editingTweetId === tweet._id ? (
                                                <div className="edit-tweet-wrapper">
                                                    <textarea
                                                        value={editTweetText}
                                                        onChange={(e) => setEditTweetText(e.target.value)}
                                                        rows={3}
                                                    />
                                                    <div className="edit-tweet-btns">
                                                        <button onClick={() => setEditingTweetId(null)}>Cancel</button>
                                                        <button onClick={() => handleSaveTweetEdit(tweet._id)} className="save-btn">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="community-post-body">{tweet.content}</p>
                                            )}

                                            <div className="community-post-footer">
                                                <button
                                                    className={`post-like-btn ${tweet.isLiked ? 'liked' : ''}`}
                                                    onClick={() => handleToggleTweetLike(tweet._id)}
                                                >
                                                    <ThumbsUp size={16} fill={tweet.isLiked ? "currentColor" : "none"} />
                                                    <span>{tweet.likesCount || 0}</span>
                                                </button>
                                            </div>
                                        </article>
                                    ))
                                ) : (
                                    <div className="channel-tab-empty">
                                        <MessageSquare size={40} color="var(--accent-secondary, #c68a5c)" />
                                        <h3>No community posts yet.</h3>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Tab 4: About */}
                    {activeTab === "About" && (
                        <section className="channel-tab-content about-tab-content">
                            <div className="about-columns">
                                <div className="about-left-col">
                                    <h3>Description</h3>
                                    <p className="about-desc">
                                        Welcome to {channel.fullName}'s channel! Follow along for regular video updates, posts, and interactive discussions.
                                    </p>

                                    <h3>Details</h3>
                                    <div className="about-detail-item">
                                        <span>Email for inquiries:</span>
                                        <strong>{channel.email}</strong>
                                    </div>
                                </div>

                                <div className="about-right-col">
                                    <h3>Channel Stats</h3>
                                    <div className="stat-card">
                                        <Eye size={20} color="var(--accent-secondary, #c68a5c)" />
                                        <div>
                                            <h4>{stats?.totalViews?.toLocaleString() ?? 0}</h4>
                                            <span>Total Views</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <Film size={20} color="var(--accent-secondary, #c68a5c)" />
                                        <div>
                                            <h4>{stats?.totalVideos ?? videos.length}</h4>
                                            <span>Videos Uploaded</span>
                                        </div>
                                    </div>

                                    <div className="stat-card">
                                        <Heart size={20} color="var(--accent-secondary, #c68a5c)" />
                                        <div>
                                            <h4>{stats?.totalLikes?.toLocaleString() ?? 0}</h4>
                                            <span>Total Likes Received</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
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

export default ChannelPage;
