import { MoreVertical } from "lucide-react";
import '../components-css-files/videoCard.css'
import { useNavigate } from "react-router-dom";

// props : key: video._id, {video}: video

function VideoCard(props) {

    const navigate = useNavigate();

    const dateCreated = new Date(props.video.createdAt);
    const videoDate = dateCreated.getDate(), videoMonth = dateCreated.getMonth(), videoYear = dateCreated.getFullYear();
    const today = new Date();
    const todayDate = today.getDate(), todayMonth = today.getMonth(), todayYear = today.getFullYear();
    const yearsDiff = todayYear - videoYear, monthsDiff = todayMonth - videoMonth, dateDiff = todayDate - videoDate;
    const yearsPlurality = yearsDiff === 1 ? "year" : "years";
    const monthPlurality = monthsDiff === 1 ? "month" : "months";
    const datePlurality = dateDiff === 1 ? "day" : "days";
    return (
        <div className="video-section">
            <article className="video-card" onClick={()=> navigate(`/videoPlayPage/${props.video._id}`)}>
                <div className="video-thumbnail">
                    <img src={props.video.thumbnail} alt={props.video.videoTitle} />
                    <span className="video-duration">12:45</span>
                </div>

                <div className="video-details">
                    <img
                        className="channel-avatar"
                        src={props.video.thumbnail}
                        alt="Channel avatar"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/channel/${props.video.owner?._id}`)
                        }}
                    />

                    <div className="video-info">
                        <h3>{props.video?.videoTitle || props.video?.title || "Video title"}</h3>
                        <p 
                            className="channel-name" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/channel/${props.video.owner?._id}`);
                            }}
                        >
                            {props.video?.owner?.username || "Channel name"}
                        
                        </p>
                        <p className="video-stats">120K views · 
                            { yearsDiff !== 0 
                                ? `${yearsDiff} ${yearsPlurality} ago` 
                                    : monthsDiff !== 0 
                                        ? `${monthsDiff} ${monthPlurality} ago` 
                                            :  dateDiff !== 0 
                                                ? `${dateDiff} ${datePlurality} ago` 
                                                    : "Today" 
                        }</p>
                    </div>

                    <button 
                        className="video-menu" 
                        aria-label="More options"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <MoreVertical size={21} />
                    </button>
                </div>
            </article>
        </div>
    )
}

export default VideoCard;