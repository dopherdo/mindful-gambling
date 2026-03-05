import React from "react";
import { useNavigate } from "react-router-dom";

const BJCentralBack = () => {
  const navigate = useNavigate();
  return (
    <button className="bj-central-back" onClick={() => navigate("/")}>
      ← BJ Central
    </button>
  );
};

export default BJCentralBack;
