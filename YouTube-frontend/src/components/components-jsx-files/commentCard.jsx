import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ThumbsUp, ThumbsDown, MoreVertical, Edit2, Trash2, Check, X } from "lucide-react";
import '../components-css-files/commentCard.css';

const formatTimeAgo = (createdAt) => {
    if (!createdAt) return "Just now";
    const commentTime = new Date(createdAt);
    const currentTime = new Date();
    const diffInMs = currentTime - commentTime;

    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} d ago`;
    if (months < 12) return `${months} mo ago`;
    return `${years} yr ago`;
};

function CommentCard({ comment, onDelete, onUpdate }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(comment.totalLikes || 0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content || '');
    const [savingEdit, setSavingEdit] = useState(false);

    const ownerId = comment.ownerDetails?._id || comment.owner;
    const isOwner = user && (user._id === ownerId || user._id === comment.ownerDetails?.id);

    const handleLike = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const res = await api.patch(`/likes/toggle-comment-like/${comment._id}`);
            if (res.data?.success) {
                const newLiked = !liked;
                setLiked(newLiked);
                if (newLiked) setDisliked(false);
                setTotalLikes(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error("Error liking comment:", err);
        }
    };

    const handleDislike = () => {
        if (liked) {
            setLiked(false);
            setTotalLikes(prev => Math.max(0, prev - 1));
        }
        setDisliked(!disliked);
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete your comment?")) return;
        try {
            const res = await api.delete(`/comments/${comment._id}`);
            if (res.data?.success) {
                if (onDelete) onDelete(comment._id);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete comment");
        }
    };

    const handleSaveEdit = async () => {
        if (!editContent.trim()) return;
        setSavingEdit(true);
        try {
            const res = await api.patch(`/comments/${comment._id}`, {
                content: editContent.trim()
            });
            if (res.data?.success) {
                if (onUpdate) onUpdate(comment._id, editContent.trim());
                setIsEditing(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update comment");
        } finally {
            setSavingEdit(false);
        }
    };

    const username = comment.ownerDetails?.username || "user";
    const avatar = comment.ownerDetails?.avatarImage;

    return (
        <div className="user-comment-card">
            <div
                className="user-avatar-section"
                onClick={() => username && navigate(`/channel/${username}`)}
            >
                {avatar ? (
                    <img src={avatar} alt={username} />
                ) : (
                    <div className="comment-avatar-fallback">
                        {username.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>

            <div className="user-cmt-details-section">
                <div className="username-and-time-section">
                    <span onClick={() => username && navigate(`/channel/${username}`)}>
                        @{username}
                    </span>
                    <p className="cmt-stats">{formatTimeAgo(comment.createdAt)}</p>
                </div>

                {isEditing ? (
                    <div className="comment-edit-box">
                        <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="comment-edit-input"
                            autoFocus
                        />
                        <div className="comment-edit-actions">
                            <button
                                className="btn-cancel-edit"
                                onClick={() => { setIsEditing(false); setEditContent(comment.content); }}
                            >
                                <X size={14} /> Cancel
                            </button>
                            <button
                                className="btn-save-edit"
                                onClick={handleSaveEdit}
                                disabled={savingEdit || !editContent.trim()}
                            >
                                <Check size={14} /> {savingEdit ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="cmt-content-section">{comment.content}</p>
                )}

                <div className="cmt-reaction-section">
                    <div className="cmt-like-and-likeCount-section">
                        <button
                            className={`like-btn ${liked ? 'active' : ''}`}
                            onClick={handleLike}
                            title="Like comment"
                        >
                            <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
                        </button>
                        <span className="like-count">{totalLikes > 0 ? totalLikes : ""}</span>
                    </div>

                    <button
                        className={`dislike-btn ${disliked ? 'active' : ''}`}
                        onClick={handleDislike}
                        title="Dislike comment"
                    >
                        <ThumbsDown size={16} fill={disliked ? "currentColor" : "none"} />
                    </button>

                    {isOwner && !isEditing && (
                        <div className="comment-options-wrapper">
                            <button
                                className="comment-menu-trigger"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                title="Comment options"
                            >
                                <MoreVertical size={16} />
                            </button>

                            {isMenuOpen && (
                                <div className="comment-dropdown">
                                    <button onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}>
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button onClick={() => { handleDelete(); setIsMenuOpen(false); }} className="danger">
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommentCard;
