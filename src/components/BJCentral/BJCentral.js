import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./BJCentral.css";

const BJCentral = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="bjcentral-page">
      <div className="bjcentral-top">
        {currentUser ? (
          <button className="bjcentral-nav" onClick={() => navigate("/profile")}>
            {currentUser.displayName || "Profile"}
          </button>
        ) : (
          <button className="bjcentral-nav" onClick={() => navigate("/auth")}>
            Sign In
          </button>
        )}
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
