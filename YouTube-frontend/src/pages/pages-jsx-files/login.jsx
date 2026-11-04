import React from "react";
import { useState } from "react";
import api from "../../services/api";
import signInImage from "../../assets/signInPageImage.png"
import { useNavigate } from "react-router-dom";
import '../pages-css-files/login.css'
function Login() {

    const navigate = useNavigate();

    const [identiFier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async () => {

        setError("");

        if(!identiFier?.trim() || !password?.trim()){
            setError("Username/Email and password are required");
            return;
        }
        
        let isEmail = false;
        if(identiFier.includes('@')){
            isEmail=true;
        }

        const email = isEmail ? identiFier.trim() : "";
        const username = isEmail ? "" : identiFier.trim();

        setLoading(true);
        try{
            const response = await api.post('/users/login', {
                email, username,
                password
            });

            console.log(response.data);

            if(response.data.success){
                navigate('/');
            }
        } 
        catch(error){
            setError(
                error.response?.data?.message || "Login failed. Please try again."
            );

            console.log(error.response?.data);
        } 
        finally{
            setLoading(false);
        }
    }   
    
    return (
        <div className="login-page">
            
            <div className="parent-container">
                <div className="credentials-container">

                    <span className="headerName">WeTube</span>
                    <span className="headerStatement">Login to your account</span>
                    <div className="new-user-header">
                        <span className="new-user-header-statment">
                            Don't have an account?
                        </span>
                        <button className="sign-up-btn">
                            Sign Up
                        </button>
                    </div>               
                    
                    <button className="google-auth-btn">
                        {/* Google colorful icon */}
                        Google
                    </button>
                    
                    <span className="or-seprator">or</span>

                    <input className="email-input-field" placeholder="Enter email or Username" type="text" value={identiFier} onChange={(e)=> {setIdentifier(e.target.value)}}/>
                    <input className="password-input-field" placeholder="Enter password" type="password" value={password} onChange={(e) => (setPassword(e.target.value))} />
                    {error && <p className="login-error">{error}</p>}
                    <button className="next-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Loading...' : "Next"}
                    </button>

                </div>

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
    )
};

export default Login;