import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import VideoCard from "../../components/components-jsx-files/videoCard";
import '../pages-css-files/home.css'
import { useRef, useEffect, useState, useCallback } from "react";
import api from "../../services/api";

function Home(){

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleIsSidebarOpen = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // creates an object with .current property
    const sidebarRef = useRef(null);
    const menuButtonRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event){
            if(sidebarRef.current && !sidebarRef.current.contains(event.target) && !menuButtonRef.current?.contains(event.target)){
                setIsSidebarOpen(false);
            }
        }

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);  
    
    /* Implementing infinite scrolling using : IntersectionObserver 
        
        It detects when a particular element enters the user's viewport.
        
        Eg:  { <div ref={sentinelRef}> </div> } -> when this component will enter user's viewport then it will be detected

        syntax: callback -> runs when the observing element enters or leaves the user's viewport 
                options -> controls when and where detection happens
    */
   const [videos, setVideos] = useState([]); 
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);

   const sentinelRef = useRef(); // pointing to the sentinel
   const isFetchingRef = useRef(false);

   // Function for fetching videos for homepage (using callback to persist between renders)
   const fetchVideos = useCallback(async (pageNumber) => {

        if(isFetchingRef.current) return;

        setLoading(true);
        isFetchingRef.current=true;
        try {
            const response = await api.get(`/videos/get-home-videos?page=${pageNumber}&limit=8`);

            console.log(response);
            const newVideos = response.data.data.videos;
            setVideos(prev => [...prev, ...newVideos]);
            setPage(pageNumber + 1);
            setHasMore(newVideos.length === 8)

        } catch (error){
            console.log(error);
        } finally {
            setLoading(false);
            isFetchingRef.current=false;
        }

   }, []);

   // fetch the first page on mount
   useEffect(() => {
        fetchVideos(1);
    }, [fetchVideos]);
   
    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingRef.current && hasMore) {
                    fetchVideos(page);
                }
            },
            {
                threshold: 0,
                rootMargin: "200px"
            }
        );

        if (sentinelRef.current && videos.length > 0) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [loading, page, hasMore, fetchVideos, videos.length]);

    return (
        <div className="youtube-home">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleIsSidebarOpen} menuButtonRef={menuButtonRef}/>
            <div ref={sidebarRef}>
                <HomeSidebar isSidebarOpen={isSidebarOpen}/>
            </div>
            
             <main className="main-content">
                <nav className="category-bar">
                    <button className="active">All</button>
                    <button>Music</button>
                    <button>Gaming</button>
                    <button>Podcasts</button>
                    <button>Technology</button>
                    <button>Recently uploaded</button>
                </nav>

                <section className="video-grid">
                    {videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </section>
                
                {/* Sentinental : After all the videos */}
                <div ref={sentinelRef} className="sentinel"></div>
                {loading && <p style={{ textAlign: "center", padding: "16px", color: "#aaa" }}>Loading more videos...</p>}
            </main>
        </div>
    )
}

export default Home;