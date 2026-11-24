import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import {
  House,
  Clapperboard,
  UserRound,
  History,
  ListVideo,
  ThumbsUp,
  PlaySquare,
  Settings,
  ChevronDown,
  ChevronRight,
  Radio,
  Tv2
} from "lucide-react";
import "../components-css-files/sidebar.css";

function HomeSidebar({ isSidebarOpen }) {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  const [subscriptions, setSubscriptions] = useState([]);
  const [showAllSubs, setShowAllSubs] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (!user?._id) return;
      try {
        const response = await api.get(`/subscriptions/get-subscribed-channels/${user._id}`);
        if (response.data?.success) {
          setSubscriptions(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
      }
    };

    fetchSubscriptions();
  }, [user?._id]);

  const mainLinks = [
    { label: "Home", icon: House, path: "/" },
    { label: "Subscriptions", icon: Tv2, path: "/subscriptions" },
  ];

  const libraryLinks = [
    { label: "Your Channel", icon: UserRound, path: user ? `/channel/${user.username}` : "/login" },
    { label: "History", icon: History, path: "/history" },
    { label: "Playlists", icon: ListVideo, path: "/playlists" },
    { label: "Liked Videos", icon: ThumbsUp, path: "/liked-videos" },
    { label: "Creator Studio", icon: PlaySquare, path: "/studio" },
    { label: "Settings", icon: Settings, path: "/settings" },
  ];

  const isLinkActive = (path) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  const displayedSubs = showAllSubs ? subscriptions : subscriptions.slice(0, 6);

  // Collapsed Sidebar
  if (!isSidebarOpen) {
    return (
      <aside className="sidebar sidebar-collapsed">
        {mainLinks.map(({ label, icon: Icon, path }) => (
          <Link
            to={path}
            key={label}
            className={`collapsed-nav-link ${isLinkActive(path) ? "active" : ""}`}
            title={label}
          >
            <Icon size={22} />
            <span>{label}</span>
          </Link>
        ))}

        <Link
          to={user ? `/channel/${user.username}` : "/login"}
          className={`collapsed-nav-link ${isLinkActive("/channel") ? "active" : ""}`}
          title="You"
        >
          <UserRound size={22} />
          <span>You</span>
        </Link>
      </aside>
    );
  }

  // Expanded Sidebar
  return (
    <aside className="sidebar sidebar-expanded">
      <nav className="sidebar-section">
        {mainLinks.map(({ label, icon: Icon, path }) => (
          <Link
            to={path}
            key={label}
            className={`expanded-nav-link ${isLinkActive(path) ? "active" : ""}`}
          >
            <Icon size={21} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-divider" />

      {/* Subscriptions Section */}
      <nav className="sidebar-section">
        <Link to="/subscriptions" className="sidebar-heading">
          <span>Subscriptions</span>
          <ChevronRight size={16} />
        </Link>

        {displayedSubs.map((sub) => {
          const channel = sub.ChannelDetails || sub;
          return (
            <Link
              to={`/channel/${channel.username}`}
              className="subscription-link"
              key={sub._id || channel.username}
            >
              <img
                className="subscription-avatar"
                src={channel.avatarImage || "/default-avatar.png"}
                alt=""
              />
              <span className="sub-name">{channel.fullName || channel.username}</span>
            </Link>
          );
        })}

        {subscriptions.length === 0 && (
          <p className="sidebar-empty">
            {user ? "No subscriptions yet" : "Sign in to see subscriptions"}
          </p>
        )}

        {subscriptions.length > 6 && (
          <button
            className="sidebar-show-more"
            onClick={() => setShowAllSubs(!showAllSubs)}
          >
            <ChevronDown
              size={18}
              style={{ transform: showAllSubs ? "rotate(180deg)" : "none" }}
            />
            <span>{showAllSubs ? "Show less" : `Show ${subscriptions.length - 6} more`}</span>
          </button>
        )}
      </nav>

      <div className="sidebar-divider" />

      {/* Library Section */}
      <nav className="sidebar-section">
        <div className="sidebar-heading">
          <span>You</span>
        </div>

        {libraryLinks.map(({ label, icon: Icon, path }) => (
          <Link
            to={path}
            key={label}
            className={`expanded-nav-link ${isLinkActive(path) ? "active" : ""}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <footer className="sidebar-footer">
        <p>© 2026 WeTube</p>
        <p className="footer-tagline">Your World of Video</p>
      </footer>
    </aside>
  );
}

export default HomeSidebar;
