import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import signInImage from "../../assets/signInPageImage.png";
import '../pages-css-files/login.css';

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        setError("");

        if (!identifier?.trim() || !password?.trim()) {
            setError("Username or Email and password are required");
            return;
        }

        setLoading(true);
        try {
            await login(identifier, password);
            navigate('/');
        } catch (err) {
            setError(
                err.response?.data?.message || err.message || "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="parent-container">
                <form className="credentials-container" onSubmit={handleLogin}>
                    <Link to="/" className="headerName">
                        We<span style={{ color: "var(--accent-secondary, #c68a5c)" }}>Tube</span>
                    </Link>
                    <span className="headerStatement">Sign in to continue</span>
                    
                    <div className="new-user-header">
                        <span className="new-user-header-statment">
                            Don't have an account?
                        </span>
                        <Link to="/register" className="sign-up-btn">
                            Sign Up
                        </Link>
                    </div>

                    <button 
                        type="button" 
                        className="google-auth-btn"
                        onClick={() => setError("Google login is simulated. Use your username/email.")}
                    >
                        Sign in with Google
                    </button>

                    <div className="or-seprator">or</div>

                    <input
                        className="email-input-field"
                        placeholder="Username or Email address"
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        autoComplete="username"
                        required
                    />

                    <input
                        className="password-input-field"
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                    />

                    {error && <p className="login-error">{error}</p>}

                    <button 
                        type="submit" 
                        className="next-btn" 
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <div style={{ marginTop: "24px", textAlign: "center" }}>
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
                                YOUR WORLD OF VIDEO
                            </span>

                            <h1>
                                Every video.
                                <br />
                                Every story.
                                <br />
                                <span>One place.</span>
                            </h1>

                            <p className="hero-description">
                                Discover videos, share your creativity, and
                                connect with a community that inspires you.
                            </p>

                            <div className="hero-footer">
                                <span className="hero-line"></span>
                                <span>Watch what moves you.</span>
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

export default Login;
