import api from '../../services/api';
import '../components-css-files/commentCard.css'
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* Comment format:
        {
            "_id": "..."
            "content": "Chutiya Chutiya Chutiya",
            "createdAt": "2026-10-29T13:47:59.802Z",
            "updatedAt": "2026-10-29T13:47:59.802Z",
            "__v": 0,
            "ownerDetails": {
                "id": '...',
                "username": "sunil_kumar",
                "avatarImage": "http://res.cloudinary.com/bcplcdtk/image/upload/v1792653606/oyoal5ms2cb5xdo4cyof.png"
            },
            "totalLikes": 0
        }
*/
function CommentCard(props){

    const navigate = useNavigate();

    const formatTime = (value, unit) => {
        return `${value} ${unit}${value !== 1 ? "s" : ""} ago`;
    };

    const getTimeAgo = (createdAt) => {
        const commentTime = new Date(createdAt);
        const currentTime = new Date();

        const diffInMs = currentTime - commentTime;

        const minutes = Math.floor(diffInMs / (1000 * 60));
        const hours = Math.floor(diffInMs / (1000 * 60 * 60));
        const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return formatTime(minutes, "minute");
        if (hours < 24) return formatTime(hours, "hour");
        if (days < 7) return formatTime(days, "day");
        if (weeks < 4) return formatTime(weeks, "week");
        if (months < 12) return formatTime(months, "month");

        return formatTime(years, "year");
    };

    // Like comment 
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(props.comment.totalLikes);
    const likeComment = async () => {

        try {
            const response = await api.patch(`/likes/toggle-comment-like/${props.comment._id}`)
            console.log(response);

            if(response?.data.success){

                if(!liked){
                    setDisliked(false);
                }

                setLiked(prev=>!prev);
                setTotalLikes(prev => liked ? prev-1 : prev+1);


            }
        } catch (error) {
            console.log(error);            
        }
    }

    // Dislike comment : There is no model for dislike comments in backend so adding only the visible CSS
    const [disliked, setDisliked] = useState(false);
    const dislikeComment = () => {
        
        if(liked){
            setLiked(false);
            setTotalLikes(prev=>prev-1);
        } 

        setDisliked(prev=>!prev);
    };

    return(
        <div className="user-comment-card">
            <div 
                className="user-avatar-section" 
                onClick={() => navigate(`/channel/${props.comment.ownerDetails._id}`)}
            >
                <img src={props.comment.ownerDetails.avatarImage} alt='avatar-image'/>
            </div>
            <div className="user-cmt-details-section">
                <div className="username-and-time-section">
                    <span
                        onClick={()=> navigate(`/channel/${props.comment.ownerDetails._id}`)}
                    >{props.comment.ownerDetails.username}</span>
                    <p className="cmt-stats">
                        {getTimeAgo(props.comment.createdAt)}
                    </p>
                </div>
                <span className="cmt-content-section">{props.comment.content}</span> 
                <div className="cmt-reaction-section">
                    <div className="cmt-like-and-likeCount-section">
                        <button className="like-btn" onClick={likeComment}>
                            <ThumbsUp 
                                size={20} 
                                fill={liked ? "white" : "none"}
                                color={liked ? "white" : "currentColor"}
                            />
                        </button>
                        <span className="like-count">{totalLikes}</span>
                    </div>
                    <button className="dislike-btn" onClick={dislikeComment}>
                        <ThumbsDown 
                            size={20} 
                            fill={disliked ? "white" : "none"}
                            color={disliked ? "white" : "currentColor"}
                        />
                    </button>
                    <button className="reply-btn">Reply</button>
                </div>
            </div>
        </div>
    )   
}

export default CommentCard;