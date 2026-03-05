import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./BJCentral.css";

const BJCentral = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="bjcentral-page">
      <div className="bjcentral-topbar">
        <div className="bjcentral-topbar-right">
          {currentUser ? (
            <button className="profile-icon-btn" onClick={() => navigate("/profile")} title={currentUser.displayName || "Profile"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </button>
          ) : (
            <button className="bjcentral-nav" onClick={() => navigate("/auth")}>
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="bjcentral-hero">
        <h1 className="bjcentral-title">BJ Central</h1>
        <p className="bjcentral-sub">Your blackjack hub</p>
      </div>

      <div className="bjcentral-modes">
        <button className="mode-card" onClick={() => navigate("/card-counter")}>
          <h2 className="mode-title">Card Counter Trainer</h2>
          <p className="mode-desc">Practice hi-lo counting and sharpen your edge.</p>
        </button>

        <button className="mode-card" onClick={() => navigate("/mindful")}>
          <h2 className="mode-title">Mindful Gambling</h2>
          <p className="mode-desc">Play with awareness. Break the chase cycle.</p>
        </button>
      </div>
    </div>
  );
};

export default BJCentral;
