import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import signInImage from "../../assets/signInPageImage.png";
import { Upload, Image as ImageIcon, Camera } from "lucide-react";
import '../pages-css-files/login.css';

function Register() {
    const navigate = useNavigate();
    const { register, login } = useAuth();

    const [fullName, setFullName] = useState("");
    const [userName, setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState("");

    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim() || !userName.trim() || !email.trim() || !password.trim()) {
            setError("All text fields are required");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!avatarFile) {
            setError("Avatar image is required");
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("fullName", fullName.trim());
            formData.append("userName", userName.trim().toLowerCase());
            formData.append("email", email.trim().toLowerCase());
            formData.append("password", password);
            formData.append("avatarImage", avatarFile);
            if (coverFile) {
                formData.append("coverImage", coverFile);
            }

            const res = await register(formData);
            if (res.success) {
                // Auto login after registration
                try {
                    await login(userName.trim().toLowerCase(), password);
                    navigate('/');
                } catch {
                    navigate('/login');
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="parent-container">
                <form className="credentials-container register-container" onSubmit={handleRegister}>
                    <Link to="/" className="headerName">
                        We<span style={{ color: "var(--accent-secondary, #c68a5c)" }}>Tube</span>
                    </Link>
                    <span className="headerStatement">Create your account</span>

                    <div className="new-user-header">
                        <span className="new-user-header-statment">
                            Already have an account?
                        </span>
                        <Link to="/login" className="sign-up-btn">
                            Sign In
                        </Link>
                    </div>

                    {/* Avatar Upload */}
                    <div className="upload-preview-group">
                        <label className="upload-avatar-label">
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar preview" className="avatar-preview-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <Camera size={22} color="#a96536" />
                                    <span>Avatar *</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleAvatarChange} 
                                style={{ display: 'none' }} 
                            />
                        </label>

                        {/* Optional Cover Upload */}
                        <label className="upload-cover-label">
                            {coverPreview ? (
                                <img src={coverPreview} alt="Cover preview" className="cover-preview-img" />
                            ) : (
                                <div className="cover-placeholder">
                                    <ImageIcon size={20} color="#a96536" />
                                    <span>Cover Banner (optional)</span>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleCoverChange} 
                                style={{ display: 'none' }} 
                            />
                        </label>
                    </div>

                    <input
                        className="email-input-field"
                        placeholder="Full Name (e.g. John Doe)"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />

                    <input
                        className="email-input-field"
                        placeholder="Username (e.g. johndoe)"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        required
                    />

                    <input
                        className="email-input-field"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        className="password-input-field"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <input
                        className="password-input-field"
                        placeholder="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    {error && <p className="login-error">{error}</p>}

                    <button 
                        type="submit" 
                        className="next-btn" 
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>

                    <div style={{ marginTop: "18px", textAlign: "center" }}>
                        <Link to="/" style={{ color: "#888", fontSize: "13px" }}>
                            ← Back to Browse
                        </Link>
                    </div>
                </form>

                <div className="image-container">
                    <img src={signInImage} alt="WeTube video platform" />

                    <div className="image-overlay">
                        <div className="hero-content">
                            <span className="hero-eyebrow">
                                JOIN THE COMMUNITY
                            </span>

                            <h1>
                                Share your voice.
                                <br />
                                Reach the world.
                                <br />
                                <span>Start today.</span>
                            </h1>

                            <p className="hero-description">
                                Upload your content, build an audience, create playlists, and engage
                                with comments and tweets.
                            </p>

                            <div className="hero-footer">
                                <span className="hero-line"></span>
                                <span>Create what inspires you.</span>
                            </div>
                        </div>

                        <div className="hero-brand">
                            W<span>T</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
