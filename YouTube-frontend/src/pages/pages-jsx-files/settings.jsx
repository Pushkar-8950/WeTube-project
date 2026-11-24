import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import HomeNavbar from '../../components/components-jsx-files/HomeNavbar';
import HomeSidebar from '../../components/components-jsx-files/HomeSidebar';
import { Camera, Image as ImageIcon, Key, User, Mail, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import '../pages-css-files/settings.css';

function Settings() {
    const { user, updateAccountDetails, updateAvatar, updateCover, changePassword } = useAuth();
    const navigate = useNavigate();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Profile form
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState('');
    const [profileError, setProfileError] = useState('');

    // Password form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Images
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [coverLoading, setCoverLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        if (!fullName.trim() || !email.trim()) {
            setProfileError('All fields are required');
            return;
        }

        setProfileLoading(true);
        try {
            await updateAccountDetails(fullName.trim(), email.trim());
            setProfileSuccess('Profile updated successfully!');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdateAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setAvatarLoading(true);
        try {
            await updateAvatar(file);
            setProfileSuccess('Avatar updated successfully!');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update avatar');
        } finally {
            setAvatarLoading(false);
        }
    };

    const handleUpdateCover = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCoverLoading(true);
        try {
            await updateCover(file);
            setProfileSuccess('Cover image updated successfully!');
        } catch (err) {
            setProfileError(err.response?.data?.message || 'Failed to update cover');
        } finally {
            setCoverLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setPasswordError('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            await changePassword(oldPassword, newPassword, confirmPassword);
            setPasswordSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="settings-page-wrapper">
                <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="settings-login-prompt">
                    <h2>Sign in to customize your channel settings</h2>
                    <p>Manage your profile, banners, and security settings in one place.</p>
                    <Link to="/login" className="settings-btn-primary">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="settings-page-wrapper">
            <HomeNavbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <div className="settings-layout">
                <HomeSidebar isSidebarOpen={isSidebarOpen} />
                
                <main className="settings-main">
                    <header className="settings-header">
                        <h1>Settings & Customization</h1>
                        <p>Manage your channel branding, personal information, and password security.</p>
                    </header>

                    {/* Branding Section (Avatar & Banner) */}
                    <section className="settings-card branding-section">
                        <h2>Channel Branding</h2>
                        <p className="card-subtitle">Personalize your avatar and channel banner.</p>

                        {/* Banner Preview */}
                        <div className="settings-banner-container">
                            {user.coverImage ? (
                                <img src={user.coverImage} alt="Channel Cover" className="settings-banner-img" />
                            ) : (
                                <div className="settings-banner-placeholder">
                                    <span>No banner set yet</span>
                                </div>
                            )}

                            <label className="banner-upload-badge">
                                <ImageIcon size={18} />
                                <span>{coverLoading ? 'Uploading...' : 'Change Banner'}</span>
                                <input type="file" accept="image/*" onChange={handleUpdateCover} style={{ display: 'none' }} />
                            </label>

                            {/* Avatar Overlay */}
                            <div className="settings-avatar-wrapper">
                                <img src={user.avatarImage} alt={user.username} className="settings-avatar-img" />
                                <label className="avatar-upload-overlay" title="Change Avatar">
                                    <Camera size={20} />
                                    <input type="file" accept="image/*" onChange={handleUpdateAvatar} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>

                        <div className="branding-meta">
                            <h3>{user.fullName}</h3>
                            <p>@{user.username}</p>
                            <Link to={`/channel/${user.username}`} className="view-channel-link">
                                View Your Channel →
                            </Link>
                        </div>
                    </section>

                    {/* Account Details Form */}
                    <section className="settings-card">
                        <h2>Personal Details</h2>
                        <p className="card-subtitle">Update your account name and email.</p>

                        {profileSuccess && (
                            <div className="settings-alert success">
                                <CheckCircle2 size={18} />
                                <span>{profileSuccess}</span>
                            </div>
                        )}
                        {profileError && (
                            <div className="settings-alert error">
                                <AlertCircle size={18} />
                                <span>{profileError}</span>
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="settings-form">
                            <div className="form-group">
                                <label><User size={16} /> Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your Full Name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label><Mail size={16} /> Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="yourname@domain.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Username (Permanent)</label>
                                <input
                                    type="text"
                                    value={user.username}
                                    disabled
                                    className="input-disabled"
                                />
                            </div>

                            <button type="submit" className="settings-btn-primary" disabled={profileLoading}>
                                {profileLoading ? 'Saving...' : 'Save Details'}
                            </button>
                        </form>
                    </section>

                    {/* Security & Password Form */}
                    <section className="settings-card">
                        <h2>Security & Password</h2>
                        <p className="card-subtitle">Change your password regularly to keep your channel safe.</p>

                        {passwordSuccess && (
                            <div className="settings-alert success">
                                <CheckCircle2 size={18} />
                                <span>{passwordSuccess}</span>
                            </div>
                        )}
                        {passwordError && (
                            <div className="settings-alert error">
                                <AlertCircle size={18} />
                                <span>{passwordError}</span>
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="settings-form">
                            <div className="form-group">
                                <label><Key size={16} /> Current Password</label>
                                <input
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    placeholder="Enter existing password"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><Shield size={16} /> New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label><Shield size={16} /> Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="settings-btn-primary" disabled={passwordLoading}>
                                {passwordLoading ? 'Updating Password...' : 'Change Password'}
                            </button>
                        </form>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Settings;
