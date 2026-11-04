import { ListSortDescending } from "lucide-react";
import CommentCard from "./commentCard";
import api from "../../services/api";
import { useRef, useState, useCallback, useEffect } from "react";
import '../components-css-files/commentSection.css' 
import EmojiPicker from "emoji-picker-react"
import { Smile, CircleUserRound } from "lucide-react";
import {useNavigate} from "react-router-dom"

// props -> video ID, avatarImage of user watching video (current - user)

function Comments(props){

    const navigate = useNavigate();

    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalComments, setTotalComments] = useState(0);

    const sentinelRef = useRef();
    const isFetchingRef = useRef(false);

    // Fetch comments on this video (using callback to avoid recreation of function on every render)
    const fetchComments = useCallback(async (pageNumber) => {

        if(isFetchingRef.current) return;

        setLoading(true);
        isFetchingRef.current = true;

        try {

            const response = await api.get(`/comments/${props.videoId}?page=${pageNumber}&limit=8`);

            console.log(response);

            const newComments = response.data.data[0].comments;

            setTotalComments(response.data.data.totalComments);
            setComments(comments => [...comments, ...newComments]);
            setPage(pageNumber + 1);
            setHasMore(newComments.length === 8);

        } catch (error) {

            console.log(error);

        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }

    }, [props.videoId]);


    // fetch the first page on mount or when videoId changes
    useEffect(() => {

        setComments([]);
        setPage(1);
        setHasMore(true);
        setTotalComments(0);

        fetchComments(1);

    }, [fetchComments]);

    // infinite scrolling (bringing data in chunks from backend)
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
                    fetchComments(page);
                }
            },
            {
                threshold: 0,
                rootMargin: "200px"
            }
        );

        if (sentinelRef.current && comments.length > 0) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loading, page, hasMore, fetchComments, comments.length]);

    // Comment input variables
    const [userComment, setUserComment] = useState("");
    const [displayPostOptions, setDisplayPostOptions] = useState(false);

    // Cancel - button functionalities
    const cancelComment = () => {

        setUserComment("");
        setDisplayPostOptions(false);

    }

    // Post comment section
    const [postingComment, setPostingCommment] = useState(false);
    const postComment = async() => {
        
        try {
            setPostingCommment(true);
            const response = await api.post(`/comments/${props.videoId}`, 
                {
                    content: userComment
                }
            )

            console.log(response);
            setPostingCommment(false);
            setUserComment("");

        } catch (error) {
            console.log(error);
        }
    }

    // emoji section
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    return(
        <div className="comment-section">

            <div className="top-left-navbar-cmts-section">

                <span className="total-comments">
                    {totalComments} Comments
                </span>

                {/* Keep one of these icons */}
                <ListSortDescending size={20} />

            </div>


            <div className="add-new-cmt-section">

                <div className="user-avatar-section">
                    {props.avatarImage?.length ? <img src={props.avatarImage} alt="User avatar" /> : <CircleUserRound size={38}/>}
                </div>

                <div className="write-and-post-cmt-section">

                    <div className="write-cmt-section">
                        <input 
                            className="cmt-input-box" 
                            placeholder="Add a comment..." 
                            type="text"
                            value={userComment}
                            onChange={(e) => (setUserComment(e.target.value))}
                            onClick={(e) => (setDisplayPostOptions(true))}
                        />
                    </div>

                    { displayPostOptions && 
                        <div className="post-options-cmt-section">

                            <div className="add-emoji-section">
                                <button type="button" onClick={() => setShowEmojiPicker(prev => !prev)}>
                                    <Smile size={22} />
                                </button>

                                {showEmojiPicker && (
                                    <EmojiPicker
                                        onEmojiClick={(emojiData) => {
                                            setUserComment(prev => prev + emojiData.emoji);
                                        }}
                                        theme="dark"
                                    />
                                )}
                            </div>
        
                            <div className="post-options-section">

                                <button className="cancel-post-btn" type="button" onClick={cancelComment}>cancel
                                </button>

                                <button 
                                    className={`post-cmt-btn ${userComment.trim() && !postingComment ? "active" : "inactive"}`} 
                                    type="button" 
                                    onClick={postComment} 
                                    disabled={!userComment.trim() || postingComment}>comment
                                </button>

                            </div>
                            

                        </div>
                    }

                </div>

            </div>


            <section className="comments-grid">

                {comments.map(comment => (
                    <CommentCard key={comment._id} comment={comment} />
                ))}

            </section>


            {/* Sentinel : after all the loaded comments */}
            <div ref={sentinelRef} className="comment-sentinel"></div>

            {loading && (
                <p style={{textAlign: "center", padding: "16px", color:"#aaa"}}>
                    Loading more comments
                </p>
            )}

        </div>
    )
}

export default Comments;