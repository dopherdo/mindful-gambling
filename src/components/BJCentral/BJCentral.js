import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { APP_NAME, GAMES } from "../../config/gameNames";
import { useTransitionNavigate } from "../PageTransition/PageTransition";
import Logo from "../Logo/Logo";
import "./BJCentral.css";

const BJCentral = () => {
  const navigate = useNavigate();
  const transitionNav = useTransitionNavigate();
  const { currentUser, login, register, loginWithGoogle } = useAuth();

  // Popup state: "signin" | "warning" | null
  const [popup, setPopup] = useState(() => currentUser ? null : "signin");

  // Auth form state
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const friendlyError = (code) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "An account with this email already exists.";
      case "auth/weak-password":
        return "Password must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "username-taken":
        return "This username is already taken.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!username.trim()) { setError("Username is required."); return; }
      if (username.trim().length < 3) { setError("Username must be at least 3 characters."); return; }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) { setError("Username can only contain letters, numbers, and underscores."); return; }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, username.trim().toLowerCase());
      } else {
        await login(email, password);
      }
      setPopup(null);
    } catch (err) {
      setError(friendlyError(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      setPopup(null);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const dismissToWarning = () => {
    setPopup("warning");
  };

  const dismissWarning = () => {
    setPopup(null);
  };

  return (
    <div className="bjcentral-page">
      <div className="bjcentral-topbar">
        <div className="bjcentral-topbar-right">
          {currentUser ? (
            <button className="profile-icon-btn" onClick={() => navigate("/profile")} title="Profile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </button>
          ) : (
            <button className="bjcentral-nav" onClick={() => setPopup("signin")}>
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="bjcentral-hero">
        <Logo size={72} animate />
        <h1 className="bjcentral-title">{APP_NAME}</h1>
        <p className="bjcentral-sub">Your blackjack hub</p>
      </div>

      <div className="bjcentral-modes">
        <button className="mode-card" onClick={() => transitionNav(GAMES.cardCounter.path)}>
          <h2 className="mode-title">{GAMES.cardCounter.name}</h2>
          <p className="mode-desc">{GAMES.cardCounter.desc}</p>
        </button>

        <button className="mode-card" onClick={() => transitionNav(GAMES.mindful.path)}>
          <h2 className="mode-title">{GAMES.mindful.name}</h2>
          <p className="mode-desc">{GAMES.mindful.desc}</p>
        </button>
      </div>

      <button className="bjcentral-achievements" onClick={() => transitionNav("/achievements")}>
        Achievements
      </button>

      {/* ── Sign-in popup ────────────────────────────────────────────────── */}
      {popup === "signin" && (
        <div className="bjc-overlay" onClick={dismissToWarning}>
          <div className="bjc-popup" onClick={(e) => e.stopPropagation()}>
            <button className="bjc-popup-close" onClick={dismissToWarning} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="bjc-popup-title">Welcome to {APP_NAME}</h2>
            <p className="bjc-popup-sub">Sign in to track your stats and compete</p>

            <div className="bjc-auth-tabs">
              <button
                className={`bjc-auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Sign In
              </button>
              <button
                className={`bjc-auth-tab ${mode === "register" ? "active" : ""}`}
                onClick={() => { setMode("register"); setError(""); }}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="bjc-auth-form">
              {mode === "register" && (
                <input
                  className="bjc-auth-input"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              )}
              <input
                className="bjc-auth-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="bjc-auth-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              {error && <p className="bjc-auth-error">{error}</p>}

              <button type="submit" className="bjc-auth-submit" disabled={loading}>
                {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="bjc-auth-divider"><span>or</span></div>

            <button className="bjc-auth-google" onClick={handleGoogle} disabled={loading}>
              <svg width="16" height="16" viewBox="0 0 48 48" style={{marginRight: "8px", verticalAlign: "middle"}}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <button className="bjc-auth-guest" onClick={dismissToWarning}>
              Continue as Guest
            </button>
          </div>
        </div>
      )}

      {/* ── Guest warning popup ──────────────────────────────────────────── */}
      {popup === "warning" && (
        <div className="bjc-overlay" onClick={dismissWarning}>
          <div className="bjc-popup bjc-popup-sm" onClick={(e) => e.stopPropagation()}>
            <h2 className="bjc-popup-title">Playing as Guest</h2>
            <p className="bjc-warning-body">
              Without an account, your leaderboard rankings, achievements, and balance will not be saved or tracked across sessions.
            </p>
            <div className="bjc-warning-actions">
              <button className="bjc-warning-signin" onClick={() => setPopup("signin")}>
                Sign In Instead
              </button>
              <button className="bjc-warning-continue" onClick={dismissWarning}>
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BJCentral;
