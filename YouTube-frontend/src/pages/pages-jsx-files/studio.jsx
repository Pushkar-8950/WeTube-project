import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import UploadModal from "../../components/components-jsx-files/UploadModal";
import {
    Plus,
    Eye,
    ThumbsUp,
    Film,
    Users,
    Trash2,
    Edit3,
    Globe,
    Lock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    X,
    Image as ImageIcon
} from "lucide-react";
import "../pages-css-files/studio.css";

// Helper for views
const formatViews = (views) => {
    if (!views && views !== 0) return "0";
    const num = Number(views);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

function Studio() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Edit Video Modal state
    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editThumbnailFile, setEditThumbnailFile] = useState(null);
    const [editThumbnailPreview, setEditThumbnailPreview] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);
    const [actionMsg, setActionMsg] = useState("");

    const fetchStudioData = async () => {
        if (!user?._id) return;
        setLoading(true);

        try {
            const [statsRes, videosRes] = await Promise.all([
                api.get(`/dashboard/get-channel-stats/${user._id}`),
                api.get(`/dashboard/get-channel-videos/${user._id}`)
            ]);

            if (statsRes.data?.success) {
                setStats(statsRes.data.data);
            }
            if (videosRes.data?.success) {
                setVideos(videosRes.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load studio data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudioData();
    }, [user?._id]);

    const handleTogglePublish = async (videoId) => {
        try {
            const res = await api.patch(`/videos/toggle-publish-status?videoId=${videoId}`);
            if (res.data?.success) {
                const updated = res.data.data;
                setVideos(prev => prev.map(v => v._id === videoId ? { ...v, isPublished: updated.isPublished } : v));
                setActionMsg("Publish status updated!");
                setTimeout(() => setActionMsg(""), 2500);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video permanently?")) return;

        try {
            const res = await api.delete(`/videos/delete-video?videoId=${videoId}`);
            if (res.data?.success) {
                setVideos(prev => prev.filter(v => v._id !== videoId));
                setActionMsg("Video deleted successfully.");
                setTimeout(() => setActionMsg(""), 2500);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete video");
        }
    };

    const handleOpenEdit = (video) => {
        setEditingVideo(video);
        setEditTitle(video.videoTitle || "");
        setEditDescription(video.description || "");
        setEditThumbnailPreview(video.thumbnail || "");
        setEditThumbnailFile(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim()) return;

        setSavingEdit(true);
        try {
            const formData = new FormData();
            formData.append("newTitle", editTitle.trim());
            formData.append("newDescription", editDescription.trim());
            if (editThumbnailFile) {
                formData.append("newThumbnail", editThumbnailFile);
            }

            const res = await api.patch(`/videos/update-video-details?videoId=${editingVideo._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data?.success) {
                const updated = res.data.data;
                setVideos(prev => prev.map(v => v._id === editingVideo._id ? updated : v));
                setEditingVideo(null);
                setActionMsg("Video details updated!");
                setTimeout(() => setActionMsg(""), 2500);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update video");
        } finally {
            setSavingEdit(false);
        }
    };

    if (!user) {
        return (
            <div className="studio-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="studio-login-prompt">
                    <h2>Sign in to access WeTube Creator Studio</h2>
                    <p>Upload videos, view channel statistics, and manage your content.</p>
                    <Link to="/login" className="studio-primary-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="studio-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="studio-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="studio-main">
                    <header className="studio-header">
                        <div>
                            <h1>Channel Dashboard</h1>
                            <p>Overview of your channel performance and video management</p>
                        </div>
                        <button className="studio-upload-btn" onClick={() => setIsUploadOpen(true)}>
                            <Plus size={18} />
                            <span>Upload Video</span>
                        </button>
                    </header>

                    {actionMsg && (
                        <div className="studio-action-banner">
                            <CheckCircle2 size={18} />
                            <span>{actionMsg}</span>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="studio-stats-grid">
                        <div className="studio-stat-card">
                            <div className="stat-icon-wrap views">
                                <Eye size={22} />
                            </div>
                            <div className="stat-info">
                                <h3>{formatViews(stats?.totalViews)}</h3>
                                <p>Total Views</p>
                            </div>
                        </div>

                        <div className="studio-stat-card">
                            <div className="stat-icon-wrap subscribers">
                                <Users size={22} />
                            </div>
                            <div className="stat-info">
                                <h3>{formatViews(stats?.totalSubscribers)}</h3>
                                <p>Subscribers</p>
                            </div>
                        </div>

                        <div className="studio-stat-card">
                            <div className="stat-icon-wrap videos">
                                <Film size={22} />
                            </div>
                            <div className="stat-info">
                                <h3>{stats?.totalVideos ?? videos.length}</h3>
                                <p>Published Videos</p>
                            </div>
                        </div>

                        <div className="studio-stat-card">
                            <div className="stat-icon-wrap likes">
                                <ThumbsUp size={22} />
                            </div>
                            <div className="stat-info">
                                <h3>{formatViews(stats?.totalLikes)}</h3>
                                <p>Total Likes</p>
                            </div>
                        </div>
                    </div>

                    {/* Channel Videos Table */}
                    <section className="studio-videos-section">
                        <div className="videos-table-header">
                            <h2>Your Videos ({videos.length})</h2>
                        </div>

                        {loading ? (
                            <div className="studio-loading">Loading videos...</div>
                        ) : videos.length > 0 ? (
                            <div className="studio-table-container">
                                <table className="studio-table">
                                    <thead>
                                        <tr>
                                            <th>Video</th>
                                            <th>Visibility</th>
                                            <th>Views</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {videos.map(video => (
                                            <tr key={video._id}>
                                                <td className="video-cell">
                                                    <img
                                                        src={video.thumbnail || "/placeholder-video.jpg"}
                                                        alt=""
                                                        className="table-thumb"
                                                    />
                                                    <div className="table-video-meta">
                                                        <span className="table-video-title" title={video.videoTitle}>
                                                            {video.videoTitle}
                                                        </span>
                                                        <span className="table-video-desc">
                                                            {video.description?.slice(0, 50)}...
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <button
                                                        className={`visibility-badge ${video.isPublished ? 'published' : 'private'}`}
                                                        onClick={() => handleTogglePublish(video._id)}
                                                        title="Click to toggle visibility"
                                                    >
                                                        {video.isPublished ? (
                                                            <>
                                                                <Globe size={14} />
                                                                <span>Public</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock size={14} />
                                                                <span>Private</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </td>

                                                <td>{video.views}</td>
                                                <td>{new Date(video.createdAt).toLocaleDateString()}</td>

                                                <td>
                                                    <div className="table-actions-row">
                                                        <button
                                                            className="table-btn view"
                                                            onClick={() => navigate(`/videoPlayPage/${video._id}`)}
                                                            title="Watch Video"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </button>
                                                        <button
                                                            className="table-btn edit"
                                                            onClick={() => handleOpenEdit(video)}
                                                            title="Edit Details"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            className="table-btn delete"
                                                            onClick={() => handleDeleteVideo(video._id)}
                                                            title="Delete Video"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="studio-empty-videos">
                                <Film size={44} color="var(--accent-secondary, #c68a5c)" />
                                <h3>No videos uploaded yet</h3>
                                <p>Start creating and publishing content to reach viewers on WeTube.</p>
                                <button className="studio-primary-btn" onClick={() => setIsUploadOpen(true)}>
                                    Upload Your First Video
                                </button>
                            </div>
                        )}
                    </section>
                </main>
            </div>

            {/* Upload Modal */}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={() => {
                    fetchStudioData();
                }}
            />

            {/* Edit Video Details Modal */}
            {editingVideo && (
                <div className="modal-overlay" onClick={() => setEditingVideo(null)}>
                    <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
                        <header className="edit-modal-header">
                            <h3>Edit Video Details</h3>
                            <button onClick={() => setEditingVideo(null)} className="btn-close-modal">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSaveEdit} className="edit-modal-form">
                            <div className="form-group-custom">
                                <label className="form-label">Video Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-input"
                                    required
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="form-label">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="textarea-input"
                                    required
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="form-label">Change Thumbnail</label>
                                <div className="edit-thumb-row">
                                    <img src={editThumbnailPreview} alt="" className="edit-thumb-preview" />
                                    <label className="btn-change-thumb">
                                        <ImageIcon size={16} />
                                        <span>Select New Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditThumbnailFile(file);
                                                    setEditThumbnailPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>
                            </div>

                            <footer className="edit-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setEditingVideo(null)}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="btn-publish"
                                >
                                    {savingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Studio;
