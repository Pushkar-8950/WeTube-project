import {
    Menu,
    Play,
    Search, 
    Mic,
    Plus,
    Bell,
    CircleUserRound
} from "lucide-react";
import '../components-css-files/navbar.css'

function HomeNavbar(props){
    return(
        <div>
            <header className="navbar">
                <div className="navbar-left">
                <button ref={props.menuButtonRef} className="menu-btn" aria-label="Toggle sidebar" onClick={props.toggleSidebar}>
                    <Menu size={24} />
                </button>

                <div className="logo">
                    <Play size={28} fill="#ff0033" color="#ff0033" />
                    <span>WeTube</span>
                </div>
                </div>

                <div className="navbar-center">
                    <input type="text" placeholder="Search" aria-label="Search videos" />

                    <button className="search-btn" aria-label="Search">
                        <Search size={22} />
                    </button>

                    <button className="mic-btn" aria-label="Voice search">
                        <Mic size={21} />
                    </button>
                </div>

                <div className="navbar-right">
                    <button className="create-btn">
                        <Plus size={20} />
                        <span>Create</span>
                    </button>

                    <button className="notification-btn" aria-label="Notifications">
                        <Bell size={22} />
                    </button>

                    <button className="profile-btn" aria-label="Profile">
                        <CircleUserRound size={25} />
                    </button>
                </div>
            </header>
        </div>
    )
}

export default HomeNavbar;