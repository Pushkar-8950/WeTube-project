import Comments from "../../components/components-jsx-files/commentSection";
import api from "../../services/api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
const VideoPlayPage = () => {
    
    const {videoId} = useParams();

    // Fetch current user details watching video
    const [loginError, setLoginError] = useState(false);
    const [fetchingCurrentUserDetails, setFetchingCurrentUserDetails] = useState(false);
    const [avatrImage, setAvatarImage] = useState("");

    const fetchCurrentUser = async () => {

        setFetchingCurrentUserDetails(true);
        try {

            const userDetails = await api.post('/users/get-current-user');
            
            if (!userDetails.data?.data) {
                setLoginError(true);
                return;
            }

            setAvatarImage(userDetails.data.data.avatrImage);

        } catch (error) {
            console.log("Error while fetching currnt user details : ", error);
        } finally{
            setFetchingCurrentUserDetails(false);
        }
    }

    useEffect(()=>{
        fetchCurrentUser();
    }, []);

    return(
        <div>
            {!fetchingCurrentUserDetails && <Comments videoId={videoId} avatarImage={avatrImage}/>}
        </div>
    )
}

export default VideoPlayPage;