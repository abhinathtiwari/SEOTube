import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useSetRecoilState } from "recoil";
import { userEmailState } from "../state/user";
import "../styles/Auth.css";

const MESSAGES = [
  "You focus on video creation, We will take care of the SEO",
  "Boost your reach with AI-powered optimization",
  "Let your underperforming videos shine again",
  "Automated SEO management for creators",
  "Data-driven titles, descriptions, and tags",
  "The ultimate tool for YouTube growth"
];

export default function Auth() {
  const navigate = useNavigate();
  const setEmailState = useSetRecoilState(userEmailState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&]).{6,}$/;
    return regex.test(pass);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignup && !validatePassword(password)) {
      setError("Password must be at least 6 characters, with one uppercase, one lowercase, one number, and one special character.");
      return;
    }

    const url = isSignup ? "/auth/user/signup" : "/auth/user/login";
    try {
      await api.post(url, { email, password });
      if (isSignup) {
        window.location.href = "http://localhost:3000/auth/youtube";
      } else {
        setEmailState(email);
        navigate("/home");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "Authentication failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-page-container">
      {/* Video Section (60%) */}
      <div className="auth-video-section">
        <img src="/clips/video comp.gif" alt="SEO optimization in action" />
        <div className="video-overlay">
          <div className="message-container">
            <h1 key={messageIndex} className="rotating-message">
              {MESSAGES[messageIndex]}
            </h1>
          </div>
        </div>
      </div>

      {/* Form Section (40%) */}
      <div className="auth-form-section">
        <div className="auth-form-card">
          <div className="logo-wrapper">
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, letterSpacing: "-1px" }}>
              SEO<span style={{ color: "red" }}>Tube</span>
            </h2>
          </div>

          <h2>{isSignup ? "Create Account" : "Welcome Back"}</h2>
          <p className="desc">{isSignup ? "Start optimizing your channel today with AI-driven insights." : "Login to manage your optimized videos and track performance."}</p>

          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="auth-input-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="name@example.com"
                  value={email}
                  required
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="auth-input has-icon"
                  placeholder="••••••••"
                  value={password}
                  required
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              {isSignup && (
                <p style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 6 }}>
                  Min 6 chars: 1 Upper, 1 Lower, 1 Number, 1 Special
                </p>
              )}
            </div>

            <button type="submit" className="auth-submit-btn">
              {isSignup ? "Get Started" : "Sign In"}
            </button>
          </form>

          <p className="auth-switch-text">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <span className="auth-switch-link" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Log In" : "Sign Up"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
