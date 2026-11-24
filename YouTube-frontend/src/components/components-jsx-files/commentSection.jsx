import React, { useRef, useState, useCallback, useEffect } from "react";
import { MessageSquare, Smile, CircleUserRound, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import CommentCard from "./commentCard";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import '../components-css-files/commentSection.css';

function Comments({ videoId, avatarImage }) {
    const { user } = useAuth();

    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalComments, setTotalComments] = useState(0);

    const [userComment, setUserComment] = useState("");
    const [displayPostOptions, setDisplayPostOptions] = useState(false);
    const [postingComment, setPostingComment] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const sentinelRef = useRef();
    const isFetchingRef = useRef(false);

    // Fetch comments
    const fetchComments = useCallback(async (pageNumber) => {
        if (isFetchingRef.current) return;

        setLoading(true);
        isFetchingRef.current = true;

        try {
            const response = await api.get(`/comments/${videoId}?page=${pageNumber}&limit=10`);
            const data = response.data?.data?.[0];

            if (data) {
                const newComments = data.comments || [];
                setTotalComments(data.totalComments || 0);
                setComments(prev => pageNumber === 1 ? newComments : [...prev, ...newComments]);
                setPage(pageNumber + 1);
                setHasMore(newComments.length === 10);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [videoId]);

    useEffect(() => {
        setComments([]);
        setPage(1);
        setHasMore(true);
        fetchComments(1);
    }, [fetchComments]);

    // Infinite scroll
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
                    fetchComments(page);
                }
            },
            { threshold: 0, rootMargin: "200px" }
        );

        if (sentinelRef.current && comments.length > 0) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loading, page, hasMore, fetchComments, comments.length]);

    // Post comment
    const postComment = async (e) => {
        if (e) e.preventDefault();
        if (!userComment.trim() || postingComment) return;

        setPostingComment(true);
        try {
            const response = await api.post(`/comments/${videoId}`, {
                content: userComment.trim()
            });

            if (response.data?.success) {
                const created = response.data.data;
                // Add current user details to created comment
                created.ownerDetails = {
                    _id: user?._id,
                    username: user?.username,
                    avatarImage: user?.avatarImage
                };
                created.totalLikes = 0;

                setComments(prev => [created, ...prev]);
                setTotalComments(prev => prev + 1);
                setUserComment("");
                setDisplayPostOptions(false);
                setShowEmojiPicker(false);
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setPostingComment(false);
        }
    };

    const handleDeleteComment = (commentId) => {
        setComments(prev => prev.filter(c => c._id !== commentId));
        setTotalComments(prev => Math.max(0, prev - 1));
    };

    const handleUpdateComment = (commentId, newContent) => {
        setComments(prev => prev.map(c => {
            if (c._id === commentId) {
                return { ...c, content: newContent };
            }
            return c;
        }));
    };

    return (
        <section className="comment-section">
            <div className="top-left-navbar-cmts-section">
                <span className="total-comments">
                    {totalComments} Comments
                </span>
            </div>

            {/* Add New Comment Box */}
            <div className="add-new-cmt-section">
                <div className="user-avatar-section">
                    {avatarImage ? (
                        <img src={avatarImage} alt="User avatar" />
                    ) : (
                        <CircleUserRound size={40} color="var(--accent-light, #d9a47c)" />
                    )}
                </div>

                <div className="write-and-post-cmt-section">
                    <form onSubmit={postComment}>
                        <input
                            className="cmt-input-box"
                            placeholder={user ? "Add a public comment..." : "Sign in to join the conversation..."}
                            type="text"
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            onFocus={() => setDisplayPostOptions(true)}
                            disabled={!user}
                        />

                        {displayPostOptions && (
                            <div className="post-options-cmt-section">
                                <div className="add-emoji-section">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(prev => !prev)}
                                        aria-label="Add emoji"
                                    >
                                        <Smile size={20} />
                                    </button>

                                    {showEmojiPicker && (
                                        <div className="emoji-picker-popover">
                                            <EmojiPicker
                                                onEmojiClick={(emojiData) => {
                                                    setUserComment(prev => prev + emojiData.emoji);
                                                }}
                                                theme="dark"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="post-options-section">
                                    <button
                                        className="cancel-post-btn"
                                        type="button"
                                        onClick={() => {
                                            setUserComment("");
                                            setDisplayPostOptions(false);
                                            setShowEmojiPicker(false);
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className={`post-cmt-btn ${userComment.trim() && !postingComment ? "active" : "inactive"}`}
                                        type="submit"
                                        disabled={!userComment.trim() || postingComment}
                                    >
                                        {postingComment ? "Posting..." : "Comment"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {/* Comments List */}
            <div className="comments-grid">
                {comments.map((comment) => (
                    <CommentCard
                        key={comment._id}
                        comment={comment}
                        onDelete={handleDeleteComment}
                        onUpdate={handleUpdateComment}
                    />
                ))}
            </div>

            <div ref={sentinelRef} className="comment-sentinel"></div>

            {loading && (
                <div className="comment-loading-msg">
                    <span>Loading comments...</span>
                </div>
            )}
        </section>
    );
}

export default Comments;
