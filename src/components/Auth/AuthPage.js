import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { APP_NAME } from "../../config/gameNames";
import "./AuthPage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!username.trim()) {
        setError("Username is required.");
        return;
      }
      if (username.trim().length < 3) {
        setError("Username must be at least 3 characters.");
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
        setError("Username can only contain letters, numbers, and underscores.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await register(email, password, username.trim().toLowerCase());
      } else {
        await login(email, password);
      }
      navigate("/");
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
      navigate("/");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">{APP_NAME}</h1>
        <p className="auth-subtitle">Sign in to track your stats</p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <input
              className="auth-input"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="off"
            />
          )}
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <button className="auth-google" onClick={handleGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48" style={{marginRight: "10px", verticalAlign: "middle"}}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <button className="auth-guest" onClick={() => navigate("/")}>
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
