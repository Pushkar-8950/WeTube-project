import {
  House,
  Clapperboard,
  PanelsTopLeft,
  UserRound,
  History,
  ListVideo,
  Clock,
  ThumbsUp,
  PlaySquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import "../components-css-files/sidebar.css";

function HomeSidebar({ isSidebarOpen, subscriptions = [] }) {
  const mainLinks = [
    { label: "Home", icon: House, path: "/" },
    { label: "Shorts", icon: Clapperboard, path: "/shorts" },
  ];

  const libraryLinks = [
    { label: "Your channel", icon: UserRound, path: "/channel" },
    { label: "History", icon: History, path: "/history" },
    { label: "Playlists", icon: ListVideo, path: "/playlists" },
    { label: "Watch later", icon: Clock, path: "/watch-later" },
    { label: "Liked videos", icon: ThumbsUp, path: "/liked-videos" },
    { label: "Your videos", icon: PlaySquare, path: "/your-videos" },
  ];

  if (!isSidebarOpen) {
    return (
      <aside className="sidebar sidebar-collapsed">
        {mainLinks.map(({ label, icon: Icon, path }) => (
          <a href={path} key={label} title={label} aria-label={label}>
            <Icon size={23} />
            <span>{label}</span>
          </a>
        ))}

        <a href="/you" title="You" aria-label="You">
          <UserRound size={23} />
          <span>You</span>
        </a>
      </aside>
    );
  }

  return (
    <aside className="sidebar sidebar-expanded">
      <nav className="sidebar-section">
        {mainLinks.map(({ label, icon: Icon, path }) => (
          <a href={path} key={label}>
            <Icon size={23} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-section">
        <a href="/subscriptions" className="sidebar-heading">
          <span>Subscriptions</span>
          <ChevronRight size={18} />
        </a>

        {subscriptions.map((channel) => (
          <a
            href={`/channel/${channel._id}`}
            className="subscription-link"
            key={channel._id}
          >
            <img
              className="subscription-avatar"
              src={channel.avatar || "/default-avatar.png"}
              alt=""
            />
            <span>{channel.name}</span>
          </a>
        ))}

        {subscriptions.length === 0 && (
          <p className="sidebar-empty">No subscriptions yet</p>
        )}
      </nav>

      <div className="sidebar-divider" />

      <nav className="sidebar-section">
        <a href="/you" className="sidebar-heading">
          <span>You</span>
          <ChevronRight size={18} />
        </a>

        {libraryLinks.map(({ label, icon: Icon, path }) => (
          <a href={path} key={label}>
            <Icon size={22} />
            <span>{label}</span>
          </a>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <button className="sidebar-show-more">
        <ChevronDown size={20} />
        <span>Show more</span>
      </button>
    </aside>
  );
}

export default HomeSidebar;