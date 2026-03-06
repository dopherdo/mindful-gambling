import React from "react";
import { useNavigate } from "react-router-dom";

const BJCentralBack = () => {
  const navigate = useNavigate();
  return (
    <button className="bj-central-back" onClick={() => navigate("/")} aria-label="Back">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
  );
};

export default BJCentralBack;
