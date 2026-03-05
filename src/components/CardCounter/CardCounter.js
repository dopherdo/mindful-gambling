import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./CardCounter.css";
import BJCentralBack from "../BJCentralBack/BJCentralBack";

const CardCounter = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="cc-page">
      <BJCentralBack />
      {currentUser && (
        <button className="profile-icon-btn" onClick={() => navigate("/profile")} title={currentUser.displayName || "Profile"}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </button>
      )}
      <div className="cc-coming-soon">
        <h1 className="cc-title">Card Counter Trainer</h1>
        <p className="cc-sub">Coming soon.</p>
      </div>
    </div>
  );
};

export default CardCounter;
