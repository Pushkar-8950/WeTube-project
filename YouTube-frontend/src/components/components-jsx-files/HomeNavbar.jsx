import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UploadModal from "./UploadModal";
import {
    Menu,
    Play,
    Search,
    Mic,
    Plus,
    Bell,
    CircleUserRound,
    User,
    Video,
    Settings as SettingsIcon,
    LogOut,
    LogIn,
    X
} from "lucide-react";
import '../components-css-files/navbar.css';

function HomeNavbar({ toggleSidebar, menuButtonRef }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

    // Initialize search input from URL if on search page
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const q = params.get("q") || params.get("search_query") || "";
        if (q) setSearchQuery(q);
    }, [location.search]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
                setIsProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const handleLogout = async () => {
        setIsProfileMenuOpen(false);
        await logout();
        navigate('/');
    };

    return (
        <>
            <header className="navbar">
                <div className="navbar-left">
                    <button
                        ref={menuButtonRef}
                        className="menu-btn"
                        aria-label="Toggle sidebar"
                        onClick={toggleSidebar}
                    >
                        <Menu size={22} />
                    </button>

                    <Link to="/" className="logo">
                        <div className="logo-icon-wrap">
                            <Play size={18} fill="currentColor" color="currentColor" />
                        </div>
                        <span className="logo-text">
                            We<span className="logo-highlight">Tube</span>
                        </span>
                    </Link>
                </div>

                <form className="navbar-center" onSubmit={handleSearch}>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search videos, creators..."
                            aria-label="Search videos"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="clear-search-btn"
                                onClick={() => setSearchQuery("")}
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                        <button type="submit" className="search-btn" aria-label="Search">
                            <Search size={20} />
                        </button>
                    </div>

                    <button
                        type="button"
                        className="mic-btn"
                        aria-label="Voice search"
                        onClick={() => alert("Voice search is not supported in this browser.")}
                    >
                        <Mic size={20} />
                    </button>
                </form>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <button
                                className="create-btn"
                                onClick={() => setIsUploadOpen(true)}
                                title="Create video"
                            >
                                <Plus size={18} />
                                <span>Create</span>
                            </button>

                            <button className="notification-btn" aria-label="Notifications" title="Notifications">
                                <Bell size={21} />
                            </button>

                            <div className="profile-menu-container" ref={profileMenuRef}>
                                <button
                                    className="profile-btn avatar-btn"
                                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                    aria-label="Open user menu"
                                >
                                    {user.avatarImage ? (
                                        <img src={user.avatarImage} alt={user.username} className="nav-avatar-img" />
                                    ) : (
                                        <CircleUserRound size={26} color="var(--accent-light, #d9a47c)" />
                                    )}
                                </button>

                                {isProfileMenuOpen && (
                                    <div className="profile-dropdown-menu">
                                        <div className="dropdown-user-header">
                                            <img
                                                src={user.avatarImage || "/default-avatar.png"}
                                                alt=""
                                                className="dropdown-avatar"
                                            />
                                            <div className="dropdown-user-info">
                                                <h4>{user.fullName}</h4>
                                                <p>@{user.username}</p>
                                            </div>
                                        </div>

                                        <div className="dropdown-divider" />

                                        <Link
                                            to={`/channel/${user.username}`}
                                            className="dropdown-item"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <User size={18} />
                                            <span>Your Channel</span>
                                        </Link>

                                        <Link
                                            to="/studio"
                                            className="dropdown-item"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <Video size={18} />
                                            <span>Creator Studio</span>
                                        </Link>

                                        <Link
                                            to="/settings"
                                            className="dropdown-item"
                                            onClick={() => setIsProfileMenuOpen(false)}
                                        >
                                            <SettingsIcon size={18} />
                                            <span>Settings</span>
                                        </Link>

                                        <div className="dropdown-divider" />

                                        <button className="dropdown-item logout-btn" onClick={handleLogout}>
                                            <LogOut size={18} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link to="/login" className="nav-signin-btn">
                            <LogIn size={18} />
                            <span>Sign In</span>
                        </Link>
                    )}
                </div>
            </header>

            {/* Video Upload Modal */}
            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadSuccess={() => {
                    navigate('/studio');
                }}
            />
        </>
    );
}

export default HomeNavbar;
