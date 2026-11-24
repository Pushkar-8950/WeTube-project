import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { X, Plus, Check, ListVideo, Loader2 } from 'lucide-react';
import '../components-css-files/addToPlaylistModal.css';

function AddToPlaylistModal({ isOpen, onClose, videoId }) {
    const { user } = useAuth();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
    const [creating, setCreating] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !user?._id) return;

        const fetchPlaylists = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/playlist/get-user-playlist/${user._id}`);
                if (res.data?.success) {
                    setPlaylists(res.data.data || []);
                }
            } catch (err) {
                // Backend returns 400 when no playlists exist for user
                setPlaylists([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [isOpen, user?._id]);

    if (!isOpen) return null;

    const isVideoInPlaylist = (playlist) => {
        return playlist.videos?.some(id => (typeof id === 'object' ? id._id === videoId : id === videoId));
    };

    const handleToggleVideo = async (playlist) => {
        setTogglingId(playlist._id);
        const inPlaylist = isVideoInPlaylist(playlist);

        try {
            if (inPlaylist) {
                await api.patch(`/playlist/remove-video/${playlist._id}/${videoId}`);
                setPlaylists(prev => prev.map(p => {
                    if (p._id === playlist._id) {
                        return {
                            ...p,
                            videos: p.videos.filter(id => (typeof id === 'object' ? id._id !== videoId : id !== videoId))
                        };
                    }
                    return p;
                }));
            } else {
                await api.patch(`/playlist/add-video/${playlist._id}/${videoId}`);
                setPlaylists(prev => prev.map(p => {
                    if (p._id === playlist._id) {
                        return {
                            ...p,
                            videos: [...p.videos, videoId]
                        };
                    }
                    return p;
                }));
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating playlist');
        } finally {
            setTogglingId(null);
        }
    };

    const handleCreatePlaylist = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        setCreating(true);
        setError('');
        try {
            const res = await api.post('/playlist/create', {
                name: newPlaylistName.trim(),
                description: newPlaylistDesc.trim() || 'Created by user'
            });

            if (res.data?.success) {
                const created = res.data.data;
                // If videoId present, add to it
                if (videoId) {
                    try {
                        await api.patch(`/playlist/add-video/${created._id}/${videoId}`);
                        created.videos = [videoId];
                    } catch {}
                }
                setPlaylists(prev => [created, ...prev]);
                setNewPlaylistName('');
                setNewPlaylistDesc('');
                setShowCreateForm(false);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create playlist');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="playlist-modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="playlist-modal-header">
                    <h3>Save video to...</h3>
                    <button className="playlist-modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </header>

                {error && <div className="playlist-error-msg">{error}</div>}

                <div className="playlist-list-scroll">
                    {loading ? (
                        <div className="playlist-loading">
                            <Loader2 size={24} className="spin-icon" />
                            <span>Loading playlists...</span>
                        </div>
                    ) : playlists.length > 0 ? (
                        playlists.map(pl => {
                            const selected = isVideoInPlaylist(pl);
                            const isToggling = togglingId === pl._id;
                            return (
                                <div
                                    key={pl._id}
                                    className={`playlist-checkbox-row ${selected ? 'selected' : ''}`}
                                    onClick={() => !isToggling && handleToggleVideo(pl)}
                                >
                                    <div className="custom-checkbox">
                                        {selected && <Check size={14} color="#fff" />}
                                    </div>
                                    <span className="pl-name">{pl.name}</span>
                                    {isToggling && <Loader2 size={16} className="spin-icon inline-spin" />}
                                </div>
                            );
                        })
                    ) : (
                        <p className="no-playlists-hint">You haven't created any playlists yet.</p>
                    )}
                </div>

                {showCreateForm ? (
                    <form onSubmit={handleCreatePlaylist} className="create-playlist-inline-form">
                        <input
                            type="text"
                            placeholder="Playlist name"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            required
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Description (optional)"
                            value={newPlaylistDesc}
                            onChange={(e) => setNewPlaylistDesc(e.target.value)}
                        />
                        <div className="form-actions">
                            <button type="button" onClick={() => setShowCreateForm(false)} className="btn-text">
                                Cancel
                            </button>
                            <button type="submit" className="btn-create-pl" disabled={creating}>
                                {creating ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <footer className="playlist-modal-footer">
                        <button
                            type="button"
                            className="create-new-pl-btn"
                            onClick={() => setShowCreateForm(true)}
                        >
                            <Plus size={18} />
                            <span>Create new playlist</span>
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
}

export default AddToPlaylistModal;
