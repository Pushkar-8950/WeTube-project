import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import {
    Play,
    Trash2,
    Edit3,
    ListVideo,
    X,
    Lock,
    AlertCircle
} from "lucide-react";
import "../pages-css-files/playlistDetail.css";

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

function PlaylistDetail() {
    const { playlistId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit Modal state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchPlaylist = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get(`/playlist/get-playlist/${playlistId}`);
            if (res.data?.success) {
                setPlaylist(res.data.data);
                setEditName(res.data.data.name || "");
                setEditDesc(res.data.data.description || "");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Playlist not found");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylist();
    }, [playlistId]);

    const isOwner = user && playlist && (user._id === playlist.owner || user._id === playlist.owner?._id);

    const handleRemoveVideo = async (videoId) => {
        try {
            const res = await api.patch(`/playlist/remove-video/${playlistId}/${videoId}`);
            if (res.data?.success) {
                setPlaylist(prev => ({
                    ...prev,
                    videos: prev.videos.filter(v => (typeof v === 'object' ? v._id !== videoId : v !== videoId))
                }));
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove video");
        }
    };

    const handleDeletePlaylist = async () => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;
        try {
            const res = await api.delete(`/playlist/${playlistId}`);
            if (res.data?.success) {
                navigate('/playlists');
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete playlist");
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editName.trim()) return;

        setSaving(true);
        try {
            const res = await api.patch(`/playlist/update/${playlistId}`, {
                name: editName.trim(),
                description: editDesc.trim()
            });

            if (res.data?.success) {
                setPlaylist(prev => ({ ...prev, name: editName.trim(), description: editDesc.trim() }));
                setIsEditing(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update playlist");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="pl-detail-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="pl-detail-loading">Loading playlist...</div>
            </div>
        );
    }

    if (error || !playlist) {
        return (
            <div className="pl-detail-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="pl-detail-error">
                    <AlertCircle size={44} color="#e04f4f" />
                    <h2>{error || "Playlist not found"}</h2>
                    <Link to="/playlists" className="btn-back-pl">Back to Playlists</Link>
                </div>
            </div>
        );
    }

    const firstVideo = playlist.videos?.[0];
    const firstVideoId = typeof firstVideo === 'object' ? firstVideo?._id : firstVideo;

    return (
        <div className="pl-detail-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="pl-detail-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="pl-detail-main">
                    {/* Left Banner Section */}
                    <aside className="pl-detail-hero">
                        <div className="hero-thumb-wrap">
                            {firstVideo && typeof firstVideo === 'object' && firstVideo.thumbnail ? (
                                <img src={firstVideo.thumbnail} alt="" className="hero-thumb-img" />
                            ) : (
                                <div className="hero-thumb-empty">
                                    <ListVideo size={48} />
                                </div>
                            )}
                        </div>

                        <h2>{playlist.name}</h2>
                        <p className="hero-desc">{playlist.description || "No description provided."}</p>

                        <div className="hero-meta">
                            <span>{playlist.videos?.length || 0} videos</span>
                            <span>•</span>
                            <span>Updated {new Date(playlist.updatedAt || playlist.createdAt).toLocaleDateString()}</span>
                        </div>

                        {firstVideoId && (
                            <button
                                className="btn-play-all-hero"
                                onClick={() => navigate(`/videoPlayPage/${firstVideoId}`)}
                            >
                                <Play size={18} fill="currentColor" />
                                <span>Play All</span>
                            </button>
                        )}

                        {isOwner && (
                            <div className="owner-buttons-row">
                                <button className="hero-action-btn" onClick={() => setIsEditing(true)}>
                                    <Edit3 size={16} /> Edit
                                </button>
                                <button className="hero-action-btn danger" onClick={handleDeletePlaylist}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        )}
                    </aside>

                    {/* Right Videos List */}
                    <section className="pl-detail-videos-section">
                        {playlist.videos && playlist.videos.length > 0 ? (
                            <div className="pl-videos-list">
                                {playlist.videos.map((vid, idx) => {
                                    const videoObj = typeof vid === 'object' ? vid : { _id: vid, videoTitle: `Video #${idx + 1}` };
                                    return (
                                        <article
                                            key={videoObj._id || idx}
                                            className="pl-video-item"
                                            onClick={() => navigate(`/videoPlayPage/${videoObj._id}`)}
                                        >
                                            <span className="item-index">{idx + 1}</span>

                                            <div className="item-thumb-box">
                                                <img
                                                    src={videoObj.thumbnail || "/placeholder-video.jpg"}
                                                    alt=""
                                                />
                                                {videoObj.duration && (
                                                    <span className="item-duration">
                                                        {formatDuration(videoObj.duration)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="item-info">
                                                <h4>{videoObj.videoTitle || "Video"}</h4>
                                                <p className="item-owner">{videoObj.owner?.username || "Creator"}</p>
                                                <span className="item-views">{videoObj.views || 0} views</span>
                                            </div>

                                            {isOwner && (
                                                <button
                                                    className="btn-remove-video"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveVideo(videoObj._id);
                                                    }}
                                                    title="Remove from playlist"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="pl-empty-videos">
                                <ListVideo size={44} color="var(--accent-secondary, #c68a5c)" />
                                <h3>There are no videos in this playlist yet</h3>
                                <p>You can add videos to this playlist by clicking "Save" on any video.</p>
                                <Link to="/" className="btn-browse-videos">Browse Videos</Link>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* Edit Playlist Modal */}
            {isEditing && (
                <div className="modal-overlay" onClick={() => setIsEditing(false)}>
                    <div className="edit-pl-modal" onClick={(e) => e.stopPropagation()}>
                        <header className="edit-pl-header">
                            <h3>Edit Playlist</h3>
                            <button onClick={() => setIsEditing(false)}><X size={20} /></button>
                        </header>

                        <form onSubmit={handleSaveEdit} className="edit-pl-form">
                            <div className="form-group-custom">
                                <label className="form-label">Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="text-input"
                                    required
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="textarea-input"
                                />
                            </div>

                            <footer className="edit-pl-footer">
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saving} className="btn-publish">
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistDetail;
