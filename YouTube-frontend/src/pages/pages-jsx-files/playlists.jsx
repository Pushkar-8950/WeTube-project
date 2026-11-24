import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import { ListVideo, Plus, Play, Lock, Trash2, Edit3, X } from "lucide-react";
import "../pages-css-files/playlists.css";

function PlaylistsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create playlist modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);

    const fetchPlaylists = async () => {
        if (!user?._id) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/playlist/get-user-playlist/${user._id}`);
            if (res.data?.success) {
                setPlaylists(res.data.data || []);
            }
        } catch (err) {
            // 400 when no playlists exist
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, [user?._id]);

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return;

        setCreating(true);
        try {
            const res = await api.post('/playlist/create', {
                name: newName.trim(),
                description: newDesc.trim() || 'Custom playlist'
            });

            if (res.data?.success) {
                setPlaylists(prev => [res.data.data, ...prev]);
                setShowCreateModal(false);
                setNewName("");
                setNewDesc("");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create playlist");
        } finally {
            setCreating(false);
        }
    };

    if (!user) {
        return (
            <div className="playlists-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="playlists-login-prompt">
                    <ListVideo size={48} color="var(--accent-secondary, #c68a5c)" />
                    <h2>Manage your playlists</h2>
                    <p>Sign in to create, organize, and view your customized video playlists.</p>
                    <Link to="/login" className="playlists-primary-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="playlists-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="playlists-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="playlists-main">
                    <header className="playlists-header">
                        <div>
                            <h2>Your Playlists</h2>
                            <p>Organize your favorite videos into curated collections.</p>
                        </div>
                        <button className="btn-new-playlist" onClick={() => setShowCreateModal(true)}>
                            <Plus size={18} />
                            <span>New Playlist</span>
                        </button>
                    </header>

                    {loading ? (
                        <div className="playlists-loading">Loading playlists...</div>
                    ) : playlists.length > 0 ? (
                        <div className="playlists-grid">
                            {playlists.map(pl => {
                                const videoCount = pl.videos?.length || 0;
                                return (
                                    <article
                                        key={pl._id}
                                        className="playlist-item-card"
                                        onClick={() => navigate(`/playlist/${pl._id}`)}
                                    >
                                        <div className="pl-item-thumb-box">
                                            <div className="pl-overlay-badge">
                                                <ListVideo size={22} />
                                                <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                                            </div>
                                        </div>

                                        <div className="pl-item-info">
                                            <h3>{pl.name}</h3>
                                            <p>{pl.description || "No description provided"}</p>
                                            <span className="view-pl-link">View full playlist</span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="playlists-empty">
                            <ListVideo size={48} color="var(--accent-secondary, #c68a5c)" />
                            <h3>No playlists created yet</h3>
                            <p>Save videos to watch later or organize them by themes.</p>
                            <button className="playlists-primary-btn" onClick={() => setShowCreateModal(true)}>
                                Create Your First Playlist
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="create-pl-modal-box" onClick={(e) => e.stopPropagation()}>
                        <header className="create-pl-header">
                            <h3>Create Playlist</h3>
                            <button onClick={() => setShowCreateModal(false)}>
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleCreatePlaylist} className="create-pl-form">
                            <div className="form-group-custom">
                                <label className="form-label">Playlist Name</label>
                                <input
                                    type="text"
                                    placeholder="Enter a title for your playlist"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="text-input"
                                    required
                                    autoFocus
                                />
                            </div>

                            <div className="form-group-custom">
                                <label className="form-label">Description (optional)</label>
                                <textarea
                                    placeholder="Add an optional description"
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    rows={3}
                                    className="textarea-input"
                                />
                            </div>

                            <footer className="create-pl-footer">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creating} className="btn-publish">
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistsPage;
