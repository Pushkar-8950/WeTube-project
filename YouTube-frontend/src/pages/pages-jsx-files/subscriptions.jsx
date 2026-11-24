import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import HomeNavbar from "../../components/components-jsx-files/HomeNavbar";
import HomeSidebar from "../../components/components-jsx-files/HomeSidebar";
import { Tv2, Bell, Check, CircleUserRound, AlertCircle } from "lucide-react";
import "../pages-css-files/subscriptions.css";

function SubscriptionsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubscriptions = async () => {
        if (!user?._id) {
            setLoading(false);
            return;
        }

        try {
            const res = await api.get(`/subscriptions/get-subscribed-channels/${user._id}`);
            if (res.data?.success) {
                setSubscriptions(res.data.data || []);
            }
        } catch (err) {
            console.error("Failed to load subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, [user?._id]);

    const handleToggleSub = async (channelId) => {
        try {
            await api.patch(`/subscriptions/toggle/${channelId}`);
            setSubscriptions(prev => prev.filter(sub => {
                const id = sub.channel || sub.ChannelDetails?._id || sub._id;
                return id !== channelId;
            }));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update subscription");
        }
    };

    if (!user) {
        return (
            <div className="subs-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="subs-login-prompt">
                    <Tv2 size={48} color="var(--accent-secondary, #c68a5c)" />
                    <h2>Don't miss new videos</h2>
                    <p>Sign in to see updates from your favorite YouTube creators.</p>
                    <Link to="/login" className="subs-primary-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="subs-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <div className="subs-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />

                <main className="subs-main">
                    <header className="subs-header">
                        <h2>Subscriptions</h2>
                        <span className="subs-count">{subscriptions.length} channels</span>
                    </header>

                    {loading ? (
                        <div className="subs-loading">Loading subscribed channels...</div>
                    ) : subscriptions.length > 0 ? (
                        <div className="subs-grid">
                            {subscriptions.map((item) => {
                                const channel = item.ChannelDetails || item;
                                const channelId = item.channel || channel._id;

                                return (
                                    <div key={item._id || channel.username} className="sub-channel-card">
                                        <div
                                            className="sub-card-avatar-wrap"
                                            onClick={() => navigate(`/channel/${channel.username}`)}
                                        >
                                            {channel.avatarImage ? (
                                                <img src={channel.avatarImage} alt={channel.username} className="sub-card-avatar" />
                                            ) : (
                                                <CircleUserRound size={60} color="var(--accent-light, #d9a47c)" />
                                            )}
                                        </div>

                                        <div className="sub-card-info" onClick={() => navigate(`/channel/${channel.username}`)}>
                                            <h3>{channel.fullName || channel.username}</h3>
                                            <p>@{channel.username}</p>
                                        </div>

                                        <button
                                            className="btn-unsub"
                                            onClick={() => handleToggleSub(channelId)}
                                            title="Unsubscribe from channel"
                                        >
                                            <Check size={16} />
                                            <span>Subscribed</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="subs-empty">
                            <Tv2 size={48} color="var(--accent-secondary, #c68a5c)" />
                            <h3>No subscriptions yet</h3>
                            <p>Subscribe to channels to stay up to date with their latest videos.</p>
                            <Link to="/" className="subs-primary-btn">Explore Channels</Link>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default SubscriptionsPage;
