import React from "react";
import { useNavigate } from "react-router-dom";
import "./CardCounter.css";

const CardCounter = () => {
  const navigate = useNavigate();

  return (
    <div className="cc-page">
      <div className="cc-header">
        <button className="back-button" onClick={() => navigate("/")}>← BJ Central</button>
      </div>
      <div className="cc-coming-soon">
        <h1 className="cc-title">Card Counter Trainer</h1>
        <p className="cc-sub">Coming soon.</p>
      </div>
    </div>
  );
};

export default CardCounter;
